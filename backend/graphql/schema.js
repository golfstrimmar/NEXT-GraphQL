import { gql } from "graphql-tag";

export const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    name: String!
    createdAt: String!
    googleId: String
    projects: [String!]! # только названия проектов
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

  type Mutation {
    createUser(name: String!, email: String!, password: String!): User!
    loginUser(email: String!, password: String!): AuthPayload!
    loginWithGoogle(idToken: String!): AuthPayload!
    createProject(ownerId: ID!, name: String!, data: String!): Project!
    setPassword(email: String!, password: String!): User!
  }

  type Subscription {
    userCreated: User!
  }
`;
