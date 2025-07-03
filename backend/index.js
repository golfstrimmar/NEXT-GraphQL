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
import { verifyToken } from "./utils/verifyToken.js";

import resolvers from "./resolvers/index.js";
import typeDefs from "./schema.js";

const PORT = 4000;

let currentNumber = 0;
const activeSubscriptions = new Map();
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

    context: async (ctx, msg, args) => {
      const authHeader = ctx.connectionParams?.headers?.Authorization || "";
      const token = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : null;
      const user = token ? await verifyToken(token) : null;

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
      const user = token ? await verifyToken(token) : null;
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
    },
  },
  wsServer
);

const server = new ApolloServer({
  schema,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),

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
app.use(
  "/graphql",
  cors(),
  bodyParser.json(),
  expressMiddleware(server, {
    context: async ({ req }) => {
      const auth = req.headers.authorization || "";
      // console.log("🛡️ Authorization header:", auth); // <-- Лог заголовка

      const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
      const decoded = token ? await verifyToken(token) : null;

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
  );
});
