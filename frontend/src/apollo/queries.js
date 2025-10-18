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

export const GET_FONT_CLASSES_BY_FILE_KEY = gql`
  query GetFontClassesByFileKey($fileKey: String!) {
    getFontClassesByFileKey(fileKey: $fileKey) {
      id
      className
      fontFamily
      fontWeight
      fontSize
      lineHeight
      letterSpacing
      sampleText
      fileKey
      colorVariableName
    }
  }
`;
