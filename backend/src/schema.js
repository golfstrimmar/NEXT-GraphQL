import { gql } from "graphql-tag";
import prisma from "./lib/prisma.js";
import { PubSub } from "graphql-subscriptions";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const pubsub = new PubSub();
const JWT_SECRET = process.env.JWT_SECRET || "your-strong-secret-key-here";

// Генерация и проверка токенов
const generateToken = (userId) =>
  jwt.sign({ userId }, JWT_SECRET, { expiresIn: "30d" });
const verifyToken = (token) => jwt.verify(token, JWT_SECRET);

export const typeDefs = gql`
  type AuthPayload {
    token: String!
    user: User!
  }

  type User {
    id: ID!
    userName: String!
    email: String!
    password: String
    googleId: String
    avatarUrl: String
    createdAt: String!
    messages: [Message!]!
    messageReactions: [MessageReaction!]!
    comments: [Comment!]!
    commentReactions: [CommentReaction!]!
    sentPrivateMessages: [PrivateMessage!]!
    receivedPrivateMessages: [PrivateMessage!]!
    chatsAsParticipant1: [PrivateChat!]!
    chatsAsParticipant2: [PrivateChat!]!
  }

  type Subscription {
    userCreated: User!
    messageCreated: Message!
  }

  type Message {
    id: ID!
    text: String!
    author: User!
    createdAt: String!
    reactions: [MessageReaction!]!
    comments: [Comment!]!
  }

  type MessageReaction {
    id: ID!
    reaction: String!
    user: User!
    message: Message!
  }

  type Comment {
    id: ID!
    text: String!
    author: User!
    message: Message!
    createdAt: String!
    reactions: [CommentReaction!]!
  }

  type CommentReaction {
    id: ID!
    reaction: String!
    user: User!
    comment: Comment!
  }

  type PrivateChat {
    id: ID!
    participant1: User!
    participant2: User!
    messages: [PrivateMessage!]!
    createdAt: String!
  }

  type PrivateMessage {
    id: ID!
    text: String!
    chat: PrivateChat!
    sender: User!
    receiver: User!
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    users: [User!]!
    user(id: ID!): User
    messages: [Message!]!
    message(id: ID!): Message
    privateChats: [PrivateChat!]!
    privateChat(id: ID!): PrivateChat
  }

  type Mutation {
    createUser(
      email: String!
      userName: String!
      password: String
      googleId: String
      avatarUrl: String
    ): User!

    loginUser(email: String!, password: String!): AuthPayload!

    registerUser(
      userName: String!
      email: String!
      password: String!
      avatarUrl: String
    ): AuthPayload!

    createMessage(text: String!, authorId: ID!): Message!

    createMessageReaction(
      userId: ID!
      messageId: ID!
      reaction: String!
    ): MessageReaction!

    createPrivateMessage(
      chatId: ID!
      senderId: ID!
      receiverId: ID!
      text: String!
    ): PrivateMessage!
  }
`;

