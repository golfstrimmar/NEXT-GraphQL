import { gql } from "graphql-tag";

// Создание пользователя
export const CREATE_USER = gql`
  mutation CreateUser($name: String!, $email: String!, $password: String!) {
    createUser(name: $name, email: $email, password: $password) {
      id
      name
      email
    }
  }
`;

// Логин пользователя
export const LOGIN_USER = gql`
  mutation LoginUser($email: String!, $password: String!) {
    loginUser(email: $email, password: $password) {
      token
      user {
        id
        name
        email
        createdAt
      }
    }
  }
`;
export const LOGIN_WITH_GOOGLE = gql`
  mutation LoginWithGoogle(
    $googleId: String!
    $name: String!
    $email: String!
  ) {
    loginWithGoogle(googleId: $googleId, name: $name, email: $email) {
      token
      user {
        id
        name
        email
        googleId
        createdAt
      }
    }
  }
`;
// Создание сообщения
export const CREATE_MESSAGE = gql`
  mutation CreateMessage($content: String!, $senderId: Int!) {
    createMessage(content: $content, senderId: $senderId) {
      id
      content
      createdAt
      sender {
        id
        name
      }
    }
  }
`;

// Подписка на создание пользователя
export const USER_CREATED_SUBSCRIPTION = gql`
  subscription UserCreated {
    userCreated {
      id
      name
      email
    }
  }
`;
