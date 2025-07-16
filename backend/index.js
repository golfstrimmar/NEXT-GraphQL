import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import express from "express";
import { createServer } from "http";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/use/ws";
import bodyParser from "body-parser";
import cors from "cors";
import jwt from "jsonwebtoken";
import prisma from "./utils/prismaClient.js";

import resolvers from "./resolvers/index.js";
import typeDefs from "./schema.js";

const PORT = 4000;
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";

const schema = makeExecutableSchema({ typeDefs, resolvers });
const app = express();
const httpServer = createServer(app);

const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/graphql",
});

const serverCleanup = useServer(
  {
    schema,

    context: async (ctx) => {
      const authHeader =
        ctx.connectionParams?.Authorization ||
        ctx.connectionParams?.headers?.Authorization ||
        "";
      const token = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : null;

      if (!token) return { user: null };

      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return { user: decoded };
      } catch (error) {
        if (error.name === "TokenExpiredError") {
          const decodedExpired = jwt.decode(token);
          if (decodedExpired?.userId) {
            await prisma.user.update({
              where: { id: decodedExpired.userId },
              data: { isLoggedIn: false },
            });
          }
        }
        return { user: null }; // Просто возвращаем null для WebSocket без падения
      }
    },

    onConnect: () => {
      console.log("📡 WebSocket client connected");
    },

    onDisconnect: () => {
      console.log("⚠️ WebSocket client disconnected");
    },
  },
  wsServer
);

const server = new ApolloServer({
  schema,
  introspection: true,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
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
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
  bodyParser.json(),
  expressMiddleware(server, {
    context: async ({ req }) => {
      const auth = req.headers.authorization || "";
      const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

      if (!token) {
        return { user: null, userId: null };
      }

      try {
        // const decoded = jwt.verify(token, JWT_SECRET);
        // return {
        //   user: decoded,
        //   userId: decoded.userId,
        // };

        const decoded = jwt.verify(token, JWT_SECRET);

        const dbUser = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { isLoggedIn: true },
        });

        if (!dbUser || !dbUser.isLoggedIn) {
          throw new Error("UserLoggedOut");
        }

        return {
          user: decoded,
          userId: decoded.userId,
        };
      } catch (error) {
        if (error.name === "TokenExpiredError") {
          const decodedExpired = jwt.decode(token);
          if (decodedExpired?.userId) {
            await prisma.user.update({
              where: { id: decodedExpired.userId },
              data: { isLoggedIn: false },
            });
          }
          throw new Error("TokenExpired");
        }
        throw error;
      }
    },
  })
);

httpServer.listen(PORT, () => {
  console.log(`🚀 Query endpoint ready at http://localhost:${PORT}/graphql`);
  console.log(
    `🚀 Subscription endpoint ready at ws://localhost:${PORT}/graphql`
  );
});