export const resolvers = {
  Query: {
    users: async () => {
      return await prisma.user.findMany({
        include: {
          messages: true,
          messageReactions: { include: { user: true, message: true } },
          comments: { include: { author: true, message: true } },
          commentReactions: { include: { user: true, comment: true } },
          sentPrivateMessages: true,
          receivedPrivateMessages: true,
          chatsAsParticipant1: true,
          chatsAsParticipant2: true,
        },
      });
    },
    user: async (_, { id }) => {
      return await prisma.user.findUnique({
        where: { id: parseInt(id) },
        include: {
          messages: true,
          messageReactions: true,
          comments: true,
          commentReactions: true,
          sentPrivateMessages: true,
          receivedPrivateMessages: true,
          chatsAsParticipant1: true,
          chatsAsParticipant2: true,
        },
      });
    },
    messages: async () => {
      return await prisma.message.findMany({
        include: {
          author: true,
          reactions: { include: { user: true } },
          comments: {
            include: {
              author: true,
              reactions: { include: { user: true } },
            },
          },
        },
      });
    },
    message: async (_, { id }) => {
      return await prisma.message.findUnique({
        where: { id: parseInt(id) },
        include: {
          author: true,
          reactions: { include: { user: true } },
          comments: true,
        },
      });
    },
    privateChats: async () => {
      return await prisma.privateChat.findMany({
        include: {
          participant1: true,
          participant2: true,
          messages: {
            include: {
              sender: true,
              receiver: true,
            },
          },
        },
      });
    },
    privateChat: async (_, { id }) => {
      return await prisma.privateChat.findUnique({
        where: { id: parseInt(id) },
        include: {
          participant1: true,
          participant2: true,
          messages: true,
        },
      });
    },
  },

  Mutation: {
    // createUser: async (
    //   _,
    //   { email, userName, password, googleId, avatarUrl }
    // ) => {
    //   const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
    //   const user = await prisma.user.create({
    //     data: {
    //       email,
    //       userName,
    //       password: hashedPassword,
    //       googleId,
    //       avatarUrl,
    //       createdAt: new Date(),
    //     },
    //   });
    //   pubsub.publish("USER_CREATED", { userCreated: user });
    //   return user;
    // },
    registerUser: async (_, { userName, email, password, avatarUrl }) => {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) throw new Error("Email already in use");

      // Хеширование пароля
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          userName,
          email,
          password: hashedPassword,
          avatarUrl,
          presence: { create: { isOnline: true } },
        },
        include: { presence: true },
      });

      pubsub.publish("USER_CREATED", { userCreated: user });

      return {
        token: generateToken(user.id),
        user,
      };
    },
    loginUser: async (_, { email, password }) => {
      console.log("<====email, password====>", email, password);
      const user = await prisma.user.findUnique({
        where: { email },
        include: { presence: true },
      });

      if (!user) throw new Error("User not found");
      if (!user.password) throw new Error("Account uses social login");

      // Проверка пароля с bcrypt
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new Error("Invalid password");

      // Обновляем статус онлайн
      await prisma.userPresence.update({
        where: { userId: user.id },
        data: { isOnline: true },
      });

      return {
        token: generateToken(user.id),
        user,
      };
    },

    createMessage: async (_, { text, authorId }, { user }) => {
      if (!user) throw new Error("Unauthorized");
      const message = await prisma.message.create({
        data: {
          text,
          authorId: parseInt(authorId),
        },
        include: { author: true },
      });
      pubsub.publish("MESSAGE_CREATED", { messageCreated: message });
      return message;
    },

    createMessageReaction: async (
      _,
      { userId, messageId, reaction },
      { user }
    ) => {
      if (!user) throw new Error("Unauthorized");
      return await prisma.messageReaction.create({
        data: {
          reaction,
          userId: parseInt(userId),
          messageId: parseInt(messageId),
        },
        include: { user: true, message: true },
      });
    },

    createPrivateMessage: async (
      _,
      { chatId, senderId, receiverId, text },
      { user }
    ) => {
      if (!user) throw new Error("Unauthorized");
      return await prisma.privateMessage.create({
        data: {
          text,
          chatId: parseInt(chatId),
          senderId: parseInt(senderId),
          receiverId: parseInt(receiverId),
        },
        include: {
          sender: true,
          receiver: true,
          chat: true,
        },
      });
    },
  },

  Subscription: {
    userCreated: {
      subscribe: () => pubsub.asyncIterator(["USER_CREATED"]),
    },
    messageCreated: {
      subscribe: () => pubsub.asyncIterator(["MESSAGE_CREATED"]),
    },
  },

  User: {
    messages: (parent) => {
      return prisma.message.findMany({
        where: { authorId: parent.id },
        include: { author: true },
      });
    },
    messageReactions: (parent) => {
      return prisma.messageReaction.findMany({
        where: { userId: parent.id },
        include: { user: true, message: true },
      });
    },
    comments: (parent) => {
      return prisma.comment.findMany({
        where: { userId: parent.id },
        include: { author: true, message: true },
      });
    },
    commentReactions: (parent) => {
      return prisma.commentReaction.findMany({
        where: { userId: parent.id },
        include: { user: true, comment: true },
      });
    },
    sentPrivateMessages: (parent) => {
      return prisma.privateMessage.findMany({
        where: { senderId: parent.id },
        include: { sender: true, receiver: true, chat: true },
      });
    },
    receivedPrivateMessages: (parent) => {
      return prisma.privateMessage.findMany({
        where: { receiverId: parent.id },
        include: { sender: true, receiver: true, chat: true },
      });
    },
    chatsAsParticipant1: (parent) => {
      return prisma.privateChat.findMany({
        where: { participant1Id: parent.id },
        include: { participant1: true, participant2: true, messages: true },
      });
    },
    chatsAsParticipant2: (parent) => {
      return prisma.privateChat.findMany({
        where: { participant2Id: parent.id },
        include: { participant1: true, participant2: true, messages: true },
      });
    },
  },

  Message: {
    reactions: (parent) => {
      return prisma.messageReaction.findMany({
        where: { messageId: parent.id },
        include: { user: true },
      });
    },
    comments: (parent) => {
      return prisma.comment.findMany({
        where: { messageId: parent.id },
        include: {
          author: true,
          reactions: { include: { user: true } },
        },
      });
    },
  },

  Comment: {
    reactions: (parent) => {
      return prisma.commentReaction.findMany({
        where: { commentId: parent.id },
        include: { user: true },
      });
    },
  },

  PrivateChat: {
    messages: (parent) => {
      return prisma.privateMessage.findMany({
        where: { chatId: parent.id },
        include: { sender: true, receiver: true },
      });
    },
  },
  // Контекст для Apollo Server (добавьте в создание сервера)
};
