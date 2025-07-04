import { gql } from "@apollo/client";

export const GET_USERS = gql`
  query getAllUsers {
    users {
      id
      email
      name
      isLoggedIn
      createdAt
    }
  }
`;

export const GET_ALL_CHATS = gql`
  query getAllChats {
    chats {
      id
      createdAt
      creator {
        id
        name
      }
      participant {
        id
        name
      }
      messages {
        id
        text
        sender {
          id
          name
        }
      }
    }
  }
`;

export const GET_ALL_POSTS = gql`
  query GetAllPosts {
    posts {
      id
      category
      title
      text
      createdAt
      creator {
        id
        name
      }
      likes
      dislikes
      currentUserReaction
    }
  }
`;
