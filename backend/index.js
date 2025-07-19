import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import express from "express";
import { createServer } from "http";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/use/ws";
import bodyParser from "body-parser";
import cors from "cors";
<<<<<<< HEAD
import { verifyToken } from "./utils/verifyToken.js";

import resolvers from "./resolvers/index.js";
import typeDefs from "./schema.js";

const PORT = 4000;

let currentNumber = 0;
const activeSubscriptions = new Map();
=======
import jwt from "jsonwebtoken";
import prisma from "./utils/prismaClient.js";
import dotenv from "dotenv";
import resolvers from "./resolvers/index.js";
import typeDefs from "./schema.js";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";
dotenv.config();

>>>>>>> simple
const schema = makeExecutableSchema({ typeDefs, resolvers });
const app = express();
const httpServer = createServer(app);

const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/graphql",
});

const serverCleanup = useServer(
  {
    schema,

<<<<<<< HEAD
    context: async (ctx, msg, args) => {
      const authHeader = ctx.connectionParams?.headers?.Authorization || "";
      const token = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : null;
      const user = token ? verifyToken(token) : null;

      return { user };
    },

    onConnect: async (ctx) => {
      console.log("📡 Client connected +");
    },

    onDisconnect: async (ctx, code, reason) => {
      const clientId =
        ctx.extra.request.headers["sec-websocket-key"] ||
        ctx.extra.request.socket.remoteAddress;
      console.log(`⚠️ Client disconnected (${code}: ${reason})`);
      activeSubscriptions.delete(clientId);
    },

    onSubscribe: async (ctx, msg) => {
      const clientId =
        ctx.extra.request.headers["sec-websocket-key"] ||
        ctx.extra.request.socket.remoteAddress;
      const operationName = msg?.payload?.operationName || "UnnamedOperation";

      const authHeader = ctx.connectionParams?.headers?.Authorization || "";
      const token = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : null;
      const user = token ? verifyToken(token) : null;
      const userId = user?.userId || "anonymous";

      if (!activeSubscriptions.has(clientId)) {
        activeSubscriptions.set(clientId, { userId, operations: new Set() });
      }

      const connData = activeSubscriptions.get(clientId);
      connData.operations.add(operationName);

      // console.log(`🧷 Subscribed: ${operationName} by userId=${userId}`);
    },

    onComplete: async (ctx, msg) => {
      const clientId =
        ctx.extra.request.headers["sec-websocket-key"] ||
        ctx.extra.request.socket.remoteAddress;
      const operationName = msg?.payload?.operationName || "UnnamedOperation";

      const connData = activeSubscriptions.get(clientId);
      if (connData) {
        connData.operations.delete(operationName);
        // console.log(
        //   `❌ Unsubscribed: ${operationName} by userId=${connData.userId}`
        // );
      }
=======
    context: async (ctx) => {
      const authHeader =
        ctx.connectionParams?.Authorization ||
        ctx.connectionParams?.headers?.Authorization ||
        "";
      const token = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : null;

      if (!token) return { user: null };

      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return { user: decoded };
      } catch (error) {
        if (error.name === "TokenExpiredError") {
          const decodedExpired = jwt.decode(token);
          if (decodedExpired?.userId) {
            await prisma.user.update({
              where: { id: decodedExpired.userId },
              data: { isLoggedIn: false },
            });
          }
        }
        return { user: null }; // Просто возвращаем null для WebSocket без падения
      }
    },

    onConnect: () => {
      console.log("📡 WebSocket client connected");
    },

    onDisconnect: () => {
      console.log("⚠️ WebSocket client disconnected");
>>>>>>> simple
    },
  },
  wsServer
);

const server = new ApolloServer({
  schema,
<<<<<<< HEAD
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),

=======
  introspection: true,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
>>>>>>> simple
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
});

await server.start();
<<<<<<< HEAD
app.use(
  "/graphql",
  cors(),
=======

app.use(
  "/graphql",
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
>>>>>>> simple
  bodyParser.json(),
  expressMiddleware(server, {
    context: async ({ req }) => {
      const auth = req.headers.authorization || "";
<<<<<<< HEAD
      // console.log("🛡️ Authorization header:", auth); // <-- Лог заголовка

      const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
      const decoded = token ? verifyToken(token) : null;

      // console.log("🧾 Decoded token payload:", decoded); // <-- Лог результата верификации

      return {
        user: decoded,
        userId: decoded?.userId,
      };
    },
  })
);

httpServer.listen(PORT, () => {
  console.log(`🚀 Query endpoint ready at http://localhost:${PORT}/graphql `);
  console.log(
    `🚀 Subscription endpoint ready at ws://localhost:${PORT}/graphql `
=======
      const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

      if (!token) {
        return { user: null, userId: null };
      }

      try {
        // const decoded = jwt.verify(token, JWT_SECRET);
        // return {
        //   user: decoded,
        //   userId: decoded.userId,
        // };

        const decoded = jwt.verify(token, JWT_SECRET);

        const dbUser = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { isLoggedIn: true },
        });

        if (!dbUser || !dbUser.isLoggedIn) {
          throw new Error("UserLoggedOut");
        }

        return {
          user: decoded,
          userId: decoded.userId,
        };
      } catch (error) {
        if (error.name === "TokenExpiredError") {
          const decodedExpired = jwt.decode(token);
          if (decodedExpired?.userId) {
            await prisma.user.update({
              where: { id: decodedExpired.userId },
              data: { isLoggedIn: false },
            });
          }
          throw new Error("TokenExpired");
        }
        throw error;
      }
    },
  })
);
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Query endpoint ready at ${PORT}`);
  console.log(
    `🚀 Subscription endpoint ready at ws://localhost:${PORT}/graphql`
>>>>>>> simple
  );
});
