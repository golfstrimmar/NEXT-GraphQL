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

  type Query {
    users: [User!]!
    chats: [Chat!]!
    userChats: [Chat!]!
    messages(chatId: Int!): [Message!]!
  }

  type Mutation {
    addUser(email: String!, name: String!, password: String, googleId: String): User!
    loginUser(email: String!, password: String!): User!
    setPassword(email: String!, newPassword: String!): User!
    googleLogin(idToken: String!): User!
    logoutUser: Boolean!
    deleteUser(id: Int!): User!
    
    createChat( participantId: Int!): Chat!
    sendMessage(chatId: Int!, content: String!): Message!
    deleteChat(id: Int!): Chat!
  }

  type Subscription {
    userCreated: User!
    userLogin: User!
    userLoggedOut: User!
    userDeleted: User!
    messageSent(chatId: Int!): Message!
    chatCreated: Chat!
    chatDeleted: ID!
  }
`;

export default typeDefs;
