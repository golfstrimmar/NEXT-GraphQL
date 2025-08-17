import { gql } from "graphql-tag";

export const typeDefs = gql`
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
    projects: [ProjectSummary!]! # массив проектов с id и name
  }

  type Project {
    id: ID!
    name: String!
    data: String! # JSON в виде строки
    createdAt: String!
    owner: User!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    users: [User!]!
    project(id: ID!): Project
  }
  type ProjectResponse {
    id: ID!
    name: String!
  }
  type Mutation {
    createUser(name: String!, email: String!, password: String!): User!
    loginUser(email: String!, password: String!): AuthPayload!
    loginWithGoogle(idToken: String!): AuthPayload!
    createProject(ownerId: ID!, name: String!, data: String!): ProjectResponse!
    setPassword(email: String!, password: String!): User!
    findProject(projectId: ID!): Project!
    removeProject(projectId: ID!): ID
  }

  type Subscription {
    userCreated: User!
  }
`;
