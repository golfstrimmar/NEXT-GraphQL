import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { typeDefs, resolvers } from "./schema.js";
import jwt from "jsonwebtoken";
import prisma from "./lib/prisma.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-strong-secret-key";

const verifyToken = (token) => {
  try {
    return jwt.verify(token.replace("Bearer ", ""), JWT_SECRET);
  } catch (e) {
    throw new Error("Invalid token");
  }
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      console.log("<====req.headers====>:", req.headers);
      return { prisma };
    },
  });
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
    context: async ({ req }) => {
      const token = req.headers.authorization || "";
      if (token) {
        const { userId } = verifyToken(token);
        const user = await prisma.user.findUnique({
          where: { id: userId },
          include: { presence: true },
        });
        return { user, prisma };
      }
      return { prisma };
    },
    cors: {
      origin: ["http://localhost:3000"],
      credentials: true,
    },
  });

  // WebSocket сервер
  const wsServer = new WebSocketServer({
    port: 4001,
    path: "/graphql",
  });

  useServer(
    {
      schema,
      context: async (ctx) => {
        const token = ctx.connectionParams?.authToken;
        if (!token) throw new Error("Auth required");
        const { userId } = verifyToken(token);
        const user = await prisma.user.findUnique({
          where: { id: userId },
          include: { presence: true },
        });
        return { user, prisma };
      },
    },
    wsServer
  );

  console.log(`🚀 HTTP  server ready at ${url}`);
  console.log(`🚀 WS server ready at ws://localhost:4001/graphql`);
}

startServer().catch((err) => {
  console.error("Server failed to start:", err);
  process.exit(1);
});
