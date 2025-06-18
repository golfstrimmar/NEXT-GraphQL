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
  },
  Mutation: {
    signup: async (_, { email, password }, { pubsub }) => {
      const hashedPassword = await hash(password, 10);
      const user = await prisma.user.create({
        data: { email, password: hashedPassword },
      });
      const token = sign({ userId: user.id }, process.env.JWT_SECRET);
      pubsub.publish("USER_UPDATED", { userUpdated: user });
      return { token, user };
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
    userUpdated: {
      subscribe: (_, { userId }, { pubsub }) =>
        pubsub.asyncIterator(["USER_UPDATED"]),
      resolve: (payload) => payload.userUpdated,
    },
  },
};
