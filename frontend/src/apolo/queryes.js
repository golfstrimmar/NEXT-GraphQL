import { gql } from "@apollo/client";

export const GET_USERS = gql`
  query {
    users {
      id
      email
      name
      isLoggedIn
      createdAt
    }
  }
`;


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