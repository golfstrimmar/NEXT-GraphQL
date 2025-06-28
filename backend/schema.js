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

type Mutation {
  addUser(
    email: String!
    name: String
    password: String
    googleId: String
  ): User
  deleteUser(id: Int!): User
}

type Subscription {
  userCreated: User
  userDeleted: User
}


`;

export default typeDefs;
