import express from "express";
import cors from "cors";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { execute, subscribe } from "graphql";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createYoga } from "graphql-yoga";
import { OAuth2Client } from "google-auth-library";

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const typeDefs = `
  type AuthPayload {
    id: ID!
    email: String!
    name: String
    token: String!
    isLoggedIn: Boolean!
    createdAt: String!
  }
    
  type User {
    id: ID!
    email: String!
    name: String
    isLoggedIn: Boolean!
    createdAt: String!
    updatedAt: String!
  }

 
  type Chat {
    id: ID!
    createdAt: String!
    creator: User!
    participant: User!
    messages: [Message!]!
  }

  type Message {
    id: ID!
    content: String!
    createdAt: String!
    chat: Chat!
    sender: User!
  }

  type Query {
    users: [User!]!
    loggedInUsers: [User!]!
    chats: [Chat!]!
    chat(id: ID!): Chat
  }

  type Mutation {
    createUser(email: String!, name: String, password: String!): User!
    loginUser(email: String!, password: String!): AuthPayload!
    googleLogin(idToken: String!): AuthPayload!
    logoutUser: Boolean!
    createChat(participantId: ID!): Chat!
    sendMessage(chatId: ID!, content: String!): Message!
  }

  type Subscription {
    userCreated: User!
    userLoggedIn: User!
    userLoggedOut: User!
    messageSent(chatId: ID!): Message!
    chatCreated: Chat!
  }
`;

const listeners = [];
const loginListeners = [];
const logoutListeners = [];
const messageListeners = new Map();
const chatCreatedListeners = [];

