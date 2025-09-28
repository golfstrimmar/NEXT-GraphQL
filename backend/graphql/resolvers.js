import bcrypt from "bcrypt";
import { EventEmitter } from "events";
import jwt from "jsonwebtoken";
import prisma from "../prisma/client.js";
import { OAuth2Client } from "google-auth-library";
import { GraphQLJSON } from "graphql-type-json";

const ee = new EventEmitter();
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
const SALT_ROUNDS = 10;

export const resolvers = {
  JSON: GraphQLJSON,
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
    jsonDocumentByName: (_, { name }) =>
      prisma.jsonDocument.findFirst({
        where: { name },
      }),
    figmaProject: (_, { id }) =>
      prisma.figmaProject.findUnique({
        where: { id: Number(id) },
        include: { owner: true },
      }),
    getFigmaProjectData: async (_, { projectId }) => {
      const project = await prisma.figmaProject.findUnique({
        where: { id: Number(projectId) },
      });
      if (!project) throw new Error("Project not found");

      const headers = { "X-Figma-Token": project.token };

      // 1. Изображения
      const imagesRes = await fetch(
        `https://api.figma.com/v1/images/${project.fileKey}?ids=${project.nodeId}&scale=1`,
        { headers }
      );
      if (!imagesRes.ok) throw new Error("Failed to fetch images");
      const imagesData = await imagesRes.json();

      // 2. Полный документ Figma (nodes, styles, fonts и т.д.)
      const fileRes = await fetch(
        `https://api.figma.com/v1/files/${project.fileKey}`,
        { headers }
      );
      if (!fileRes.ok) throw new Error("Failed to fetch file data");
      const fileData = await fileRes.json();

      return {
        id: project.id,
        name: project.name,
        fileKey: project.fileKey,
        nodeId: project.nodeId,
        images: imagesData.images,
        file: fileData, // здесь все nodes, styles, fonts, colors и т.д.
      };
    },
    figmaProjectsByUser: (_, { userId }) =>
      prisma.figmaProject.findMany({
        where: { ownerId: Number(userId) },
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
    createFigmaProject: async (
      _,
      { ownerId, name, fileKey, nodeId, token }
    ) => {
      console.log("<====👤👤👤createFigmaProject====>", name);
      try {
        const project = await prisma.figmaProject.create({
          data: {
            name,
            fileKey,
            nodeId,
            token,
            ownerId: Number(ownerId),
          },
        });
        ee.emit("FIGMA_PROJECT_CREATED", project);
        return { id: project.id, name: project.name };
      } catch (error) {
        if (error.code === "P2002") {
          throw new Error("Figma project with this name already exists.");
        }
        throw error;
      }
    },
    removeFigmaProject: async (_, { figmaProjectId }) => {
      const project = await prisma.figmaProject.delete({
        where: { id: Number(figmaProjectId) },
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
    figmaProjects: (parent) =>
      prisma.figmaProject.findMany({
        where: { ownerId: parent.id },
        select: { id: true, name: true, fileKey: true, nodeId: true },
      }),
  },

  Project: {
    owner: (parent) =>
      prisma.user.findUnique({ where: { id: parent.ownerId } }),
  },
  FigmaProject: {
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
    figmaProjectCreated: {
      subscribe: async function* () {
        const queue = [];
        const handler = (payload) => queue.push(payload);
        ee.on("FIGMA_PROJECT_CREATED", handler);

        try {
          while (true) {
            if (queue.length === 0)
              await new Promise((r) => setTimeout(r, 100));
            else yield { figmaProjectCreated: queue.shift() };
          }
        } finally {
          ee.off("FIGMA_PROJECT_CREATED", handler);
        }
      },
    },
  },
};
