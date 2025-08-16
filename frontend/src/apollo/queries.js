import { gql } from "graphql-tag";

// Получение всех пользователей с их сообщениями
export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      email
      name
      createdAt
      projects
    }
  }
`;

// // Получение всех сообщений с авторами
// export const GET_MESSAGES = gql`
//   query GetMessages {
//     messages {
//       id
//       content
//       createdAt
//       sender {
//         id
//         name
//       }
//     }
//   }
// `;
