const typeDefs = `
  type User {
    id: Int!
    email: String!
    name: String!
    password: String
    googleId: String
    createdAt: String!
    token: String
    isLoggedIn: Boolean
    chatsCreated: [Chat!]!
    chatsParticipated: [Chat!]!
    messages: [Message!]!
  }

  type Chat {
    id: Int!
    createdAt: String!
    updatedAt: String!
    isActive: Boolean!
    creator: User!
    participant: User!
    messages: [Message!]!
  }

  type Message {
    id: Int!
    content: String!
    createdAt: String!
    chat: Chat!
    sender: User!
  }

  type Comment {
    id: Int!
    text: String!
    createdAt: String!
    user: User!
    likesCount: Int!
    dislikesCount: Int!
    currentUserReaction: String
  }

  type Post {
    id: Int!
    title: String!
    text: String!
    category: String!
    createdAt: String!
    creator: User!
    likesCount: Int!
    dislikesCount: Int!
    currentUserReaction: String
    commentsCount: Int!
    comments: [Comment!]!
    likes: [String!]!     # список имён пользователей
    dislikes: [String!]!
  }

  type Category {
    name: String!
  }

type PostsResponse {
  posts: [Post!]!
  totalCount: Int!
}


  type Query {
    users: [User!]!
    chats: [Chat!]!
    userChats: [Chat!]!
    messages(chatId: Int!): [Message!]!
    post(id: Int!): Post
   posts(skip: Int, take: Int): PostsResponse!
    categories: [String!]!
  }

  type Mutation {
    addUser(email: String!, name: String!, password: String, googleId: String): User!
    loginUser(email: String!, password: String!): User!
    setPassword(email: String!, newPassword: String!): User!
    googleLogin(idToken: String!): User!
    logoutUser: Boolean!
    deleteUser(id: Int!): User!

    createChat(participantId: Int!): Chat!
    sendMessage(chatId: Int!, content: String!): Message!
    deleteMessage(chatId: Int, messageId: Int!): Int!
    deleteChat(id: Int!): Chat!

    createPost( category: String! , title: String!, text: String!): Post!
  }

  type Subscription {
    userCreated: User!
    userLogin: User!
    userLoggedOut: User!
    userDeleted: User!
    chatCreated: Chat!
    chatDeleted: ID!
    messageSent(chatId: Int!): Message!
    messageDeleted(chatId: Int!): Int!
  }
`;

export default typeDefs;
