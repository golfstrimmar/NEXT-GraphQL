import { gql, useQuery, useMutation, useSubscription } from "@apollo/client";

export const GET_CHATS = gql`
  query {
    chats {
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
