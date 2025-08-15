import { gql } from "graphql-tag";

export const USER_CREATED = gql`
  subscription UserCreated {
    userCreated {
      id
      name
      email
    }
  }
`;

export const MESSAGE_CREATED = gql`
  subscription MessageCreated {
    messageCreated {
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
