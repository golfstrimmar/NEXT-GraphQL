import express from "express";
import cors from "cors";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { execute, subscribe } from "graphql";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createYoga } from "graphql-yoga";

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || "secret";

const typeDefs = `
  type User {
    id: ID!
    email: String!
    name: String
    isLoggedIn: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    users: [User!]!
    loggedInUsers: [User!]!
  }

  type Mutation {
    createUser(email: String!, name: String, password: String!): User!
    loginUser(email: String!, password: String!): String! 
    logoutUser(userId: ID!): Boolean!

  }

  type Subscription {
    userCreated: User!
    userLoggedIn: User!
    userLoggedOut: User!
  }
`;
const listeners = [];
const loginListeners = [];
const logoutListeners = [];

const schema = makeExecutableSchema({
  typeDefs,
  resolvers: {
    Query: {
      users: async () => prisma.user.findMany(),
      loggedInUsers: async () =>
        prisma.user.findMany({ where: { isLoggedIn: true } }),
    },
    Mutation: {
      createUser: async (_, { email, name, password }) => {
        console.log("<===== createUser =====>", email, name);
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const user = await prisma.user.create({
          data: { email, name, password: hashedPassword, isLoggedIn: false },
        });
        console.log("<====user created====>", user);
        listeners.forEach((fn) => fn(user));
        return user;
      },
      loginUser: async (_, { email, password }) => {
        console.log("<===== loginUser =====>", email);
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          throw new Error("Пользователь не найден");
        }
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          throw new Error("Неверный пароль");
        }
        // Обновляем статус логина
        const updatedUser = await prisma.user.update({
          where: { email },
          data: { isLoggedIn: true },
        });
        // Генерируем JWT токен
        const token = jwt.sign(
          { userId: user.id, email: user.email },
          JWT_SECRET,
          { expiresIn: "1h" }
        );
        console.log("<====user logged in====>", updatedUser);
        loginListeners.forEach((fn) => fn(updatedUser));
        return token;
      },
      logoutUser: async (_, { userId }) => {
        console.log("<===== logoutUser =====>", Number(userId));
        console.log("<=====typeof logoutUser =====>", typeof Number(userId));

        const user = await prisma.user.findUnique({
          where: { id: Number(userId) },
        });
        console.log("<====user logout====>", user);
        if (!user || !user.isLoggedIn) {
          throw new Error("User not found or already logged out");
        }

        const updatedUser = await prisma.user.update({
          where: { id: Number(userId) },
          data: { isLoggedIn: false },
        });

        console.log("<====user logged out====>", updatedUser);
        logoutListeners.forEach((fn) => fn(updatedUser));
        return true;
      },
    },
    Subscription: {
      userCreated: {
        subscribe: async function* () {
          while (true) {
            const user = await new Promise((resolve) =>
              listeners.push(resolve)
            );
            yield { userCreated: user };
          }
        },
      },
      userLoggedIn: {
        subscribe: async function* () {
          while (true) {
            const user = await new Promise((resolve) =>
              loginListeners.push(resolve)
            );
            yield { userLoggedIn: user };
          }
        },
      },
      userLoggedOut: {
        subscribe: async function* () {
          while (true) {
            const user = await new Promise((resolve) =>
              logoutListeners.push(resolve)
            );
            yield { userLoggedOut: user };
          }
        },
      },
    },
    User: {
      createdAt: (user) => user.createdAt.toISOString(),
      updatedAt: (user) => user.updatedAt.toISOString(),
    },
  },
});

const yoga = createYoga({
  schema,
  graphqlEndpoint: "/graphql",
  graphiql: true,
});

const app = express();
app.use(cors({ origin: "http://localhost:3001" }));
app.use("/graphql", yoga);

const httpServer = createServer(app);
const wsServer = new WebSocketServer({ server: httpServer, path: "/graphql" });

SubscriptionServer.create(
  {
    schema,
    execute,
    subscribe,
    onConnect: () =>
      console.log(
        `🌐 WebSocket соединение установлено: ${new Date().toLocaleString()}`
      ),
    onDisconnect: () => console.log("🔌 Клиент отключился от WebSocket"),
    onOperation: (msg, params) => {
      // console.log(
      //   "onOperation вызван, сообщение:",
      //   JSON.stringify(msg, null, 2)
      // );
      return params;
    },
  },
  wsServer
);

httpServer.listen(4000, () =>
  console.log("🚀🚀🚀 Server ready at http://localhost:4000 🚀🚀🚀")
);
