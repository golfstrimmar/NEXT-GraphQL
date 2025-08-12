import express from "express";
import http from "http";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/use/ws";

import { typeDefs } from "./graphql/schema.js";
import { resolvers } from "./graphql/resolvers.js";
import { context } from "./graphql/context.js";

const PORT = 4000;
const app = express();

// Создаем схему
const schema = makeExecutableSchema({ typeDefs, resolvers });

// HTTP сервер
const httpServer = http.createServer(app);

// WebSocket сервер для подписок
const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/graphql",
});

// Сохраняем для последующей очистки
const serverCleanup = useServer({ schema }, wsServer);

// ApolloServer
const server = new ApolloServer({
  schema,
  plugins: [
    // Правильное отключение HTTP сервера
    ApolloServerPluginDrainHttpServer({ httpServer }),
    // Правильное отключение WebSocket сервера
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
  express.json(),
  expressMiddleware(server, { context })
);

// Запускаем
await new Promise((resolve) => httpServer.listen({ port: PORT }, resolve));

console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}/graphql`);