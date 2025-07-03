const typeDefs = `
enum ReactionType {
  LIKE
  DISLIKE
}

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

type Post {
  id: Int!
  category: String!
  title: String!
  text: String!
  createdAt: String!
  creator: User!
  likes: Int!
  dislikes: Int!
  currentUserReaction: ReactionType
}

type PostReactionResult {
  postId: Int!
  likes: Int!
  dislikes: Int!
  currentUserReaction: ReactionType
}

type Query {
  users: [User]
  chats: [Chat!]!
  messages(chatId: Int!): [Message!]!
  posts: [Post!]
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
  addPost(category: String!, title: String!, text: String!): Post!
  toggleLike(postId: ID!, reaction: ReactionType!): PostReactionResult!
}

type Subscription {
  userCreated: User
  userLogin: User
  userLoggedOut: User!
  userDeleted: User
  chatCreated: Chat
  chatDeleted: ID!
  messageSent: Message!
  postCreated: Post!
  reactionChanged: PostReactionResult!
}
`;

export default typeDefs;
