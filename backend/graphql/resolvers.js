import bcrypt from "bcrypt";
import { EventEmitter } from "events";
import jwt from "jsonwebtoken";
import prisma from "../prisma/client.js";

const ee = new EventEmitter();
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

      ee.emit("USER_CREATED", newUser);

      return newUser;
    },

    loginUser: async (_, { email, password }) => {
      console.log("EMAIL FROM REQUEST:", JSON.stringify(email));

      const allUsers = await prisma.user.findMany();
      console.log(
        "ALL USERS:",
        allUsers.map((u) => u.email.trim().toLowerCase())
      );

      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) throw new Error("Пользователь не найден");

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) throw new Error("Неверный пароль");

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      const formattedUser = {
        ...user,
        createdAt: new Date(user.createdAt).getTime().toString(),
      };

      console.log("formattedUser:", formattedUser);
      return { token, user: formattedUser };
    },

    createMessage: async (_, { content, senderId }) => {
      return prisma.message.create({
        data: { content, senderId: Number(senderId) },
      });
    },
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
      subscribe: async function* () {
        const queue = [];

        const handler = (payload) => queue.push(payload);
        ee.on("USER_CREATED", handler);

        try {
          while (true) {
            if (queue.length === 0) {
              await new Promise((resolve) => setTimeout(resolve, 100));
            } else {
              yield { userCreated: queue.shift() };
            }
          }
        } finally {
          ee.off("USER_CREATED", handler);
        }
      },
    },
  },
};
