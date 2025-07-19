// graphql/mutations.js
import { gql } from "@apollo/client";

export const ADD_USER = gql`
  mutation addUser($email: String!, $name: String!, $password: String!) {
    addUser(email: $email, name: $name, password: $password) {
      id
      email
      name
      createdAt
    }
  }
`;

export const LOGIN_USER = gql`
  mutation loginUser($email: String!, $password: String!) {
    loginUser(email: $email, password: $password) {
      id
      email
      name
      token
      isLoggedIn
      createdAt
    }
  }
`;

export const SET_PASSWORD = gql`
  mutation setPassword($email: String!, $newPassword: String!) {
    setPassword(email: $email, newPassword: $newPassword) {
      id
      email
    }
  }
`;

export const LOGOUT_USER = gql`
  mutation logoutUser {
    logoutUser
  }
`;

export const GOOGLE_LOGIN = gql`
  mutation googleLogin($idToken: String!) {
    googleLogin(idToken: $idToken) {
      id
      email
      name
      token
      isLoggedIn
      createdAt
      picture
    }
  }
`;

export const DELETE_USER = gql`
  mutation deleteUser($id: Int!) {
    deleteUser(id: $id) {
      id
    }
  }
`;

export const CREATE_CHAT = gql`
  mutation createChat($participantId: Int!) {
    createChat(participantId: $participantId) {
      id
      createdAt
      creator {
        id
        email
        name
      }
      participant {
        id
        email
        name
      }
    }
  }
`;

export const DELETE_CHAT = gql`
  mutation deleteChat($id: Int!) {
    deleteChat(id: $id) {
      id
    }
  }
`;
export const SEND_MESSAGE = gql`
  mutation sendMessage($chatId: Int!, $content: String!) {
    sendMessage(chatId: $chatId, content: $content) {
      id
      content
      createdAt
      sender {
        id
        name
      }
      chat {
        id
      }
    }
  }
`;

export const DELETE_MESSAGE = gql`
  mutation deleteMessage($chatId: Int, $messageId: Int!) {
    deleteMessage(chatId: $chatId, messageId: $messageId)
  }
`;

export const CREATE_POST = gql`
  mutation createPost($category: String!, $title: String!, $text: String!) {
    createPost(category: $category, title: $title, text: $text) {
      id
      category
      title
      text
      createdAt
      creator {
        id
        name
        email
      }
      likesCount
      dislikesCount
      likes
      dislikes
    }
  }
`;

export const DELETE_POST = gql`
  mutation deletePost($id: Int!) {
    deletePost(id: $id)
  }
`;

export const LIKE_POST = gql`
  mutation likePost($postId: Int!) {
    likePost(postId: $postId) {
      id
      title
      likes
      dislikes
      likesCount
      dislikesCount
    }
  }
`;

export const DISLIKE_POST = gql`
  mutation disLikePost($postId: Int!) {
    dislikePost(postId: $postId) {
      id
      title
      likes
      dislikes
      likesCount
      dislikesCount
    }
  }
`;

export const ADD_COMMENT = gql`
  mutation addComment($postId: Int!, $text: String!) {
    addComment(postId: $postId, text: $text) {
      postId
      text
    }
  }
`;

export const DELETE_COMMENT = gql`
  mutation deleteComment($id: Int!) {
    deleteComment(id: $id) {
      id
    }
  }
`;

export const LIKE_COMMENT = gql`
  mutation likeComment($commentId: Int!) {
    likeComment(commentId: $commentId) {
      id
      text
      createdAt
      commentLikes {
        id
        user {
          id
          name
        }
      }
      commentDislikes {
        id
        user {
          id
          name
        }
      }
    }
  }
`;

export const DISLIKE_COMMENT = gql`
  mutation dislikeComment($commentId: Int!) {
    dislikeComment(commentId: $commentId) {
      id
      text
      createdAt
      commentLikes {
        id
        user {
          id
          name
        }
      }
      commentDislikes {
        id
        user {
          id
          name
        }
      }
    }
  }
`;

export const UPDATE_POST = gql`
  mutation updatePost(
    $id: Int!
    $category: String!
    $title: String!
    $text: String!
  ) {
    updatePost(id: $id, category: $category, title: $title, text: $text) {
      id
      category
      title
      text
      createdAt
    }
  }
`;
