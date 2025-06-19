import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Счетчики подключений
let httpConnectionCount = 0;
let activeConnections = 0;

const typeDefs = `#graphql
  type User {
    id: Int!
    name: String
    email: String!
    password: String!
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    users: [User!]!
    user(id: Int!): User
    stats: ServerStats!
  }

  type Mutation {
    createUser(email: String!, name: String): User!
    deleteUser(id: Int!): Boolean!
  }

  type ServerStats {
    httpConnections: Int!
    activeConnections: Int!
    startupTime: String!
  }
`;

const serverStartTime = new Date();

const resolvers = {
  Query: {
    users: () => {
      console.log(
        `[Query] Запрос списка пользователей (Active: ${activeConnections})`
      );
      const startTime = Date.now();
      return prisma.user
        .findMany()
        .then((users) => {
          console.log(
            `[Query] Получено ${users.length} пользователей за ${
              Date.now() - startTime
            }ms`
          );
          return users;
        })
        .catch((error) => {
          console.error("[Query] Ошибка при получении пользователей:", error);
          throw error;
        });
    },
    user: (_, { id }) => prisma.user.findUnique({ where: { id } }),
    stats: () => ({
      httpConnections: httpConnectionCount,
      activeConnections: activeConnections,
      startupTime: serverStartTime.toISOString(),
    }),
  },
  Mutation: {
    createUser: async (_, { email, name }) => {
      console.log(`[Mutation] Создание пользователя: ${email}`);
      return prisma.user.create({
        data: { email, name },
      });
    },
    deleteUser: async (_, { id }) => {
      console.log(`[Mutation] Удаление пользователя ID: ${id}`);
      await prisma.user.delete({ where: { id } });
      return true;
    },
  },
  User: {
    createdAt: (user) => user.createdAt.toISOString(),
    updatedAt: (user) => user.updatedAt.toISOString(),
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
  cors: {
    origin: ["*"],
    credentials: true,
    allowedHeaders: ["Content-Type"],
    methods: ["GET", "POST", "OPTIONS"],
  },
  context: async ({ req }) => {
    httpConnectionCount++;
    activeConnections++;
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    console.log(
      `[HTTP] New connection (All: ${httpConnectionCount}, Active: ${activeConnections}) `
    );

    console.log("❓ Incoming request from:", req.headers.origin);

    req.socket.on("close", () => {
      activeConnections--;
      console.log(
        `[HTTP] Connection closed ( All: ${httpConnectionCount}, Active: ${activeConnections})`
      );
    });

    return { prisma };
  },
});

console.log(`🚀 Server ready at ${url}`);
console.log(`⏳ Сервер запущен в ${serverStartTime.toLocaleTimeString()}`);

// Логируем статистику каждую минуту
setInterval(() => {
  console.log(
    `📊 Статистика: Всего HTTP: ${httpConnectionCount}, Активные: ${activeConnections}`
  );
}, 60000);
