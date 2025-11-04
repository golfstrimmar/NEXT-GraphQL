import { gql } from "graphql-tag";

export const typeDefs = gql`
  scalar JSON

  enum ColorType {
    PALETTE
    TEXT
    BACKGROUND
    FILL
    STROKE
  }

  enum ImageType {
    RASTER
    VECTOR
  }

  input ColorVariableInput {
    variableName: String!
    hex: String!
    type: ColorType!
  }

  input FontClassInput {
    className: String!
    fontFamily: String!
    fontWeight: Int!
    fontSize: Float!
    lineHeight: Float
    letterSpacing: Float
    colorVariableName: String
    sampleText: String
  }
  input JsonDocumentInput {
    name: String!
    content: JSON!
  }
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
    data: JSON!
    createdAt: String!
    owner: User!
  }

  type FigmaImage {
    fileName: String!
    filePath: String!
    nodeId: String!
    imageRef: String!
    figmaProjectId: Int
    type: ImageType
    fileKey: String!
  }

  type ColorVariable {
    id: ID!
    variableName: String!
    hex: String!
    type: ColorType!
    fileKey: String!
    fontClasses: [FontClass!] # связь с FontClass
  }

  type FontClass {
    id: ID!
    className: String!
    fontFamily: String!
    fontWeight: Int!
    fontSize: Float!
    lineHeight: Float
    letterSpacing: Float
    sampleText: String!
    fileKey: String!
    colorVariableName: String
    color: ColorVariable # подтягивается через resolver
  }

  type FigmaProject {
    id: ID!
    name: String!
    fileKey: String!
    nodeId: String!
    token: String!
    owner: User!
    previewUrl: String
    figmaImages: [FigmaImage!]!
  }

  type FigmaProjectData {
    id: ID!
    name: String!
    fileKey: String!
    nodeId: String!
    token: String!
    file: JSON!
    previewUrl: String
    owner: User!
    figmaImages: [FigmaImage!]!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type ProjectResponse {
    id: ID!
    name: String!
  }

  type Query {
    users: [User!]!
    findProject(id: ID!): Project
    getAllProjectsByUser(userId: ID!): [Project!]
    jsonDocumentByName(name: String!): JsonDocument
    figmaProject(id: ID!): FigmaProject
    figmaProjectsByUser(userId: ID!): [FigmaProject!]!
    getFigmaProjectData(projectId: ID!): FigmaProjectData!
    getColorVariablesByFileKey(fileKey: String!): [ColorVariable!]!
    getFontClassesByFileKey(fileKey: String!): [FontClass!]!
  }

  type Mutation {
    createUser(name: String!, email: String!, password: String!): User!
    loginUser(email: String!, password: String!): AuthPayload!
    setPassword(email: String!, password: String!): User!
    loginWithGoogle(idToken: String!): AuthPayload!
    createProject(ownerId: ID!, name: String!, data: JSON!): Project!
    updateProject(projectId: ID!, data: JSON!): Project!
    removeProject(projectId: ID!): ID

    createFigmaProject(
      ownerId: ID!
      name: String!
      fileKey: String!
      nodeId: String!
      token: String!
    ): FigmaProject!
    removeFigmaProject(figmaProjectId: ID!): ID
    uploadFigmaImagesToCloudinary(projectId: ID!): [FigmaImage!]!
    uploadFigmaSvgsToCloudinary(projectId: ID!): [FigmaImage!]!

    removeFigmaImage(nodeId: String!, figmaProjectId: Int!): FigmaImage!

    transformRasterToSvg(nodeId: String!): FigmaImage!
    addFontClasses(
      fileKey: String!
      fontClasses: [FontClassInput!]!
    ): [FontClass!]!
    extractAndSaveColors(
      fileKey: String!
      figmaFile: JSON!
      nodeId: String!
    ): [ColorVariable!]!
  }

  type Subscription {
    userCreated: User!
    # figmaProjectCreated: FigmaProject!
  }
`;
