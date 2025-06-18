import { gql } from "graphql-tag";

export const typeDefs = gql`
  type User {
    id: Int!
    email: String!
    name: String
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    me: User
  }

  type Mutation {
    signup(email: String!, password: String!): AuthPayload
    login(email: String!, password: String!): AuthPayload
    googleLogin(token: String!): AuthPayload
  }

  type Subscription {
    userUpdated(userId: Int!): User
  }
`;
