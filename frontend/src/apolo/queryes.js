import { gql } from "@apollo/client";

<<<<<<< HEAD
=======
export const CHECK_TOKEN = gql`
  query checkToken {
    checkToken
  }
`;

>>>>>>> simple
export const GET_USERS = gql`
  query getAllUsers {
    users {
      id
      email
      name
<<<<<<< HEAD
=======
      picture
>>>>>>> simple
      isLoggedIn
      createdAt
    }
  }
`;

<<<<<<< HEAD
export const GET_ALL_CHATS = gql`
  query getAllChats {
    chats {
=======
export const GET_USER_CHATS = gql`
  query GetUserChats {
    userChats {
>>>>>>> simple
      id
      createdAt
      creator {
        id
        name
<<<<<<< HEAD
=======
        email
>>>>>>> simple
      }
      participant {
        id
        name
<<<<<<< HEAD
      }
      messages {
        id
        text
=======
        email
      }
      messages {
        id
        content
        createdAt
>>>>>>> simple
        sender {
          id
          name
        }
      }
    }
  }
`;
<<<<<<< HEAD
=======

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
>>>>>>> simple
