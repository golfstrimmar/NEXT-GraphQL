import { gql } from "graphql-tag";

export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      email
      name
      createdAt
      projects {
        id
        name
      }
    }
  }
`;
export const GET_JSON_DOCUMENT = gql`
  query GetJsonDocument($name: String!) {
    jsonDocumentByName(name: $name) {
      id
      name
      content
      createdAt
    }
  }
`;
