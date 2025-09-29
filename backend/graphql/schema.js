import { gql } from "graphql-tag";

export const typeDefs = gql`
  type ProjectSummary {
    id: ID!
    name: String!
  }

  scalar JSON

  type User {
    id: ID!
    email: String!
    name: String!
    createdAt: String!
    googleId: String
    picture: String
    projects: [ProjectSummary!]! # массив обычных проектов
    figmaProjects: [FigmaProject!]! # массив Figma-проектов
  }

  type JsonDocument {
    id: ID!
    name: String!
    content: JSON! # теперь JSON-объект
    createdAt: String!
  }

  type Project {
    id: ID!
    name: String!
    data: String! # JSON в виде строки
    createdAt: String!
    owner: User!
  }

  type FigmaProject {
    id: ID!
    name: String!
    fileKey: String!
    nodeId: String!
    token: String!
    createdAt: String!
    owner: User!
  }
  type FigmaProjectData {
    id: ID!
    name: String!
    fileKey: String!
    nodeId: String!
    images: JSON!
    file: JSON!
  }
  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    users: [User!]!
    project(id: ID!): Project
    jsonDocumentByName(name: String!): JsonDocument
    figmaProject(id: ID!): FigmaProject
    figmaProjectsByUser(userId: ID!): [FigmaProject!]!
    getFigmaProjectData(projectId: ID!): FigmaProjectData!
  }

  type ProjectResponse {
    id: ID!
    name: String!
  }

  type FigmaProjectResponse {
    id: ID!
    name: String!
  }

  type Mutation {
    createUser(name: String!, email: String!, password: String!): User!
    loginUser(email: String!, password: String!): AuthPayload!
    loginWithGoogle(idToken: String!): AuthPayload!
    createProject(ownerId: ID!, name: String!, data: String!): ProjectResponse!
    createFigmaProject(
      ownerId: ID!
      name: String!
      fileKey: String!
      nodeId: String!
      token: String!
    ): FigmaProjectResponse!
    setPassword(email: String!, password: String!): User!
    findProject(projectId: ID!): Project!
    removeProject(projectId: ID!): ID
    removeFigmaProject(figmaProjectId: ID!): ID
  }

  type Subscription {
    userCreated: User!
    figmaProjectCreated: FigmaProject!
  }
`;
