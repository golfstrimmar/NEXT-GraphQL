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
  bodyParser.json(),
  expressMiddleware(server)
);

const PORT = process.env.PORT || 4000;
console.log("ENV PORT:", process.env.PORT);

app.get("/", (req, res) => {
  res.send("✅ Server is alive");
});

app.get("/api/download", async (req, res) => {
  const { url, name = "image.webp" } = req.query;
  if (!url) return res.status(400).send("❌ Missing ?url param");

  try {
    // Скачиваем из Cloudinary как бинарный поток
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch image from Cloudinary");

    // Преобразуем в буфер
    const buffer = Buffer.from(await response.arrayBuffer());

    // 💾 Принудительно заставляем браузер скачивать файл
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="${name}"`);
    res.setHeader("Content-Length", buffer.length);

    // Чтобы Chrome не пытался "догадаться", что это картинка
    res.setHeader("X-Content-Type-Options", "nosniff");

    // Отдаём бинарные данные напрямую
    res.end(buffer, "binary");
  } catch (err) {
    console.error("❌ Download proxy error:", err);
    res.status(500).send("Download failed");
  }
});

httpServer.listen(PORT, () => {
  console.log(`🚀 GraphQL server running on port ${PORT}`);
  console.log(
    `📡 WebSocket subscriptions ready at ws://localhost:${PORT}/graphql`
  );
});
