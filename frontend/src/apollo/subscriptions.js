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

// export const FIGMA_PROJECT_CREATED_SUBSCRIPTION = gql`
//   subscription FigmaProjectCreated {
//     figmaProjectCreated {
//       id
//       name
//       fileKey
//       nodeId
//       token
//       previewUrl
//       owner {
//         id
//         name
//         email
//       }
//     }
//   }
// `;
