import { gql } from "@apollo/client";

export const ADD_USER = gql`
  mutation addUser($email: String!, $name: String, $password: String!) {
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
      }
      participant {
        id
        email
      }
    }
  }
`;

export const DELETE_CHAT = gql`
  mutation deleteChat($chatId: Int!) {
    deleteChat(chatId: $chatId) {
      id
    }
  }
`;

// export const SEND_MESSAGE = gql`
//   mutation senDMessage($chatId: ID!, $content: String!) {
//     sendMessage(chatId: $chatId, content: $content) {
//       ide
//       content
//       createdAt
//       sender {
//         id
//         name
//       }
//     }
//   }
// `;