const schema = makeExecutableSchema({
  typeDefs,
  resolvers: {
    Query: {
      users: async () => prisma.user.findMany(),
      loggedInUsers: async () =>
        prisma.user.findMany({ where: { isLoggedIn: true } }),
      chats: async (_, __, { token }) => {
        console.log("+++ Authorization +++");
        if (!token) throw new Error("Authentication required");
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = Number(decoded.userId);
        return prisma.chat.findMany({
          where: {
            OR: [{ creatorId: userId }, { participantId: userId }],
          },
          include: {
            creator: true,
            participant: true,
            messages: {
              include: {
                sender: true,
              },
            },
          },
        });
      },
      chat: async (_, { id }, { token }) => {
        if (!token) throw new Error("Authentication required");
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = Number(decoded.userId);
        const chat = await prisma.chat.findFirst({
          where: {
            id: Number(id),
            OR: [{ creatorId: userId }, { participantId: userId }],
          },
          include: { creator: true, participant: true, messages: true },
        });
        if (!chat) throw new Error("Chat not found or access denied");
        return chat;
      },
    },
    Mutation: {
      createUser: async (_, { email, name, password }) => {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const user = await prisma.user.create({
          data: { email, name, password: hashedPassword, isLoggedIn: false },
        });
        console.log("<====user created====>", user);
        listeners.forEach((fn) => fn(user));
        return user;
      },
      loginUser: async (_, { email, password }) => {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          throw new Error("User not found");
        }
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          throw new Error("Invalid password");
        }
        const updatedUser = await prisma.user.update({
          where: { email },
          data: { isLoggedIn: true },
        });
        const token = jwt.sign(
          { userId: user.id, email: user.email },
          JWT_SECRET,
          { expiresIn: "1h" }
        );
        console.log("<====user logged in====>", updatedUser);
        loginListeners.forEach((fn) => fn(updatedUser));
        return {
          id: String(updatedUser.id),
          email: updatedUser.email,
          name: updatedUser.name,
          token,
          isLoggedIn: updatedUser.isLoggedIn,
          createdAt: updatedUser.createdAt.toISOString(),
        };
      },
      googleLogin: async (_, { idToken }) => {
        try {
          const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: GOOGLE_CLIENT_ID,
          });
          const payload = ticket.getPayload();
          if (!payload) {
            throw new Error("Invalid Google token");
          }

          const { email, name } = payload;
          if (!email) {
            throw new Error("Email not provided by Google");
          }

          let user = await prisma.user.findUnique({ where: { email } });
          if (!user) {
            user = await prisma.user.create({
              data: {
                email,
                name,
                password: "", // Пустой пароль, так как используется Google
                isLoggedIn: true,
              },
            });
            console.log("<====user created via Google====>", user);
            listeners.forEach((fn) => fn(user));
          } else {
            user = await prisma.user.update({
              where: { email },
              data: { isLoggedIn: true, name: name || user.name },
            });
          }

          const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: "1h" }
          );
          console.log("<====user logged in via Google====>", user);
          loginListeners.forEach((fn) => fn(user));
          return {
            id: String(user.id),
            email: user.email,
            name: user.name,
            token,
            isLoggedIn: user.isLoggedIn,
            createdAt: user.createdAt.toISOString(),
          };
        } catch (err) {
          console.error("Google login error:", err);
          throw new Error("Failed to authenticate with Google");
        }
      },
      logoutUser: async (_, __, { token }) => {
        if (!token) {
          throw new Error("Token not provided");
        }
        let decoded;
        try {
          decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
          throw new Error("Invalid token");
        }
        const userId = Number(decoded.userId);
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.isLoggedIn) {
          throw new Error("User not found or already logged out");
        }
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { isLoggedIn: false },
        });
        console.log("<====user logged out====>", updatedUser);
        logoutListeners.forEach((fn) => fn(updatedUser));
        return true;
      },
      createChat: async (_, { participantId }, { token }) => {
        if (!token) throw new Error("Authentication required");
        const decoded = jwt.verify(token, JWT_SECRET);
        const creatorId = Number(decoded.userId);
        if (creatorId === Number(participantId))
          throw new Error("Cannot create chat with yourself");
        const existingChat = await prisma.chat.findFirst({
          where: {
            OR: [
              { creatorId, participantId: Number(participantId) },
              { creatorId: Number(participantId), participantId: creatorId },
            ],
          },
        });
        if (existingChat) throw new Error("Chat already exists");
        const chat = await prisma.chat.create({
          data: {
            creatorId,
            participantId: Number(participantId),
          },
          include: { creator: true, participant: true, messages: true },
        });
        console.log("<====chat created====>", chat);

        chatCreatedListeners.forEach((fn) => fn(chat));
        return chat;
      },
      sendMessage: async (_, { chatId, content }, { token }) => {
        if (!token) throw new Error("Authentication required");
        const decoded = jwt.verify(token, JWT_SECRET);
        const senderId = Number(decoded.userId);

        const chat = await prisma.chat.findFirst({
          where: {
            id: Number(chatId),
            OR: [{ creatorId: senderId }, { participantId: senderId }],
          },
        });

        if (!chat) throw new Error("Chat not found or access denied");

        const message = await prisma.message.create({
          data: {
            content,
            chatId: Number(chatId),
            senderId,
          },
          include: { chat: true, sender: true },
        });

        console.log("<====🔥 message sent====>", message);

        const chatKey = String(chatId); //  ключ как строка

        if (!messageListeners.has(chatKey)) {
          messageListeners.set(chatKey, []);
        }

        const listenersForChat = messageListeners.get(chatKey);
        console.log("📣 Notifying listeners:", listenersForChat.length);
        listenersForChat.forEach((fn) => fn(message));

        return message;
      },
    },
    Subscription: {
      userCreated: {
        subscribe: async function* () {
          while (true) {
            const user = await new Promise((resolve) =>
              listeners.push(resolve)
            );
            yield { userCreated: user };
          }
        },
      },
      userLoggedIn: {
        subscribe: async function* () {
          while (true) {
            const user = await new Promise((resolve) =>
              loginListeners.push(resolve)
            );
            yield { userLoggedIn: user };
          }
        },
      },
      userLoggedOut: {
        subscribe: async function* () {
          while (true) {
            const user = await new Promise((resolve) =>
              logoutListeners.push(resolve)
            );
            yield { userLoggedOut: user };
          }
        },
      },

      chatCreated: {
        subscribe: async function* (_, __, { token }) {
          console.log("📡 [Server] chatCreated subscription requested ++++");
          if (!token) throw new Error("Authentication required");
          const decoded = jwt.verify(token, JWT_SECRET);
          const userId = Number(decoded.userId);
          console.log(
            "✅ [Server] chatCreated subscription established for userId:",
            userId
          );
          while (true) {
            const chat = await new Promise((resolve) =>
              chatCreatedListeners.push(resolve)
            );
            if (chat.creatorId === userId || chat.participantId === userId) {
              console.log("📥 [Server] Sending chat to subscriber:", chat.id);
              yield { chatCreated: chat };
            }
          }
        },
      },
      messageSent: {
        subscribe: async function* (_, { chatId }, { token }) {
          if (!token) throw new Error("Authentication required");
          const decoded = jwt.verify(token, JWT_SECRET);
          const userId = Number(decoded.userId);

          const chat = await prisma.chat.findFirst({
            where: {
              id: Number(chatId),
              OR: [{ creatorId: userId }, { participantId: userId }],
            },
          });

          if (!chat) throw new Error("Chat not found or access denied");

          const chatKey = String(chatId); // 🔥 ключ как строка

          if (!messageListeners.has(chatKey)) {
            messageListeners.set(chatKey, []);
          }

          const listenersForChat = messageListeners.get(chatKey);
          console.log("🟢 SUBSCRIBE CALLED for chatId", chatId);

          while (true) {
            const message = await new Promise((resolve) =>
              listenersForChat.push(resolve)
            );
            yield { messageSent: message };
          }
        },
      },
    },
    User: {
      id: (user) => String(user.id),
      createdAt: (user) => user.createdAt.toISOString(),
      updatedAt: (user) => user.updatedAt.toISOString(),
    },
    Chat: {
      id: (chat) => String(chat.id),
      createdAt: (chat) => chat.createdAt.toISOString(),
    },
    Message: {
      id: (message) => String(message.id),
      createdAt: (message) => message.createdAt.toISOString(),
    },
    AuthPayload: {
      id: (payload) => String(payload.id),
    },
    AuthPayload: {
      id: (payload) => String(payload.id),
    },
  },
});

