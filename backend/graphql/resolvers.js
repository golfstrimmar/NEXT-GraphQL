import bcrypt from "bcrypt";
import { EventEmitter } from "events";
import jwt from "jsonwebtoken";
import prisma from "../prisma/client.js";
import { OAuth2Client } from "google-auth-library";
// import { UserInputError } from "@apollo/server";
const ee = new EventEmitter();
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
const SALT_ROUNDS = 10;
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
      if (!user) {
        console.log("⚠️USER NOT FOUND");
        throw new Error("User not found");
      } else {
        console.log("👤👤👤USER FOUND", user);
      }
      if (!user.password) {
        const error = new Error(
          "This account was registered via Google. User must set a password."
        );
        error.code = "ACCOUNT_NEEDS_PASSWORD";
        throw error;
      }
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) throw new Error("Invalid password");

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
    setPassword: async (_, { email, password }) => {
      console.log("<=====👤👤👤setPassword====>", email, password);
      if (!email || !password) {
        throw new Error("Email and password are required.");
      }

      // Находим пользователя
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw new Error("User not found.");
      }

      if (user.password) {
        throw new Error("User already has a password. Use login instead.");
      }

      // Хешируем новый пароль
      const hashedPassword = await bcrypt.hash(password, 10);

      // Обновляем пользователя
      const updatedUser = await prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
      });

      const { password: _password, ...safeUser } = updatedUser;
      return safeUser;
    },

    loginWithGoogle: async (_, { idToken }) => {
      const client = new OAuth2Client();

      console.log("<====👤👤👤idToken====>", idToken);
      // Проверяем idToken через Google
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) throw new Error("Invalid Google token");

      const { sub: googleId, email, name } = payload;

      // Ищем пользователя по googleId
      let user = await prisma.user.findUnique({ where: { googleId } });

      // Если нет, создаём нового
      if (!user) {
        user = await prisma.user.create({
          data: {
            name,
            email,
            googleId,
            password: null,
          },
        });

        ee.emit("USER_CREATED", user);
      }

      // Создаём JWT токен для нашего приложения
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
        expiresIn: "7d",
      });

      const formattedUser = {
        ...user,
        createdAt: new Date(user.createdAt).getTime().toString(),
      };
      console.log("<====👤👤👤formattedUser====>", formattedUser);
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
