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
  type AuthPayload {
    id: ID!
    email: String!
    name: String
    token: String!
    isLoggedIn: Boolean!
    createdAt: String!
  }
    
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
    loginUser(email: String!, password: String!): AuthPayload!
    logoutUser: Boolean!
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
          throw new Error("User not found");
        }
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          throw new Error("Invalid password");
        }
        const updatedUser = await prisma.user.update({
          where: { email },
          data: { isLoggedIn: true },
        });
        const token = jwt.sign(
          { userId: user.id, email: user.email },
          JWT_SECRET,
          { expiresIn: "1h" }
        );
        console.log("<====user logged in====>", updatedUser);
        loginListeners.forEach((fn) => {
          fn(updatedUser);
        });
        return {
          id: String(updatedUser.id),
          email: updatedUser.email,
          name: updatedUser.name,
          token,
          isLoggedIn: updatedUser.isLoggedIn,
          createdAt: updatedUser.createdAt.toISOString(),
        };
      },
      logoutUser: async (_, __, { token }) => {
        if (!token) {
          throw new Error("Токен не предоставлен");
        }
        let decoded;
        try {
          decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
          throw new Error("Недействительный токен");
        }
        const userId = Number(decoded.userId);
        const user = await prisma.user.findUnique({
          where: { id: userId },
        });
        if (!user || !user.isLoggedIn) {
          throw new Error("Пользователь не найден или уже вышел");
        }
        const updatedUser = await prisma.user.update({
          where: { id: userId },
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
      id: (user) => String(user.id),
      createdAt: (user) => user.createdAt.toISOString(),
      updatedAt: (user) => user.updatedAt.toISOString(),
    },
    AuthPayload: {
      id: (payload) => String(payload.id),
    },
  },
});

const yoga = createYoga({
  schema,
  graphqlEndpoint: "/graphql",
  graphiql: true,
  context: ({ request }) => ({
    token: request.headers.get("authorization")?.replace("Bearer ", ""),
  }),
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
    onConnect: (connectionParams) => {
      console.log(
        `🌐 WebSocket соединение установлено: ${new Date().toLocaleString()}`
      );
      return { token: connectionParams.authorization?.replace("Bearer ", "") };
    },
    onDisconnect: () => console.log("🔌 Клиент отключился от WebSocket"),
    onOperation: (msg, params, ws) => {
      return {
        ...params,
        context: {
          token: ws.upgradeReq.headers.authorization?.replace("Bearer ", ""),
        },
      };
    },
  },
  wsServer
);

next-graphql-production.up.railway.app


httpServer.listen(4000, () =>
  console.log("🚀🚀🚀 Server ready at http://localhost:4000 🚀🚀🚀")
);
