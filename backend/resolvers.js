import { PrismaClient } from "@prisma/client";
import { PubSub } from "graphql-subscriptions";

const prisma = new PrismaClient();
const pubsub = new PubSub();
const USER_CREATED = "USER_CREATED";
const USER_DELETED = "USER_DELETED";

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
    deleteUser: async (_, { id }) => {
      console.log("<==== delete user ====>", id);
      const user = await prisma.user.delete({ where: { id } });
      pubsub.publish(USER_DELETED, { userDeleted: user });
      return user;
    },
  },

  Subscription: {
    userCreated: {
      subscribe: () => pubsub.asyncIterator(USER_CREATED),
    },
    userDeleted: {
      subscribe: () => pubsub.asyncIterator(USER_DELETED),
    },
  },
};

export default resolvers;
