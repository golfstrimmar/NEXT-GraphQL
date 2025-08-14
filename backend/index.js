import express from "express";
import http from "http";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/use/ws";
import bodyParser from "body-parser";
import cors from "cors";

import { typeDefs } from "./graphql/schema.js";
import { resolvers } from "./graphql/resolvers.js";

const schema = makeExecutableSchema({ typeDefs, resolvers });

// Создаём Apollo Server
const server = new ApolloServer({ schema });
await server.start();

const app = express();
app.use("/graphql", cors(), bodyParser.json(), expressMiddleware(server));

// Создаём HTTP сервер
const httpServer = http.createServer(app);

// Создаём WS сервер для подписок
const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/graphql",
});
useServer({ schema }, wsServer);

// Запуск
const PORT = 4000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Query/Mutation: http://localhost:${PORT}/graphql`);
  console.log(`🚀 Subscriptions: ws://localhost:${PORT}/graphql`);
});
