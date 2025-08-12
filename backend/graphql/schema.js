import { gql } from "graphql-tag";

export const typeDefs = gql`
  type User {
    id: Int!
    name: String!
    email: String!
    messages: [Message!]!
  }

  type Message {
    id: Int!
    text: String!
    createdAt: String!
    author: User!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    users: [User!]!
    messages: [Message!]!
    me: User
  }

  type Mutation {
    createUser(name: String!, email: String!, password: String!): User!
    loginUser(email: String!, password: String!): AuthPayload!
    createMessage(text: String!, authorId: Int!): Message!
  }
`;
