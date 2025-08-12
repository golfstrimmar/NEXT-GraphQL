import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../prisma/client.js";

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

export const resolvers = {
  User: {
    messages: async (parent) => {
      return await prisma.message.findMany({ where: { authorId: parent.id } });
    },
  },

  Message: {
    author: async (parent) => {
      return await prisma.user.findUnique({ where: { id: parent.authorId } });
    },
  },
  Query: {
    users: async () => {
      return await prisma.user.findMany();
    },
    messages: async () => {
      return await prisma.message.findMany({ orderBy: { id: "desc" } });
    },
    me: async (_, __, context) => {
      return context.currentUser || null;
    },
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

    loginUser: async (_, { email, password }) => {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw new Error("Пользователь не найден");
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        throw new Error("Неверный пароль");
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
        expiresIn: "7d",
      });

      return {
        token,
        user,
      };
    },

    createMessage: async (_, { text, authorId }) => {
      return await prisma.message.create({
        data: { text, authorId },
      });
    },
  },

  Subscription: {
    userCreated: {
      subscribe: () => pubsub.asyncIterator(["USER_CREATED"]),
    },
  },
};
