import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const resolvers = {
  Query: {
    users: () => prisma.user.findMany({ include: { messages: true } }),
    messages: () => prisma.message.findMany({ include: { sender: true } }),
  },
  Mutation: {
    createUser: (_, args) =>
      prisma.user.create({
        data: {
          email: args.email,
          name: args.name,
          password: args.password,
        },
      }),
    createMessage: (_, args) =>
      prisma.message.create({
        data: {
          content: args.content,
          senderId: args.senderId,
        },
      }),
  },
};
