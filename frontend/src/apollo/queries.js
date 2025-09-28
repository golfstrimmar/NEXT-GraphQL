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
      figmaProjects {
        id
        name
        fileKey
        nodeId
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
// Получить один Figma-проект
export const GET_FIGMA_PROJECT = gql`
  query GetFigmaProject($id: ID!) {
    figmaProject(id: $id) {
      id
      name
      fileKey
      nodeId
      token
      owner {
        id
        name
      }
    }
  }
`;

// Получить все Figma-проекты пользователя
export const GET_FIGMA_PROJECTS_BY_USER = gql`
  query GetFigmaProjectsByUser($userId: ID!) {
    figmaProjectsByUser(userId: $userId) {
      id
      name
      fileKey
      nodeId
    }
  }
`;

// Получить полный проект Figma (изображения, nodes, стили, шрифты и т.д.)
export const GET_FIGMA_PROJECT_DATA = gql`
  query GetFigmaProjectData($projectId: ID!) {
    getFigmaProjectData(projectId: $projectId) {
      id
      name
      fileKey
      nodeId
      images
      file
    }
  }
`;
