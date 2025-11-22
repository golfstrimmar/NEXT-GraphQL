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

// Установка пароля
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

// Логин через Google
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

// Создание проекта
export const CREATE_PROJECT = gql`
  mutation CreateProject($ownerId: ID!, $name: String!, $data: JSON!) {
    createProject(ownerId: $ownerId, name: $name, data: $data) {
      id
      name
    }
  }
`;

// Поиск проекта
export const FIND_PROJECT = gql`
  mutation FindProject($projectId: ID!) {
    findProject(projectId: $projectId) {
      id
      name
      data
    }
  }
`;
export const UPDATE_PROJECT = gql`
  mutation UpdateProject($projectId: ID!, $data: JSON!) {
    updateProject(projectId: $projectId, data: $data) {
      id
      name
      data
    }
  }
`;

// Удаление проекта
export const REMOVE_PROJECT = gql`
  mutation RemoveProject($projectId: ID!) {
    removeProject(projectId: $projectId)
  }
`;

// Мутация для загрузки Figma JSON (без избыточных аргументов)
export const UPLOAD_FIGMA_JSON_PROJECT = gql`
  mutation uploadFigmaJsonProject(
    $ownerId: ID!
    $name: String!
    $jsonContent: JSON!
  ) {
    uploadFigmaJsonProject(
      ownerId: $ownerId
      name: $name
      jsonContent: $jsonContent
    ) {
      project {
        id
        name
        fileKey
        nodeId
        previewUrl
        fileCache
        figmaImages {
          fileName
          nodeId
        }
        owner {
          id
          name
        }
      }
      colors
      fonts
      textNodes
    }
  }
`;

// Удалить Figma-проект
export const REMOVE_FIGMA_PROJECT = gql`
  mutation removeFigmaProject($figmaProjectId: ID!) {
    removeFigmaProject(figmaProjectId: $figmaProjectId)
  }
`;

// Загрузка изображений и SVG в Cloudinary
export const UPLOAD_FIGMA_IMAGES_TO_CLOUDINARY = gql`
  mutation uploadFigmaImagesToCloudinary($projectId: ID!) {
    uploadFigmaImagesToCloudinary(projectId: $projectId) {
      nodeId
      filePath
    }
  }
`;

export const UPLOAD_FIGMA_SVGS_TO_CLOUDINARY = gql`
  mutation uploadFigmaSvgsToCloudinary($projectId: ID!) {
    uploadFigmaSvgsToCloudinary(projectId: $projectId) {
      nodeId
      filePath
    }
  }
`;

export const REMOVE_FIGMA_IMAGE = gql`
  mutation removeFigmaImage($nodeId: String!, $figmaProjectId: Int!) {
    removeFigmaImage(nodeId: $nodeId, figmaProjectId: $figmaProjectId) {
      nodeId
    }
  }
`;

export const TRANSFORM_RASTER_TO_SVG = gql`
  mutation transformRasterToSvg($nodeId: String!) {
    transformRasterToSvg(nodeId: $nodeId) {
      nodeId
      filePath
    }
  }
`;

export const EXTRACT_AND_SAVE_COLORS = gql`
  mutation extractAndSaveColors(
    $fileKey: String!
    $figmaFile: JSON!
    $nodeId: String!
  ) {
    extractAndSaveColors(
      fileKey: $fileKey
      figmaFile: $figmaFile
      nodeId: $nodeId
    ) {
      id
      variableName
      hex
      rgba
      type
      fileKey
    }
  }
`;

// // Добавить классы шрифтов
// export const ADD_FONT_CLASSES = gql`
//   mutation addFontClasses($fileKey: String!, $fontClasses: [FontClassInput!]!) {
//     addFontClasses(fileKey: $fileKey, fontClasses: $fontClasses) {
//       id
//       className
//       fontFamily
//       fontWeight
//       fontSize
//       lineHeight
//       letterSpacing
//       sampleText
//       fileKey
//       colorVariableName
//     }
//   }
// `;

export const EXTRACT_AND_SAVE_FONTS = gql`
  mutation extractAndSaveFonts(
    $fileKey: String!
    $figmaFile: JSON!
    $nodeId: String!
  ) {
    extractAndSaveFonts(
      fileKey: $fileKey
      figmaFile: $figmaFile
      nodeId: $nodeId
    ) {
      name
      scss
      texts
    }
  }
`;

export const UPLOAD_DESIGN_FILE = gql`
  mutation UploadDesignFile($file: Upload!) {
    uploadDesignFile(file: $file) {
      filename
      images {
        filename
        ext
        mime
        base64
      }
      vectorNodes {
        id
        name
        type
      }
      imagesCount
    }
  }
`;
export const TRACE_IMAGE_MUTATION = gql`
  mutation TraceImageFromFig($imageName: String!, $archiveBuffer: Upload!) {
    traceImageFromFig(imageName: $imageName, archiveBuffer: $archiveBuffer) {
      filename
      svg
    }
  }
`;
