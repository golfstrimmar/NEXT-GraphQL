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
// app.use(
//   // "/graphql",
//   cors({
//     origin: [
//       "*", // локалка
//       // "https://react-2024-blog.vercel.app", // твой фронт
//       // "https://твой-проект.vercel.app", // будущий продакшн
//     ],
//     credentials: true,
//   }),
//   bodyParser.json(),
//   expressMiddleware(server)
// );
app.options(
  "/graphql",
  cors({
    origin: ["http://localhost:3002"], // фронт локальный
    credentials: true,
  })
);

app.use(
  "/graphql",
  cors({
    // ещё раз для POST
    origin: ["http://localhost:3002"],
    credentials: true,
  }),
  bodyParser.json(),
  expressMiddleware(server)
);
// Создаём HTTP сервер
const httpServer = http.createServer(app);

// Создаём WS сервер для подписок
const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/graphql",
});
useServer({ schema }, wsServer);

const PORT = process.env.PORT || 8080;
// httpServer.listen(PORT, () => {
//   console.log(`🚀 Query/Mutation: https://ulon.up.railway.app`);
//   console.log(`🚀 Subscriptions: wss://ulon.up.railway.app/graphql`);
// });
httpServer.listen(PORT, () => {
  console.log(`🚀 GraphQL server running on port ${PORT}`);
});
