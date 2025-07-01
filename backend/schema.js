const typeDefs = `
type User {
  id: Int!
  email: String!
  password: String
  googleId: String
  name: String
  isLoggedIn: Boolean
  createdAt: String
  updatedAt: String
}
type Chat {
  id: Int!
  createdAt: String
  creator: User!
  participant: User!
  messages: [Message!]!
}

type Message {
  id: Int!
  text: String!
  sender: User!
  chat: Chat!
  createdAt: String!
}




type Query {
  users: [User]
  chats: [Chat!]!
  messages(chatId: Int!): [Message!]!
}

type AuthPayload {
  id: Int!
  email: String!
  name: String
  createdAt: String
  isLoggedIn: Boolean
  token: String
}

type Mutation {
  addUser(
    email: String!
    name: String
    password: String
    googleId: String
  ): User
  loginUser(email: String!, password: String!): AuthPayload
  googleLogin(idToken: String!): AuthPayload
  logoutUser: Boolean!
  setPassword(email: String!, newPassword: String!): User
  deleteUser(id: Int!): User
  createChat(participantId: Int!): Chat!
  deleteChat(id: Int!): ID!
  sendMessage(chatId: Int!, text: String!): Message!
}

type Subscription {
  userCreated: User
  userLogin: User
  userLoggedOut: User!
  userDeleted: User
  chatCreated: Chat
  chatDeleted: ID!
  messageSent(chatId: Int!): Message!
}


`;

export default typeDefs;
