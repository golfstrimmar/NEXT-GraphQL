import { gql } from "graphql-tag";

export const typeDefs = gql`
  scalar JSON

  type ProjectSummary {
    id: ID!
    name: String!
  }

  type User {
    id: ID!
    email: String!
    name: String!
    createdAt: String!
    googleId: String
    picture: String
    projects: [ProjectSummary!]!
    figmaProjects: [FigmaProject!]!
  }

  type JsonDocument {
    id: ID!
    name: String!
    content: JSON!
    createdAt: String!
  }

  type Project {
    id: ID!
    name: String!
    data: String!
    createdAt: String!
    owner: User!
  }

  # 🖼️ Тип для изображений из Figma
  type FigmaImage {
    imageRef: String!
    url: String!
  }

  # 🎨 Проект из Figma
  type FigmaProject {
    id: ID!
    name: String!
    fileKey: String!
    nodeId: String!
    token: String!
    createdAt: String!
    owner: User!
    previewUrl: String
  }

  # Полные данные проекта Figma (включая JSON-файл и изображения)
  type FigmaProjectData {
    id: ID!
    name: String!
    fileKey: String!
    nodeId: String!
    token: String!
    file: JSON!
    previewUrl: String
    owner: User!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type ProjectResponse {
    id: ID!
    name: String!
  }

  type FigmaProjectResponse {
    id: ID!
    name: String!
  }

  type Query {
    # 👥 Пользователи
    users: [User!]!

    # 📁 Проекты
    project(id: ID!): Project
    jsonDocumentByName(name: String!): JsonDocument

    # 🎨 Figma проекты
    figmaProject(id: ID!): FigmaProject
    figmaProjectsByUser(userId: ID!): [FigmaProject!]!
    getFigmaProjectData(projectId: ID!): FigmaProjectData!
  }

  type Mutation {
    # 👥 Пользователи
    createUser(name: String!, email: String!, password: String!): User!
    loginUser(email: String!, password: String!): AuthPayload!
    setPassword(email: String!, password: String!): User!
    loginWithGoogle(idToken: String!): AuthPayload!

    # 📁 Проекты
    createProject(ownerId: ID!, name: String!, data: String!): ProjectResponse!
    findProject(projectId: ID!): Project!
    removeProject(projectId: ID!): ID

    # 🎨 Figma проекты
    createFigmaProject(
      ownerId: ID!
      name: String!
      fileKey: String!
      nodeId: String!
      token: String!
    ): FigmaProjectResponse!
    removeFigmaProject(figmaProjectId: ID!): ID

    # ☁️ Загрузка изображений из Figma в Cloudinary
    uploadFigmaImagesToCloudinary(projectId: ID!): [FigmaImage!]!
  }

  type Subscription {
    userCreated: User!
    figmaProjectCreated: FigmaProject!
  }
`;
