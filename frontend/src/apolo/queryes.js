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

export const GET_USER_CHATS = gql`
  query GetUserChats {
    userChats {
      id
      createdAt
      creator {
        id
        name
        email
      }
      participant {
        id
        name
        email
      }
      messages {
        id
        content
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
      posts {
        id
        title
        text
        category
        createdAt
        creator {
          id
          name
        }
        likesCount
        dislikesCount
        currentUserReaction
        commentsCount
        likes
        dislikes
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
      totalCount
    }
  }
`;

export const GET_ALL_CATEGORIES = gql`
  query GetAllCategories {
    categories
  }
`;
