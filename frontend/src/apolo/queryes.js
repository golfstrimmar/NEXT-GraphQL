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
        createdAt
        sender {
          id
          name
        }
      }
    }
  }
`;

export const GET_ALL_POSTS = gql`
  query GetAllPosts($skip: Int!, $take: Int!) {
    posts(skip: $skip, take: $take) {
      totalCount
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
        comments {
          id
          text
          createdAt
          user {
            id
            name
          }
          likesCount
          dislikesCount
          currentUserReaction
        }
      }
    }
  }
`;
export const GET_ALL_CATEGORIES = gql`
  query GetAllCategories {
    categories
  }
`;
