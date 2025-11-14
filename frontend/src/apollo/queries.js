import { gql } from "graphql-tag";

// Получить всех пользователей с их проектами и Figma-проектами
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

// Получить JSON-документ по имени
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

// Найти проект по ID
export const FIND_PROJECT = gql`
  query findProject($id: ID!) {
    findProject(id: $id) {
      id
      name
      data
    }
  }
`;

// Получить все проекты пользователя
export const GET_ALL_PROJECTS_BY_USER = gql`
  query GET_ALL_PROJECTS_BY_USER($userId: ID!) {
    getAllProjectsByUser(userId: $userId) {
      id
      name
      # data
    }
  }
`;

// Получить Figma-проект по ID
export const GET_FIGMA_PROJECT = gql`
  query getFigmaProject($id: ID!) {
    figmaProject(id: $id) {
      id
      name
      fileKey
      nodeId
      token
      previewUrl
      owner {
        id
        name
      }
      figmaImages {
        fileName
        filePath
        nodeId
        imageRef
        type
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
      token
      previewUrl
    }
  }
`;

// Получить расширенные данные для Figma-проекта + файл и изображения
export const GET_FIGMA_PROJECT_DATA = gql`
  query GetFigmaProjectData($projectId: ID!) {
    getFigmaProjectData(projectId: $projectId) {
      id
      name
      fileKey
      nodeId
      token
      previewUrl
      file
      owner {
        id
        name
      }
      figmaImages {
        fileName
        filePath
        nodeId
        imageRef
        type
      }
    }
  }
`;

// Получить colorVariables по fileKey
export const GET_COLOR_VARIABLES_BY_FILE_KEY = gql`
  query GetColorVariablesByFileKey($fileKey: String!) {
    getColorVariablesByFileKey(fileKey: $fileKey) {
      id
      variableName
      hex
      type
      fileKey
    }
  }
`;
export const GET_FONTS_BY_FILE_KEY = gql`
  query GetFontsByFileKey($fileKey: String!) {
    getFontsByFileKey(fileKey: $fileKey) {
      id
      fileKey
      name
      scss
      texts
      createdAt
    }
  }
`;
