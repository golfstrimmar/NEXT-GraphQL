import { gql } from "@apollo/client";

export const ADD_USER = gql`
  mutation ($email: String!, $name: String, $password: String!) {
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

export const LOGOUT_USER = gql`
  mutation logoutUser {
    logoutUser
  }
`;

export const GOOGLE_LOGIN = gql`
  mutation ($idToken: String!) {
    googleLogin(idToken: $idToken) {
      id
      email
      name
      token
      isLoggedIn
      createdAt
    }
  }
`;

export const DELETE_USER = gql`
  mutation DeleteUser($id: Int!) {
    deleteUser(id: $id) {
      id
    }
  }
`;
export const CREATE_CHAT = gql`
  mutation ($participantId: ID!) {
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

export const SEND_MESSAGE = gql`
  mutation ($chatId: ID!, $content: String!) {
    sendMessage(chatId: $chatId, content: $content) {
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
