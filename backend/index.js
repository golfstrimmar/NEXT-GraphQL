import { createServer } from "http";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/use/ws";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import cors from "cors";
import express from "express";
import bodyParser from "body-parser";
import { PubSub } from "graphql-subscriptions";
import { parse } from "graphql";
const prisma = new PrismaClient();
const pubsub = new PubSub();
const SALT_ROUNDS = 10;

// Типы и резолверы — отлично

const typeDefs = `#graphql
  type User {
    id: Int!
    name: String
    email: String!
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    users: [User!]!
    user(id: Int!): User
  }

  type Mutation {
    createUser(email: String!, name: String, password: String!): User!
    deleteUser(id: Int!): Boolean!
  }

  type Subscription {
    userCreated: User!
  }
`;

const resolvers = {
  Query: {
    users: () => prisma.user.findMany(),
    user: (_, { id }) => prisma.user.findUnique({ where: { id } }),
  },
  Mutation: {
    createUser: async (_, { email, name, password }) => {
      console.log("<===== createUser =====>", email, name, password);
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      const user = await prisma.user.create({
        data: { email, name, password: hashedPassword },
      });
      console.log("<====user created====>", user);
      // Публикуем нового пользователя
      pubsub.publish("USER_CREATED", { userCreated: user });
      return user;
    },
    deleteUser: async (_, { id }) => {
      await prisma.user.delete({ where: { id } });
      return true;
    },
  },
  Subscription: {
    userCreated: {
      subscribe: (_, __, { pubsub }) => {
        console.log("Подписка вызвана, pubsub:", !!pubsub);
        return pubsub.asyncIterator(["USER_CREATED"]);
      },
    },
  },
  User: {
    createdAt: (user) => user.createdAt.toISOString(),
    updatedAt: (user) => user.updatedAt.toISOString(),
  },
};

// Создаем схему
const schema = makeExecutableSchema({ typeDefs, resolvers });

// Экспресс + HTTP сервер
const app = express();
const httpServer = createServer(app);

// WebSocket сервер для подписок
const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/graphql",
});

useServer(
  {
    schema,
    onSubscribe: (ctx, msg) => {
      const payload = msg.payload;

      if (!payload || !payload.query) {
        throw new Error("Missing subscription query in payload.");
      }

      return {
        schema,
        operationName: payload.operationName,
        document: parse(payload.query),
        variableValues: payload.variables,
        contextValue: { prisma, pubsub },
      };
    },
    // Опционально, можно логировать подключения:
    onConnect: (ctx) => {
      console.log("Клиент подключился к WebSocket");
    },
    onDisconnect(ctx, code, reason) {
      console.log(`WebSocket отключен: ${code} - ${reason}`);
    },
  },
  wsServer
);

// Apollo Server для HTTP запросов
const server = new ApolloServer({ schema });
await server.start();

app.use(
  "/graphql",
  cors(),
  bodyParser.json(),
  expressMiddleware(server, {
    context: async () => ({ prisma, pubsub }),
  })
);

// Запуск сервера
const PORT = 4000;
httpServer.listen(PORT, () => {
  console.log(`🚀 HTTP + WebSocket сервер на http://localhost:${PORT}/graphql`);
});
