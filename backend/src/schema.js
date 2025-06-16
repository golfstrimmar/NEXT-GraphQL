import { gql } from "graphql-tag";
import prisma from "./lib/prisma.js";

export const typeDefs = gql`
  type User {
    id: ID!
    userName: String!
    email: String!
    password: String
    googleId: String
    avatarUrl: String
    createdAt: String!
    isOnline: Boolean!
    messages: [Message!]!
    messageReactions: [MessageReaction!]!
    comments: [Comment!]!
    commentReactions: [CommentReaction!]!
    sentPrivateMessages: [PrivateMessage!]!
    receivedPrivateMessages: [PrivateMessage!]!
    chatsAsParticipant1: [PrivateChat!]!
    chatsAsParticipant2: [PrivateChat!]!
  }

  type UserPresence {
    id: ID!
    isOnline: Boolean!
    lastSeenAt: String!
    user: User!
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

    toggleUserOnline(userId: ID!, isOnline: Boolean!): UserPresence!
  }
`;

export const resolvers = {
  Query: {
    users: async () => {
      return await prisma.user.findMany({
        include: {
          presence: true,
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
          presence: true,
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
    createUser: async (
      _,
      { email, userName, password, googleId, avatarUrl }
    ) => {
      return await prisma.user.create({
        data: {
          email,
          userName,
          password,
          googleId,
          avatarUrl,
          presence: {
            create: {
              isOnline: false,
            },
          },
        },
        include: { presence: true },
      });
    },

    createMessage: async (_, { text, authorId }) => {
      return await prisma.message.create({
        data: {
          text,
          authorId: parseInt(authorId),
        },
        include: { author: true },
      });
    },

    createMessageReaction: async (_, { userId, messageId, reaction }) => {
      return await prisma.messageReaction.create({
        data: {
          reaction,
          userId: parseInt(userId),
          messageId: parseInt(messageId),
        },
        include: { user: true, message: true },
      });
    },

    createPrivateMessage: async (_, { chatId, senderId, receiverId, text }) => {
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

    toggleUserOnline: async (_, { userId, isOnline }) => {
      return await prisma.userPresence.upsert({
        where: { userId: parseInt(userId) },
        create: {
          isOnline,
          user: { connect: { id: parseInt(userId) } },
        },
        update: { isOnline },
        include: { user: true },
      });
    },
  },

  User: {
    isOnline: (parent) => parent.presence?.isOnline || false,
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
};
