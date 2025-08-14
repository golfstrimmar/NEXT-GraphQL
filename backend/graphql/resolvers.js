import prisma from "../prisma/client.js";
import bcrypt from "bcrypt";
import { EventEmitter } from "events";

const ee = new EventEmitter();

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

      // триггер события для подписки
      ee.emit("USER_CREATED", newUser);

      return newUser;
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
              // ждём события
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
