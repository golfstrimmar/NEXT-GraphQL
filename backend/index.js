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
      console.log("📡 WebSocket connection +");
      return {}; // Пустой контекст
    },
    onConnect: async (ctx) => {
      console.log("📡📡📡 Client connected +");
    },
    onDisconnect: async (ctx, code, reason) => {
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
app.use("/graphql", cors(), bodyParser.json(), expressMiddleware(server));

httpServer.listen(PORT, () => {
  console.log(
    `🚀🚀🚀 Query endpoint ready at http://localhost:${PORT}/graphql 🚀🚀🚀`
  );
  console.log(
    `🚀🚀🚀 Subscription endpoint ready at ws://localhost:${PORT}/graphql 🚀🚀🚀`
  );
});
