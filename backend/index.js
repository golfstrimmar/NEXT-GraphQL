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

// Настройка CORS с явным указанием разрешенных источников
const corsOptions = {
  origin: "http://localhost:3002", // Разрешаем запросы с вашего фронтенда
  credentials: true, // Если используете куки или заголовки авторизации
};

const server = new ApolloServer({ schema });
await server.start();

const app = express();

// Применяем CORS ко всем маршрутам
app.use(cors(corsOptions));
app.use("/graphql", bodyParser.json(), expressMiddleware(server));

// Создаём HTTP сервер
const httpServer = http.createServer(app);

// Создаём WS сервер для подписок
const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/graphql",
});
useServer({ schema }, wsServer);

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`🚀 GraphQL server running on port ${PORT}`);
});
