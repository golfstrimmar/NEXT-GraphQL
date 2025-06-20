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
import { OAuth2Client } from "google-auth-library";

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || "secret";
const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID ||
  "your-google-client-id.apps.googleusercontent.com";
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

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
    googleLogin(idToken: String!): AuthPayload!
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
        loginListeners.forEach((fn) => fn(updatedUser));
        return {
          id: String(updatedUser.id),
          email: updatedUser.email,
          name: updatedUser.name,
          token,
          isLoggedIn: updatedUser.isLoggedIn,
          createdAt: updatedUser.createdAt.toISOString(),
        };
      },
      googleLogin: async (_, { idToken }) => {
        console.log("<===== googleLogin =====>");
        try {
          const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: GOOGLE_CLIENT_ID,
          });
          const payload = ticket.getPayload();
          if (!payload) {
            throw new Error("Invalid Google token");
          }

          const { email, name } = payload;
          if (!email) {
            throw new Error("Email not provided by Google");
          }

          let user = await prisma.user.findUnique({ where: { email } });
          if (!user) {
            user = await prisma.user.create({
              data: {
                email,
                name,
                password: "", // Пустой пароль, так как используется Google
                isLoggedIn: true,
              },
            });
            console.log("<====user created via Google====>", user);
            listeners.forEach((fn) => fn(user));
          } else {
            user = await prisma.user.update({
              where: { email },
              data: { isLoggedIn: true, name: name || user.name },
            });
          }

          const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: "1h" }
          );
          console.log("<====user logged in via Google====>", user);
          loginListeners.forEach((fn) => fn(user));
          return {
            id: String(user.id),
            email: user.email,
            name: user.name,
            token,
            isLoggedIn: user.isLoggedIn,
            createdAt: user.createdAt.toISOString(),
          };
        } catch (err) {
          console.error("Google login error:", err);
          throw new Error("Failed to authenticate with Google");
        }
      },
      logoutUser: async (_, __, { token }) => {
        console.log("Authorization header:", token);
        if (!token) {
          throw new Error("Token not provided");
        }
        let decoded;
        try {
          decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
          throw new Error("Invalid token");
        }
        const userId = Number(decoded.userId);
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.isLoggedIn) {
          throw new Error("User not found or already logged out");
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
app.use(
  cors({
    origin: [
      "http://localhost:3001",
      process.env.FRONTEND_URL || "https://chat-next-graph.vercel.app",
    ],
  })
);
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
        `🌐 WebSocket connection established: ${new Date().toLocaleString()}`
      );
      return { token: connectionParams.authorization?.replace("Bearer ", "") };
    },
    onDisconnect: () => console.log("🔌 Client disconnected from WebSocket"),
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

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () =>
  console.log(`🚀🚀🚀 Server ready at http://localhost:${PORT} 🚀🚀🚀`)
);
