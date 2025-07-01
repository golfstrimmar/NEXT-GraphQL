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
}



type Query {
  users: [User]
  chats: [Chat!]!
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
}

type Subscription {
  userCreated: User
  userLogin: User
  userLoggedOut: User!
  userDeleted: User
  chatCreated: Chat
  chatDeleted: ID!
}


`;

export default typeDefs;
