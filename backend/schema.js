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
    picture: String
    chatsCreated: [Chat!]!
    chatsParticipated: [Chat!]!
    messages: [Message!]!
    comments: [Comment!]!
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
  createdAt: String!
  text: String!
  postId: Int!
  user: User!
  commentLikes: [CommentLike!]!
  commentDislikes: [CommentDislike!]!
  }  
type CommentLike {
  id: Int!
  user: User!
}

type CommentDislike {
  id: Int!
  user: User!
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
    likes: [String!]!
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
    posts(skip: Int, take: Int, category: String, sortOrder: String, searchTerm: String): PostsResponse
    categories: [String!]!
    comments(postId: Int!): [Comment!]!
    checkToken: Boolean!
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

    createPost(category: String!, title: String!, text: String!): Post!
    deletePost(id: Int!): Int!
    likePost(postId: Int!): Post!
    dislikePost(postId: Int!): Post!
    updatePost(id: Int!, category: String!, title: String!, text: String!): Post!
    
    addComment(postId: Int!, text: String!): Comment!
    deleteComment(id: Int!): Comment!
    likeComment(commentId: Int!): Comment!
    dislikeComment(commentId: Int!): Comment!
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

    postCreated: Post
    postDeleted: Int!
    postLiked: Post!
    postDisliked: Post!
    postUpdated: Post!

    commentAdded: Comment!
    commentDeleted: Int!
    commentLiked: Comment!
    commentDisliked: Comment!
  }
`;

export default typeDefs;
