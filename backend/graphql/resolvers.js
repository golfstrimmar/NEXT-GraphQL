import bcrypt from "bcrypt";
import { EventEmitter } from "events";
import jwt from "jsonwebtoken";
import prisma from "../prisma/client.js";
import { OAuth2Client } from "google-auth-library";

const ee = new EventEmitter();
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
const SALT_ROUNDS = 10;

export const resolvers = {
  Query: {
    users: () =>
      prisma.user.findMany({
        include: {
          projects: true,
        },
      }),
    project: (_, { id }) =>
      prisma.project.findUnique({
        where: { id: Number(id) },
        include: { owner: true },
      }),
  },

  Mutation: {
    createUser: async (_, { name, email, password }) => {
      try {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const newUser = await prisma.user.create({
          data: { name, email, password: hashedPassword },
          include: { projects: true },
        });

        ee.emit("USER_CREATED", newUser);
        return newUser;
      } catch (err) {
        if (err.code === "P2002") {
          throw new Error("User with this email already exists.");
        }
        throw err;
      }
    },

    loginUser: async (_, { email, password }) => {
      console.log("EMAIL FROM REQUEST:", JSON.stringify(email));

      const allUsers = await prisma.user.findMany();
      console.log(
        "ALL USERS:",
        allUsers.map((u) => u.email.trim().toLowerCase())
      );

      const user = await prisma.user.findUnique({
        where: { email },
        include: { projects: true },
      });
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
      if (!email || !password) {
        throw new Error("Email and password are required.");
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw new Error("User not found.");
      }

      if (user.password) {
        throw new Error("User already has a password. Use login instead.");
      }

      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      const updatedUser = await prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
      });

      const { password: _password, ...safeUser } = updatedUser;
      return safeUser;
    },

    loginWithGoogle: async (_, { idToken }) => {
      const client = new OAuth2Client();

      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) throw new Error("Invalid Google token");

      const { sub: googleId, email, name, picture } = payload;

      let user = await prisma.user.findUnique({
        where: { email },
        include: { projects: true },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            name,
            email,
            googleId,
            password: null,
            picture,
          },
          include: { projects: true },
        });

        ee.emit("USER_CREATED", user);
      }

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

    // createMessage -> createProject
    // Возвращаем СТРОКУ — имя созданного проекта.

    createProject: async (_, { ownerId, name, data }) => {
      try {
        const project = await prisma.project.create({
          data: { name, data, ownerId: Number(ownerId) },
        });
        return { id: project.id, name: project.name };
      } catch (error) {
        if (error.code === "P2002") {
          throw new Error("Project with this name already exists.");
        }
        throw error;
      }
    },

    findProject: async (_, { projectId }) => {
      const project = await prisma.project.findUnique({
        where: { id: Number(projectId) },
      });
      return project;
    },

    removeProject: async (_, { projectId }) => {
      const project = await prisma.project.delete({
        where: { id: Number(projectId) },
      });
      return project.id;
    },
  },

  User: {
    projects: (parent) =>
      prisma.project.findMany({
        where: { ownerId: parent.id },
        select: { id: true, name: true },
      }),
  },

  Project: {
    owner: (parent) =>
      prisma.user.findUnique({ where: { id: parent.ownerId } }),
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
