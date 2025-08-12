import { gql } from "graphql-tag";

export const CREATE_USER = gql`
  mutation CreateUser($name: String!, $email: String!, $password: String!) {
    createUser(name: $name, email: $email, password: $password) {
      id
      name
      email
    }
  }
`;

export const LOGIN_USER = gql`
  mutation LoginUser($email: String!, $password: String!) {
    loginUser(email: $email, password: $password) {
      token
      user {
        id
        name
        email
      }
    }
  }
`;

export const LOGOUT_USER = gql`
  mutation LogoutUser($id: Int!) {
    logoutUser(id: $id) {
      id
      isLoggedIn
    }
  }
`;

export const CREATE_MESSAGE = gql`
  mutation CreateMessage($text: String!, $authorId: Int!) {
    createMessage(text: $text, authorId: $authorId) {
      id
      text
      createdAt
      author {
        id
        name
      }
    }
  }
`;