const yoga = createYoga({
  schema,
  graphqlEndpoint: "/graphql",
  graphiql: true,
  context: ({ request }) => ({
    token: request.headers.get("authorization")?.replace("Bearer ", ""),
  }),
});

const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:3001",
      process.env.FRONTEND_URL || "https://chat-next-graph.vercel.app",
    ],
  })
);
app.use("/graphql", yoga);

const httpServer = createServer(app);
const wsServer = new WebSocketServer({ server: httpServer, path: "/graphql" });

SubscriptionServer.create(
  {
    schema,
    execute,
    subscribe,
    onConnect: (connectionParams, ws, context) => {
      console.log("🌐 [Server] WebSocket connection :", {
        params: connectionParams,
      });
      const token =
        connectionParams.authorization?.replace("Bearer ", "") ||
        connectionParams.Authorization?.replace("Bearer ", "");
      if (!token) {
        console.warn(
          "⚠️ [Server] No token provided in WebSocket connection. Params:",
          connectionParams
        );
        throw new Error("WebSocket Authentication required");
      }
      console.log("✅ [Server] WebSocket token received");
      return { token };
    },
    onDisconnect: () => {
      console.log("🔌 [Server] Client disconnected from WebSocket:", {
        timestamp: new Date().toLocaleString(),
      });
    },
    onOperation: (msg, params, ws) => {
      console.log("📡 [Server] Subscription operation:", {
        operation: msg.payload.operationName || "unnamed",
        variables: msg.payload.variables,
        timestamp: new Date().toLocaleString(),
      });
      return {
        ...params,
        context: {
          token: params.context.token,
        },
      };
    },
  },
  wsServer
);

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () =>
  console.log(`🚀🚀🚀 Server ready at http://localhost:${PORT} 🚀🚀🚀`)
);

