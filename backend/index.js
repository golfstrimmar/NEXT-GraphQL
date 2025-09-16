import express from "express";
import http from "http";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { makeExecutableSchema } from "@graphql-tools/schema";
import bodyParser from "body-parser";
import cors from "cors";

import { typeDefs } from "./graphql/schema.js";
import { resolvers } from "./graphql/resolvers.js";

// Создаём схему
const schema = makeExecutableSchema({ typeDefs, resolvers });

// Apollo Server
const server = new ApolloServer({ schema });
await server.start();

const app = express();

// ✅ CORS один раз для /graphql
app.use(
  "/graphql",
  cors({
    origin: "http://localhost:3002", // фронт локальный + прод
    credentials: true,
  }),
  bodyParser.json(),
  expressMiddleware(server)
);

// HTTP сервер
const PORT = process.env.PORT || 4000;
const httpServer = http.createServer(app);

httpServer.listen(PORT, () => {
  console.log(`🚀 GraphQL server running on port ${PORT}`);
});
