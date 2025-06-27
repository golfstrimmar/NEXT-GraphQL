import { gql } from "@apollo/client";

export const USER_CREATED_SUBSCRIPTION = gql`
  subscription {
    userCreated {
      id
      email
      name
      createdAt
    }
  }
`;



export const MESSAGE_SENT_SUBSCRIPTION = gql`
  subscription ($chatId: ID!) {
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
  subscription {
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



export const USER_LOGGED_IN_SUBSCRIPTION = gql`
  subscription {
    userLoggedIn {
      id
      email
      name
      isLoggedIn
      createdAt
    }
  }
`;

export const USER_LOGGED_OUT_SUBSCRIPTION = gql`
  subscription {
    userLoggedOut {
      id
      email
      name
      isLoggedIn
      createdAt
    }
  }
`;