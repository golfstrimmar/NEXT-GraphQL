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
