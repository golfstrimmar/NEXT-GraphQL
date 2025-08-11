import { gql } from "@apollo/client";

export const CHECK_TOKEN = gql`
  query checkToken {
    checkToken
  }
`;

export const GET_USERS = gql`
  query getAllUsers {
    users {
      id
      email
      name
      picture
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
  query GetAllPosts(
    $skip: Int!
    $take: Int!
    $category: String
    $sortOrder: String
    $searchTerm: String
  ) {
    posts(
      skip: $skip
      take: $take
      category: $category
      sortOrder: $sortOrder
      searchTerm: $searchTerm
    ) {
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
        likes
        dislikes
      }
      totalCount
    }
  }
`;
// {
//   "skip": 0,
//   "take": 5,
//   "category":null
// }
export const GET_ALL_CATEGORIES = gql`
  query GetAllCategories {
    categories
  }
`;

export const GET_ALL_COMMENTS = gql`
  query GetComments($postId: Int!) {
    comments(postId: $postId) {
      id
      createdAt
      text
      postId
      userName: user {
        name
      }
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
