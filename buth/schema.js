import { buildSchema } from "graphql";

const schema = buildSchema`
  type AuthPayload {
    id: ID!
    email: String!
    name: String
    token: String!
    isLoggedIn: Boolean!
    createdAt: String!
  }
    
  type User {
    id: ID!
    email: String!
    name: String
    isLoggedIn: Boolean!
    createdAt: String!
    updatedAt: String!
  }

 
  type Chat {
    id: ID!
    createdAt: String!
    creator: User!
    participant: User!
    messages: [Message!]!
  }

  type Message {
    id: ID!
    content: String!
    createdAt: String!
    chat: Chat!
    sender: User!
  }

  type Query {
    users: [User!]!
    loggedInUsers: [User!]!
    chats: [Chat!]!
    chat(id: ID!): Chat
  }

  type Mutation {
    createUser(email: String!, name: String, password: String!): User!
    loginUser(email: String!, password: String!): AuthPayload!
    googleLogin(idToken: String!): AuthPayload!
    logoutUser: Boolean!
    createChat(participantId: ID!): Chat!
    sendMessage(chatId: ID!, content: String!): Message!
  }

  type Subscription {
    userCreated: User!
    userLoggedIn: User!
    userLoggedOut: User!
    messageSent(chatId: ID!): Message!
    chatCreated: Chat!
  }
`;

module.exports = schema;
