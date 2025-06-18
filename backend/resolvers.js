import { PrismaClient } from "@prisma/client";
import { hash, compare } from "bcrypt";
import pkg from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const { sign } = pkg;
const prisma = new PrismaClient();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const resolvers = {
  Query: {
    me: async (_, __, { user }) => {
      if (!user) throw new Error("Not authenticated");
      return user;
    },
    allUsers: async () => {
      const allUsers = await prisma.user.findMany();
      const formattedUsers = allUsers.map((user) => ({
        ...user,
        createdAt: user.createdAt.toISOString(),
      }));
      // console.log("----- allUsers (allUsers):", formattedUsers);

      return formattedUsers;
    },
  },
  Mutation: {
    signup: async (_, { name, email, password }, { pubsub }) => {
      console.log("<==== signup ====>", name, email, password);
      const hashedPassword = await hash(password, 10);
      const user = await prisma.user.create({
        data: { name, email, password: hashedPassword },
      });
      const token = sign({ userId: user.id }, process.env.JWT_SECRET);

      const allUsers = await prisma.user.findMany();
      const formattedUsers = allUsers.map((user) => ({
        ...user,
        createdAt: user.createdAt.toISOString(),
      }));
      console.log("Публикуем USERS_UPDATED (signup):", formattedUsers);
      pubsub.publish("USERS_UPDATED", { usersUpdated: formattedUsers });
      return {
        token,
        user: { ...user, createdAt: user.createdAt.toISOString() },
      };
    },
    login: async (_, { email, password }, { pubsub }) => {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !(await compare(password, user.password))) {
        throw new Error("Invalid credentials");
      }
      const token = sign({ userId: user.id }, process.env.JWT_SECRET);
      pubsub.publish("USER_UPDATED", { userUpdated: user });
      return { token, user };
    },
    googleLogin: async (_, { token }, { pubsub }) => {
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const { sub: googleId, email, name } = ticket.getPayload();

      let user = await prisma.user.findUnique({ where: { googleId } });
      if (!user) {
        user = await prisma.user.create({
          data: { googleId, email, name },
        });
      }
      const jwtToken = sign({ userId: user.id }, process.env.JWT_SECRET);
      pubsub.publish("USER_UPDATED", { userUpdated: user });
      return { token: jwtToken, user };
    },
  },
  Subscription: {
    usersUpdated: {
      subscribe: (_, __, { pubsub }) => {
        console.log("---Subscribing to USERS_UPDATED...");
        return pubsub.asyncIterator(["USERS_UPDATED"]);
      },
      resolve: (payload) => {
        console.log("---Received USERS_UPDATED:", payload.usersUpdated);
        return payload.usersUpdated;
      },
    },
    userUpdated: {
      subscribe: (_, { userId }, { pubsub }) =>
        pubsub.asyncIterator(["USER_UPDATED"]),
      resolve: (payload) => payload.userUpdated,
    },
  },
};
