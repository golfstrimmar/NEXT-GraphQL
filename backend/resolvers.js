import { PrismaClient } from "@prisma/client";
import { PubSub } from "graphql-subscriptions";
import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

function generateJWT(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

const pubsub = new PubSub();

const USER_CREATED = "USER_CREATED";
const USER_DELETED = "USER_DELETED";
const USER_LOGGEDIN = "USER_LOGGEDIN";
const USER_LOGGEDOUT = "USER_LOGGEDOUT";
const CHAT_CREATED = "CHAT_CREATED";

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";

const resolvers = {
  Query: {
    users: async () => {
      return await prisma.user.findMany();
    },
    chats: async () => {
      return await prisma.chat.findMany({
        include: {
          creator: true,
          participant: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
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
      console.log(" To subscribe  User created  🟢--> ", user);
      pubsub.publish(USER_CREATED, { userCreated: user });
      return user;
    },

    loginUser: async (_, { email, password }) => {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) throw new Error("User not found");
      if (!user.password) {
        throw new Error("GoogleOnlyAccount"); // специальный код ошибки
      }
      const isPasswordValid = await bcrypt.compare(
        password,
        user.password || ""
      );
      if (!isPasswordValid) throw new Error("Invalid password");

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { isLoggedIn: true },
      });
      console.log(" To subscribe login   🟢--> ");
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
    setPassword: async (_, { email, newPassword }) => {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) throw new Error("User not found");
      if (user.password) throw new Error("Password already set");

      const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

      return await prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
      });
    },
    googleLogin: async (_, { idToken }) => {
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken,
          audience: GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload) {
          throw new Error("Invalid Google token");
        }

        const { email, name, sub: googleId } = payload;

        if (!email) {
          throw new Error("Email not provided by Google");
        }

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          // Создание нового пользователя с googleId
          user = await prisma.user.create({
            data: {
              email,
              name,
              password: "", // Пустой пароль для Google-пользователя
              googleId,
              isLoggedIn: true,
            },
          });
          pubsub.publish(USER_CREATED, { userCreated: user });
          pubsub.publish(USER_LOGGEDIN, { userLogin: user });
          console.log("<==== user created via Google ====>", user);
        } else {
          // Обновление существующего пользователя (включая googleId, если ранее не был установлен)
          user = await prisma.user.update({
            where: { email },
            data: {
              name: name || user.name,
              isLoggedIn: true,
              googleId: user.googleId || googleId, // не перезаписываем, если уже есть
            },
          });

          console.log("<==== 🟢 user logged in via Google update ====>", user);
        }

        const token = jwt.sign(
          { userId: user.id, email: user.email },
          JWT_SECRET,
          {
            expiresIn: "1h",
          }
        );
        console.log("To subscribe userLogin  🟢-->");
        pubsub.publish(USER_LOGGEDIN, { userLogin: user });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
          isLoggedIn: true,
          token,
        };
      } catch (err) {
        console.error("Google login error:", err);
        throw new Error("Failed to authenticate with Google");
      }
    },

    logoutUser: async (_, __, { userId }) => {
      if (!userId) throw new Error("Not authenticated");

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { isLoggedIn: false },
      });
      console.log("To subscribe logout  🟢-->");
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
    createChat: async (_, { participantId }, { userId }) => {
      if (!userId) {
        throw new Error("Not authenticated");
      }

      if (userId === participantId) {
        throw new Error("Cannot create chat with yourself");
      }

      const existingChat = await prisma.chat.findFirst({
        where: {
          OR: [
            { creatorId: userId, participantId },
            { creatorId: participantId, participantId: userId },
          ],
        },
      });

      if (existingChat) {
        throw new Error("Chat already exists.");
      }

      const chat = await prisma.chat.create({
        data: {
          creatorId: userId,
          participantId,
        },
        include: {
          creator: true,
          participant: true,
        },
      });
      console.log(" To subscribe create chat 🟢-->");
      pubsub.publish(CHAT_CREATED, { chatCreated: chat });
      return chat;
    },
    deleteChat: async (_, { id }, { userId }) => {
      if (!userId) {
        throw new Error("Not authenticated");
      }

      const chat = await prisma.chat.findUnique({
        where: { id },
        include: {
          creator: true,
          participant: true,
        },
      });

      if (!chat) {
        throw new Error("Chat not found");
      }

      const isParticipant =
        chat.creatorId === userId || chat.participantId === userId;
      if (!isParticipant) {
        throw new Error("You do not have permission to delete this chat");
      }

      await prisma.chat.delete({ where: { id } });
      console.log("To subscribe deleteChat 🟢-->", id);
      pubsub.publish("CHAT_DELETED", { chatDeleted: id });

      return id;
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
    chatCreated: {
      subscribe: () => pubsub.asyncIterator(CHAT_CREATED),
    },
    chatDeleted: {
      subscribe: () => pubsub.asyncIterator("CHAT_DELETED"),
    },
  },
};

export default resolvers;
