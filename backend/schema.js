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

type Query {
  users: [User]
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
  logoutUser: Boolean!
  deleteUser(id: Int!): User
}

type Subscription {
  userCreated: User
  userLogin: User
  userLoggedOut: User!
  userDeleted: User
}


`;

export default typeDefs;