import express from "express";
import cors from "cors";
import { graphqlHTTP } from "express-graphql";
import cors from "cors";
import schema from "./schema.js";
import { PrismaClient } from "@prisma/client";

// import { createServer } from "http";
// import { WebSocketServer } from "ws";
// import { SubscriptionServer } from "subscriptions-transport-ws";
// import { makeExecutableSchema } from "@graphql-tools/schema";
// import { execute, subscribe } from "graphql";
// import { PrismaClient } from "@prisma/client";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import { createYoga } from "graphql-yoga";
// import { OAuth2Client } from "google-auth-library";
// import { split } from "@apollo/client";
// import { WebSocketLink } from "@apollo/client/link/ws";
// import { getMainDefinition } from "@apollo/client/utilities";

const prisma = new PrismaClient();
// const SALT_ROUNDS = 10;
// const JWT_SECRET = process.env.JWT_SECRET || "secret";
// const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
// const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// const listeners = [];
// const loginListeners = [];
// const logoutListeners = [];
// const messageListeners = new Map();
// const chatCreatedListeners = [];

const schema = makeExecutableSchema({
  typeDefs,
  resolvers: {
    Query: {
      users: async () => prisma.user.findMany(),
      loggedInUsers: async () =>
        prisma.user.findMany({ where: { isLoggedIn: true } }),
      chats: async (_, __, { token }) => {
        console.log("+++ Authorization +++");
        if (!token) throw new Error("Authentication required");
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = Number(decoded.userId);
        return prisma.chat.findMany({
          where: {
            OR: [{ creatorId: userId }, { participantId: userId }],
          },
          include: {
            creator: true,
            participant: true,
            messages: {
              include: {
                sender: true,
              },
            },
          },
        });
      },
      chat: async (_, { id }, { token }) => {
        if (!token) throw new Error("Authentication required");
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = Number(decoded.userId);
        const chat = await prisma.chat.findFirst({
          where: {
            id: Number(id),
            OR: [{ creatorId: userId }, { participantId: userId }],
          },
          include: { creator: true, participant: true, messages: true },
        });
        if (!chat) throw new Error("Chat not found or access denied");
        return chat;
      },
    },
    Mutation: {
      createUser: async (_, { email, name, password }) => {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const user = await prisma.user.create({
          data: { email, name, password: hashedPassword, isLoggedIn: false },
        });
        console.log("<====user created====>", user);
        listeners.forEach((fn) => fn(user));
        return user;
      },
      loginUser: async (_, { email, password }) => {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          throw new Error("User not found");
        }
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          throw new Error("Invalid password");
        }
        const updatedUser = await prisma.user.update({
          where: { email },
          data: { isLoggedIn: true },
        });
        const token = jwt.sign(
          { userId: user.id, email: user.email },
          JWT_SECRET,
          { expiresIn: "1h" }
        );
        console.log("<====user logged in====>", updatedUser);
        loginListeners.forEach((fn) => fn(updatedUser));
        return {
          id: String(updatedUser.id),
          email: updatedUser.email,
          name: updatedUser.name,
          token,
          isLoggedIn: updatedUser.isLoggedIn,
          createdAt: updatedUser.createdAt.toISOString(),
        };
      },
      googleLogin: async (_, { idToken }) => {
        try {
          const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: GOOGLE_CLIENT_ID,
          });
          const payload = ticket.getPayload();
          if (!payload) {
            throw new Error("Invalid Google token");
          }

          const { email, name } = payload;
          if (!email) {
            throw new Error("Email not provided by Google");
          }

          let user = await prisma.user.findUnique({ where: { email } });
          if (!user) {
            user = await prisma.user.create({
              data: {
                email,
                name,
                password: "", // Пустой пароль, так как используется Google
                isLoggedIn: true,
              },
            });
            console.log("<====user created via Google====>", user);
            listeners.forEach((fn) => fn(user));
          } else {
            user = await prisma.user.update({
              where: { email },
              data: { isLoggedIn: true, name: name || user.name },
            });
          }

          const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: "1h" }
          );
          console.log("<====user logged in via Google====>", user);
          loginListeners.forEach((fn) => fn(user));
          return {
            id: String(user.id),
            email: user.email,
            name: user.name,
            token,
            isLoggedIn: user.isLoggedIn,
            createdAt: user.createdAt.toISOString(),
          };
        } catch (err) {
          console.error("Google login error:", err);
          throw new Error("Failed to authenticate with Google");
        }
      },
      logoutUser: async (_, __, { token }) => {
        if (!token) {
          throw new Error("Token not provided");
        }
        let decoded;
        try {
          decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
          throw new Error("Invalid token");
        }
        const userId = Number(decoded.userId);
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.isLoggedIn) {
          throw new Error("User not found or already logged out");
        }
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { isLoggedIn: false },
        });
        console.log("<====user logged out====>", updatedUser);
        logoutListeners.forEach((fn) => fn(updatedUser));
        return true;
      },
      createChat: async (_, { participantId }, { token }) => {
        if (!token) throw new Error("Authentication required");
        const decoded = jwt.verify(token, JWT_SECRET);
        const creatorId = Number(decoded.userId);
        if (creatorId === Number(participantId))
          throw new Error("Cannot create chat with yourself");
        const existingChat = await prisma.chat.findFirst({
          where: {
            OR: [
              { creatorId, participantId: Number(participantId) },
              { creatorId: Number(participantId), participantId: creatorId },
            ],
          },
        });
        if (existingChat) throw new Error("Chat already exists");
        const chat = await prisma.chat.create({
          data: {
            creatorId,
            participantId: Number(participantId),
          },
          include: { creator: true, participant: true, messages: true },
        });
        console.log("<====chat created====>", chat);

        chatCreatedListeners.forEach((fn) => fn(chat));
        return chat;
      },
      sendMessage: async (_, { chatId, content }, { token }) => {
        if (!token) throw new Error("Authentication required");
        const decoded = jwt.verify(token, JWT_SECRET);
        const senderId = Number(decoded.userId);

        const chat = await prisma.chat.findFirst({
          where: {
            id: Number(chatId),
            OR: [{ creatorId: senderId }, { participantId: senderId }],
          },
        });

        if (!chat) throw new Error("Chat not found or access denied");

        const message = await prisma.message.create({
          data: {
            content,
            chatId: Number(chatId),
            senderId,
          },
          include: { chat: true, sender: true },
        });

        console.log("<====🔥 message sent====>", message);

        const chatKey = String(chatId); //  ключ как строка

        if (!messageListeners.has(chatKey)) {
          messageListeners.set(chatKey, []);
        }

        const listenersForChat = messageListeners.get(chatKey);
        console.log("📣 Notifying listeners:", listenersForChat.length);
        listenersForChat.forEach((fn) => fn(message));

        return message;
      },
    },
    Subscription: {
      userCreated: {
        subscribe: async function* () {
          while (true) {
            const user = await new Promise((resolve) =>
              listeners.push(resolve)
            );
            yield { userCreated: user };
          }
        },
      },
      userLoggedIn: {
        subscribe: async function* () {
          while (true) {
            const user = await new Promise((resolve) =>
              loginListeners.push(resolve)
            );
            yield { userLoggedIn: user };
          }
        },
      },
      userLoggedOut: {
        subscribe: async function* () {
          while (true) {
            const user = await new Promise((resolve) =>
              logoutListeners.push(resolve)
            );
            yield { userLoggedOut: user };
          }
        },
      },

      chatCreated: {
        subscribe: async function* (_, __, { token }) {
          console.log("📡 [Server] chatCreated subscription requested ++++");
          if (!token) throw new Error("Authentication required");
          const decoded = jwt.verify(token, JWT_SECRET);
          const userId = Number(decoded.userId);
          console.log(
            "✅ [Server] chatCreated subscription established for userId:",
            userId
          );
          while (true) {
            const chat = await new Promise((resolve) =>
              chatCreatedListeners.push(resolve)
            );
            if (chat.creatorId === userId || chat.participantId === userId) {
              console.log("📥 [Server] Sending chat to subscriber:", chat.id);
              yield { chatCreated: chat };
            }
          }
        },
      },
      messageSent: {
        subscribe: async function* (_, { chatId }, { token }) {
          if (!token) throw new Error("Authentication required");
          const decoded = jwt.verify(token, JWT_SECRET);
          const userId = Number(decoded.userId);

          const chat = await prisma.chat.findFirst({
            where: {
              id: Number(chatId),
              OR: [{ creatorId: userId }, { participantId: userId }],
            },
          });

          if (!chat) throw new Error("Chat not found or access denied");

          const chatKey = String(chatId); // 🔥 ключ как строка

          if (!messageListeners.has(chatKey)) {
            messageListeners.set(chatKey, []);
          }

          const listenersForChat = messageListeners.get(chatKey);
          console.log("🟢 SUBSCRIBE CALLED for chatId", chatId);

          while (true) {
            const message = await new Promise((resolve) =>
              listenersForChat.push(resolve)
            );
            yield { messageSent: message };
          }
        },
      },
    },
    User: {
      id: (user) => String(user.id),
      createdAt: (user) => user.createdAt.toISOString(),
      updatedAt: (user) => user.updatedAt.toISOString(),
    },
    Chat: {
      id: (chat) => String(chat.id),
      createdAt: (chat) => chat.createdAt.toISOString(),
    },
    Message: {
      id: (message) => String(message.id),
      createdAt: (message) => message.createdAt.toISOString(),
    },
    AuthPayload: {
      id: (payload) => String(payload.id),
    },
    AuthPayload: {
      id: (payload) => String(payload.id),
    },
  },
});

