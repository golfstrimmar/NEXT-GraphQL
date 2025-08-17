import { gql } from "graphql-tag";

// Создание пользователя
export const CREATE_USER = gql`
  mutation CreateUser($name: String!, $email: String!, $password: String!) {
    createUser(name: $name, email: $email, password: $password) {
      id
      name
      email
      googleId
      picture
      projects {
        id
        name
      }
    }
  }
`;

// Логин пользователя
export const LOGIN_USER = gql`
  mutation LoginUser($email: String!, $password: String!) {
    loginUser(email: $email, password: $password) {
      token
      user {
        id
        name
        email
        createdAt
        googleId
        picture
        projects {
          id
          name
        }
      }
    }
  }
`;
export const SET_PASSWORD = gql`
  mutation setPasswordMutation($email: String!, $password: String!) {
    setPassword(email: $email, password: $password) {
      id
      name
      email
      createdAt
    }
  }
`;
export const LOGIN_WITH_GOOGLE = gql`
  mutation LoginWithGoogle($idToken: String!) {
    loginWithGoogle(idToken: $idToken) {
      token
      user {
        id
        name
        email
        googleId
        picture
        createdAt
        projects {
          id
          name
        }
      }
    }
  }
`;

// Создание сообщения
// export const CREATE_PROJECT = gql`
//   mutation CreateProject($ownerId: ID!, $name: String!, $data: String!) {
//     createProject(ownerId: $ownerId, name: $name, data: $data) {
//       id
//       name
//       data
//       owner {
//         id
//         name
//       }
//     }
//   }
// `;
export const CREATE_PROJECT = gql`
  mutation CreateProject($ownerId: ID!, $name: String!, $data: String!) {
    createProject(ownerId: $ownerId, name: $name, data: $data) {
      id
      name
    }
  }
`;

export const FIND_PROJECT = gql`
  mutation FindProject($projectId: ID!) {
    findProject(projectId: $projectId) {
      id
      name
      data
    }
  }
`;
export const REMOVE_PROJECT = gql`
  mutation RemoveProject($projectId: ID!) {
    removeProject(projectId: $projectId)
  }
`;

export const USER_CREATED_SUBSCRIPTION = gql`
  subscription UserCreated {
    userCreated {
      id
      name
      email
    }
  }
`;
