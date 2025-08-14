import { gql } from "graphql-tag";
export const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    name: String!
    createdAt: String!
    messages: [Message!]!
  }

  type Message {
    id: ID!
    content: String!
    createdAt: String!
    sender: User!
  }
  type AuthPayload {
    token: String!
    user: User!
  }
  type Query {
    users: [User!]!
    messages: [Message!]!
  }

  type Mutation {
    createUser(name: String!, email: String!, password: String!): User!
    loginUser(email: String!, password: String!): AuthPayload!
    createMessage(senderId: ID!, content: String!): Message!
  }

  type Subscription {
    userCreated: User!
  }
`;