const yoga = createYoga({
  schema,
  graphqlEndpoint: "/graphql",
  graphiql: true,
  context: ({ request }) => ({
    token: request.headers.get("authorization")?.replace("Bearer ", ""),
  }),
});

const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:3001",
      process.env.FRONTEND_URL || "https://chat-next-graph.vercel.app",
    ],
  })
);
app.use("/graphql", yoga);

const httpServer = createServer(app);
const wsServer = new WebSocketServer({ server: httpServer, path: "/graphql" });

SubscriptionServer.create(
  {
    schema,
    execute,
    subscribe,
    onConnect: (connectionParams, ws, context) => {
      console.log("🌐 [Server] WebSocket connection :", {
        params: connectionParams,
      });
      const token =
        connectionParams.authorization?.replace("Bearer ", "") ||
        connectionParams.Authorization?.replace("Bearer ", "");
      if (!token) {
        console.warn(
          "⚠️ [Server] No token provided in WebSocket connection. Params:",
          connectionParams
        );
        throw new Error("WebSocket Authentication required");
      }
      console.log("✅ [Server] WebSocket token received");
      return { token };
    },
    onDisconnect: () => {
      console.log("🔌 [Server] Client disconnected from WebSocket:", {
        timestamp: new Date().toLocaleString(),
      });
    },
    onOperation: (msg, params, ws) => {
      console.log("📡 [Server] Subscription operation:", {
        operation: msg.payload.operationName || "unnamed",
        variables: msg.payload.variables,
        timestamp: new Date().toLocaleString(),
      });
      return {
        ...params,
        context: {
          token: params.context.token,
        },
      };
    },
  },
  wsServer
);

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () =>
  console.log(`🚀🚀🚀 Server ready at http://localhost:${PORT} 🚀🚀🚀`)
);
