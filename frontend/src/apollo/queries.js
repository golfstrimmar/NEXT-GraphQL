import { gql } from "graphql-tag";

export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
      email
      messages {
        id
        text
      }
    }
  }
`;

export const GET_MESSAGES = gql`
  query GetMessages {
    messages {
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

export const GET_ME = gql`
  query Me {
    me {
      id
      name
      email
      messages {
        id
        text
      }
    }
  }
`;
