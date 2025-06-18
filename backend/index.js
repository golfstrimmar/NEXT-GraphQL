import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/use/ws";
import { typeDefs } from "./schema.js";
import { resolvers } from "./resolvers.js";
import { createContext } from "./context.js";
import "dotenv/config";

const schema = makeExecutableSchema({ typeDefs, resolvers });

// Создание Apollo Server
const server = new ApolloServer({ schema });

// Запуск сервера
async function startServer() {
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
    context: createContext,
    cors: {
      origin: ["http://localhost:3001"],
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
          onConnect: () => {
            console.log("Клиент подключился к WebSocket");
            return true;
          },
          onDisconnect: () => {
            console.log("Клиент отключился от WebSocket");
          },
        },
        wsServer
      );
      return httpServer;
    },
  });
  console.log(`🚀 Server running at ${url}`);
  console.log(`🚀 Subscriptions ready at ws://localhost:4000/graphql`);
}

startServer().catch((err) => console.error("Server failed to start:", err));
