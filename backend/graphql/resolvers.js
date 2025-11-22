import bcrypt from "bcrypt";
import { EventEmitter } from "events";
import jwt from "jsonwebtoken";
import prisma from "../prisma/client.js";
import { OAuth2Client } from "google-auth-library";
import { GraphQLJSON } from "graphql-type-json";
// ----queries
import getFigmaProjectData from "../queries/getFigmaProjectData.js";
// ----mutations
import uploadFigmaImagesToCloudinary from "../mutations/FigmaImages.js";
import uploadFigmaSvgsToCloudinary from "../mutations/FigmaSVG.js";
import removeFigmaImage from "../mutations/removeFigmaImage.js";
import transformRasterToSvg from "../mutations/transformRasterToSvg.js";
import removeFigmaProject from "../mutations/removeFigmaProject.js";
import extractAndSaveColors from "../mutations/extractAndSaveColors.js";
import extractAndSaveFonts from "../mutations/extractAndSaveFonts.js";
import uploadFigmaJsonProject from "../mutations/uploadFigmaJsonProject.js";
// ----
import { GraphQLUpload } from "graphql-upload";
// ----

const ee = new EventEmitter();
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
const SALT_ROUNDS = 10;
export const resolvers = {
  JSON: GraphQLJSON,
  Upload: GraphQLUpload,
  Query: {
    users: () =>
      prisma.user.findMany({
        include: { projects: true },
      }),
    findProject: (_, { id }) =>
      prisma.project.findUnique({
        where: { id: Number(id) },
        include: { owner: true },
      }),
    getAllProjectsByUser: (_, { userId }) =>
      prisma.project.findMany({ where: { ownerId: Number(userId) } }),
    jsonDocumentByName: async (_, { name }) => {
      const Doc = await prisma.jsonDocument.findUnique({ where: { name } });
      return Doc || null;
    },

    figmaProjectsByUser: async (_, { userId }) => {
      return prisma.figmaProject.findMany({
        where: { ownerId: Number(userId) },
        include: { owner: true },
      });
    },
    getColorVariablesByFileKey: async (_, { fileKey }) =>
      prisma.colorVariable.findMany({ where: { fileKey } }),
    getFontsByFileKey: async (_, { fileKey }) =>
      prisma.font.findMany({ where: { fileKey } }),
    getFigmaProjectData,
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
      if (!user) throw new Error("User not found");
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
      if (!email || !password)
        throw new Error("Email and password are required.");
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) throw new Error("User not found.");
      if (user.password)
        throw new Error("User already has a password. Use login instead.");
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
    createProject: async (_, { ownerId, name, data }) =>
      prisma.project.create({
        data: { name, data, ownerId: Number(ownerId) },
      }),
    updateProject: async (_, { projectId, data }) =>
      prisma.project.update({
        where: { id: Number(projectId) },
        data: { data },
      }),
    removeProject: async (_, { projectId }) => {
      const project = await prisma.project.delete({
        where: { id: Number(projectId) },
      });
      return project.id;
    },
    uploadFigmaImagesToCloudinary,
    uploadFigmaSvgsToCloudinary,
    transformRasterToSvg,
    removeFigmaImage,
    removeFigmaProject,
    extractAndSaveColors,
    extractAndSaveFonts,
    uploadFigmaJsonProject,
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
