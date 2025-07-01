import { gql } from "@apollo/client";

export const USER_CREATED_SUBSCRIPTION = gql`
  subscription userCreated {
    userCreated {
      id
      email
      name
      createdAt
    }
  }
`;

export const USER_LOGIN_SUBSCRIPTION = gql`
  subscription userLogin {
    userLogin {
      id
      email
      name
      isLoggedIn
      createdAt
    }
  }
`;

export const USER_LOGGEDOUT_SUBSCRIPTION = gql`
  subscription userLoggedOut {
    userLoggedOut {
      id
      email
      isLoggedIn
    }
  }
`;

export const USER_DELETED_SUBSCRIPTION = gql`
  subscription userDeleted {
    userDeleted {
      id
      email
      name
      createdAt
    }
  }
`;

export const MESSAGE_SENT_SUBSCRIPTION = gql`
  subscription messageSent($chatId: ID!) {
    messageSent(chatId: $chatId) {
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

export const CHAT_CREATED_SUBSCRIPTION = gql`
  subscription chatCreated {
    chatCreated {
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

export const CHAT_DELETED_SUBSCRIPTION = gql`
  subscription chatDeleted {
    chatDeleted
  }
`;
