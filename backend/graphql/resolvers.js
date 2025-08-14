import prisma from "../prisma/client.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PubSub } from "graphql-subscriptions";

const pubsub = new PubSub();
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

export const resolvers = {
  Query: {
    users: () => prisma.user.findMany({ include: { messages: true } }),
    messages: () => prisma.message.findMany({ include: { sender: true } }),
  },

  Mutation: {
    createUser: async (_, { name, email, password }) => {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await prisma.user.create({
        data: { name, email, password: hashedPassword },
      });
      pubsub.publish("USER_CREATED", { userCreated: newUser });
      return newUser;
    },

    createMessage: async (_, { content, senderId }) => {
      return prisma.message.create({
        data: { content, senderId: Number(senderId) },
      });
    },

    // loginUser: async (_, { email, password }) => {
    //   const user = await prisma.user.findUnique({ where: { email } });
    //   if (!user) throw new Error("Пользователь не найден");
    //   const valid = await bcrypt.compare(password, user.password);
    //   if (!valid) throw new Error("Неверный пароль");
    //   const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
    //     expiresIn: "7d",
    //   });
    //   return { token, user };
    // },
  },

  User: {
    messages: (parent) =>
      prisma.message.findMany({ where: { senderId: parent.id } }),
  },

  Message: {
    sender: (parent) =>
      prisma.user.findUnique({ where: { id: parent.senderId } }),
  },

  Subscription: {
    userCreated: {
      subscribe: () => pubsub.asyncIterator(["USER_CREATED"]),
    },
  },
};
