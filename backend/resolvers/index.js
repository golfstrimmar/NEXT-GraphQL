import Query from "./queryResolvers.js";
import Mutation from "./mutationResolvers.js";
import Subscription from "./subscriptionResolvers.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const resolvers = {
  Query,
  Mutation,
  Subscription,
<<<<<<< HEAD

  Chat: {
    messages: async (parent) => {
      return await prisma.message.findMany({
        where: { chatId: parent.id },
        orderBy: { createdAt: "asc" },
        include: { sender: true },
      });
    },
  },
=======
>>>>>>> simple
};

export default resolvers;
