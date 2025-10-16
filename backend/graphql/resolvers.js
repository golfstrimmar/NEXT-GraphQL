import bcrypt from "bcrypt";
import { EventEmitter } from "events";
import jwt from "jsonwebtoken";
import prisma from "../prisma/client.js";
import { OAuth2Client } from "google-auth-library";
import { GraphQLJSON } from "graphql-type-json";
import uploadFigmaImagesToCloudinary from "../mutations/FigmaImages.js";
import uploadFigmaSvgsToCloudinary from "../mutations/FigmaSVG.js";
import transformRasterToSvg from "../mutations/transformRasterToSvg.js";

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
    getFigmaProjectData: async (_, { projectId }) => {
      console.log("<====projectId====>", projectId);
      const allProjects = await prisma.figmaProject.findMany();
      console.log("All projects:", allProjects);
      const project = await prisma.figmaProject.findUnique({
        where: { id: Number(projectId) },
        include: {
          owner: true,
          figmaImages: true,
        },
      });

      if (!project) throw new Error("Project not found");

      let fileData = null;

      try {
        const headers = { "X-Figma-Token": project.token };
        const fileRes = await fetch(
          `https://api.figma.com/v1/files/${project.fileKey}`,
          { headers }
        );

        if (!fileRes.ok) {
          throw new Error(`Failed to fetch Figma file: ${fileRes.statusText}`);
        }

        fileData = await fileRes.json();
      } catch (err) {
        console.error("❌ Failed to fetch Figma file data", project.id, err);
      }

      return {
        ...project,
        file: fileData,
      };
    },
    figmaProjectsByUser: async (_, { userId }) => {
      const projects = await prisma.figmaProject.findMany({
        where: { ownerId: Number(userId) },
        include: { owner: true },
      });
      return projects;
    },
    getColorVariablesByFileKey: async (_, { fileKey }) => {
      return prisma.colorVariable.findMany({ where: { fileKey } });
    },
    getFontClassesByFileKey: async (_, { fileKey }) => {
      return prisma.fontClass.findMany({ where: { fileKey } });
    },
    getFigmaFontsByFileKey: async (_, { fileKey }) => {
      return prisma.figmaFont.findMany({ where: { fileKey } });
    },
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
      const user = await prisma.user.findUnique({
        where: { email },
        include: { projects: true },
      });
      if (!user) {
        throw new Error("User not found");
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
      return { token, user: formattedUser };
    },
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
      try {
        const headers = {
          "X-Figma-Token": token,
        };

        const response = await fetch(
          `https://api.figma.com/v1/images/${fileKey}?ids=${nodeId}&scale=1`,
          { headers }
        );

        const data = await response.json();
        const previewUrl = data?.images?.[nodeId] || null;

        const project = await prisma.figmaProject.create({
          data: {
            name,
            fileKey,
            nodeId,
            token,
            previewUrl,
            owner: {
              connect: { id: Number(ownerId) },
            },
          },
        });

        return {
          id: project.id,
          name: project.name,
          fileKey: project.fileKey,
          nodeId: project.nodeId,
          previewUrl: project.previewUrl,
        };
      } catch (error) {
        if (error.code === "P2002") {
          throw new Error("Figma project with this name already exists.");
        }
        throw error;
      }
    },
    removeFigmaProject: async (_, { figmaProjectId }) => {
      const project = await prisma.figmaProject.findUnique({
        where: { id: Number(figmaProjectId) },
        select: { id: true, fileKey: true },
      });

      if (!project) throw new Error("Project not found");

      // Удаляем проект
      await prisma.figmaProject.delete({
        where: { id: Number(figmaProjectId) },
      });

      // Проверяем, есть ли ещё проекты с этим fileKey
      const remaining = await prisma.figmaProject.count({
        where: { fileKey: project.fileKey },
      });

      // Если проектов больше нет — удаляем все переменные цветов с этим fileKey
      if (remaining === 0) {
        await prisma.colorVariable.deleteMany({
          where: { fileKey: project.fileKey },
        });
      }
      return project.id;
    },
    uploadFigmaImagesToCloudinary,
    uploadFigmaSvgsToCloudinary,
    transformRasterToSvg,
    removeFigmaImage: async (_, { nodeId, figmaProjectId }) => {
      return prisma.figmaImage.delete({
        where: {
          figmaProjectId_nodeId: {
            figmaProjectId,
            nodeId,
          },
        },
      });
    },
    addColorVariables: async (_, { fileKey, colors }) => {
      await prisma.colorVariable.createMany({
        data: colors.map((c) => ({
          variableName: c.variableName,
          hex: c.hex,
          type: c.type,
          fileKey,
        })),
        skipDuplicates: true,
      });
      return prisma.colorVariable.findMany({
        where: { fileKey },
      });
    },
    addFontClasses: async (_, { fileKey, fontClasses }) => {
      await prisma.fontClass.createMany({
        data: fontClasses.map((f) => ({
          className: f.className,
          fontFamily: f.fontFamily,
          fontWeight: f.fontWeight,
          fontSize: f.fontSize,
          lineHeight: f.lineHeight,
          letterSpacing: f.letterSpacing,
          fileKey,
        })),
        skipDuplicates: true,
      });
      return prisma.fontClass.findMany({ where: { fileKey } });
    },
    addFigmaFonts: async (_, { fileKey, fonts }) => {
      await prisma.figmaFont.createMany({
        data: fonts.map((f) => ({
          fontFamily: f.fontFamily,
          fontWeight: f.fontWeight,
          fontSize: f.fontSize,
          lineHeight: f.lineHeight,
          letterSpacing: f.letterSpacing,
          source: f.source,
          nodeId: f.nodeId,
          fileKey,
        })),
        skipDuplicates: true,
      });
      return prisma.figmaFont.findMany({ where: { fileKey } });
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
    figmaImages: (parent) =>
      prisma.figmaImage.findMany({ where: { figmaProjectId: parent.id } }),
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
