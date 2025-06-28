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

import resolvers from "./resolvers.js";
import typeDefs from "./schema.js";

const PORT = 4000;

let currentNumber = 0;

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
    context: async (ctx) => {
      const auth = ctx.connectionParams?.headers?.Authorization || "";
      const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
      const user = token ? verifyToken(token) : null;

      return { user };
    },
    onConnect: async () => {
      console.log("📡 Client connected +");
    },
    onDisconnect: async (_, code, reason) => {
      console.log(`⚠️ Client disconnected (${code}: ${reason})`);
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
      console.log("🛡️ Authorization header:", auth); // <-- Лог заголовка

      const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
      const decoded = token ? verifyToken(token) : null;

      console.log("🧾 Decoded token payload:", decoded); // <-- Лог результата верификации

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
