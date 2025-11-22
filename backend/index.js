import express from "express";
import http from "http";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { makeExecutableSchema } from "@graphql-tools/schema";
import bodyParser from "body-parser";
import cors from "cors";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/use/ws";
import fetch from "node-fetch";
import { typeDefs } from "./graphql/schema.js";
import { resolvers } from "./graphql/resolvers.js";
import { graphqlUploadExpress } from "graphql-upload";
// Создаём схему
const schema = makeExecutableSchema({ typeDefs, resolvers });

const app = express();
const httpServer = http.createServer(app);

// ✅ ДОБАВЛЯЕМ WebSocket сервер для подписок
const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/graphql", // тот же путь что и HTTP
});

// ✅ Подключаем GraphQL к WebSocket серверу
const serverCleanup = useServer({ schema }, wsServer);

// Apollo Server
const server = new ApolloServer({
  schema,
  // ✅ Важно: добавляем плагин для корректного закрытия WebSocket
  plugins: [
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

// ✅ CORS один раз для /graphql
app.use(
  "/graphql",
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3002",
    credentials: true,
  }),
  graphqlUploadExpress({ maxFileSize: 100000000, maxFiles: 100 }),
  bodyParser.json({ limit: "20mb" }),
  expressMiddleware(server)
);

const PORT = process.env.PORT || 4000;
console.log("ENV PORT:", process.env.PORT);

app.get("/", (req, res) => {
  res.send("✅ Server is alive");
});

httpServer.listen(PORT, () => {
  console.log(`🚀 GraphQL server running on port ${PORT}`);
  console.log(
    `📡 WebSocket subscriptions ready at ws://localhost:${PORT}/graphql`
  );
});
