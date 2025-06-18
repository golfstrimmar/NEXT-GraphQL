import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/use/ws";
import { typeDefs } from "./schema.js";
import { resolvers } from "./resolvers.js";
import { createContext } from "./context.js";
import "dotenv/config";

// Создание схемы
const schema = makeExecutableSchema({ typeDefs, resolvers });

// Создание Apollo Server
const server = new ApolloServer({ schema });

// Запуск сервера
async function startServer() {
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
    context: createContext,
    cors: {
      origin: "*",
      credentials: true,
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    },
    server: (httpServer) => {
      const wsServer = new WebSocketServer({
        server: httpServer,
        path: "/graphql",
      });
      useServer(
        {
          schema,
          context: createContext,
        },
        wsServer
      );
      return httpServer;
    },
  });
  console.log(`🚀 Server running at ${url}`);
}

startServer().catch((err) => console.error("Server failed to start:", err));
