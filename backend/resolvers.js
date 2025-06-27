import { PrismaClient } from "@prisma/client";
import { PubSub } from "graphql-subscriptions";

const prisma = new PrismaClient();
const pubsub = new PubSub();
const USER_CREATED = "USER_CREATED";

const resolvers = {
  Query: {
    users: async () => {
      return await prisma.user.findMany();
    },
  },

  Mutation: {
    addUser: async (_, { email, name, password, googleId }) => {
      const user = await prisma.user.create({
        data: {
          email,
          name,
          password,
          googleId,
        },
      });

      // 📢 публикуем нового пользователя
      pubsub.publish(USER_CREATED, { userCreated: user });

      return user;
    },
  },

  Subscription: {
    userCreated: {
      subscribe: () => pubsub.asyncIterator(USER_CREATED),
    },
  },
};

export default resolvers;
