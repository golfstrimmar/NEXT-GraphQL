import { PrismaClient } from "@prisma/client";
import { PubSub } from "graphql-subscriptions";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const pubsub = new PubSub();

const USER_CREATED = "USER_CREATED";
const USER_DELETED = "USER_DELETED";
const USER_LOGGEDIN = "USER_LOGGEDIN";
const USER_LOGGEDOUT = "USER_LOGGEDOUT";

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";

const resolvers = {
  Query: {
    users: async () => {
      return await prisma.user.findMany();
    },
  },

  Mutation: {
    addUser: async (_, { email, name, password, googleId }) => {
      let hashedPassword = null;
      if (password) {
        hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      }

      const user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          googleId,
        },
      });

      pubsub.publish(USER_CREATED, { userCreated: user });
      return user;
    },

    loginUser: async (_, { email, password }) => {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) throw new Error("User not found");

      const isPasswordValid = await bcrypt.compare(
        password,
        user.password || ""
      );
      if (!isPasswordValid) throw new Error("Invalid password");

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { isLoggedIn: true },
      });
      pubsub.publish(USER_LOGGEDIN, {
        userLogin: {
          ...updatedUser,
        },
      });
      pubsub.publish(USER_LOGGEDIN, { userLogin: updatedUser }); // 👈 название поля должно совпадать с typeDefs

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        isLoggedIn: true,
        token,
      };
    },
    logoutUser: async (_, __, { userId }) => {
      if (!userId) throw new Error("Not authenticated");

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { isLoggedIn: false },
      });

      pubsub.publish(USER_LOGGEDOUT, {
        userLoggedOut: updatedUser,
      });

      return true;
    },
    deleteUser: async (_, { id }) => {
      const user = await prisma.user.delete({ where: { id } });
      pubsub.publish(USER_DELETED, { userDeleted: user });
      return user;
    },
  },

  Subscription: {
    userCreated: {
      subscribe: () => pubsub.asyncIterator(USER_CREATED),
    },
    userLogin: {
      subscribe: () => pubsub.asyncIterator(USER_LOGGEDIN),
    },
    userLoggedOut: {
      subscribe: () => pubsub.asyncIterator(USER_LOGGEDOUT),
    },
    userDeleted: {
      subscribe: () => pubsub.asyncIterator(USER_DELETED),
    },
  },
};

export default resolvers;
