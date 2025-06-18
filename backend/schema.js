import { gql } from "graphql-tag";

export const typeDefs = gql`
  type User {
    id: Int!
    email: String!
    name: String!
    createdAt: String!
    googleId: String
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    me: User
    allUsers: [User!]!
  }

  type Mutation {
    signup(name: String!, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    googleLogin(token: String!): AuthPayload!
  }

  type Subscription {
    userUpdated(userId: Int!): User
    usersUpdated: [User!]
  }
`;
