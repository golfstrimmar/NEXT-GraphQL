import { gql } from "@apollo/client";

export const USER_CREATED_SUBSCRIPTION = gql`
  subscription userCreated {
    userCreated {
      id
      email
      name
      createdAt
    }
  }
`;

export const USER_LOGIN_SUBSCRIPTION = gql`
  subscription userLogin {
    userLogin {
      id
      email
      name
      picture
      isLoggedIn
      createdAt
    }
  }
`;

export const USER_LOGGEDOUT_SUBSCRIPTION = gql`
  subscription userLoggedOut {
    userLoggedOut {
      id
      email
      isLoggedIn
    }
  }
`;

// export const USER_DELETED_SUBSCRIPTION = gql`
//   subscription userDeleted {
//     userDeleted {
//       id
//       email
//       name
//       createdAt
//     }
//   }
// `;

// export const CHAT_CREATED_SUBSCRIPTION = gql`
//   subscription chatCreated {
//     chatCreated {
//       id
//       createdAt
//       creator {
//         id
//         email
//         name
//       }
//       participant {
//         id
//         email
//         name
//       }
//     }
//   }
// `;

// export const CHAT_DELETED_SUBSCRIPTION = gql`
//   subscription chatDeleted {
//     chatDeleted
//   }
// `;

// export const MESSAGE_SENT_SUBSCRIPTION = gql`
//   subscription messageSent($chatId: Int!) {
//     messageSent(chatId: $chatId) {
//       id
//       content
//       createdAt
//       sender {
//         id
//         name
//       }
//       chat {
//         id
//       }
//     }
//   }
// `;

// export const MESSAGE_DELETED_SUBSCRIPTION = gql`
//   subscription messageDeleted($chatId: Int!) {
//     messageDeleted(chatId: $chatId)
//   }
// `;

// export const POST_CREATED_SUBSCRIPTION = gql`
//   subscription postCreated {
//     postCreated {
//       id
//       title
//       text
//       category
//       createdAt
//       creator {
//         id
//         name
//         email
//       }
//       likesCount
//       dislikesCount
//       likes
//       dislikes
//     }
//   }
// `;
// export const POST_DELETED_SUBSCRIPTION = gql`
//   subscription postDeleted {
//     postDeleted
//   }
// `;

// export const POST_LIKED_SUBSCRIPTION = gql`
//   subscription postLiked {
//     postLiked {
//       id
//       title
//       text
//       category
//       createdAt
//       creator {
//         id
//         name
//         email
//       }
//       likesCount
//       dislikesCount
//       likes
//       dislikes
//     }
//   }
// `;

// export const POST_DISLIKED_SUBSCRIPTION = gql`
//   subscription postDisliked {
//     postDisliked {
//       id
//       title
//       text
//       category
//       createdAt
//       creator {
//         id
//         name
//         email
//       }
//       likesCount
//       dislikesCount
//       likes
//       dislikes
//     }
//   }
// `;

// export const COMMENT_CREATED_SUBSCRIPTION = gql`
//   subscription commentAdded {
//     commentAdded {
//       id
//       text
//       createdAt
//       user {
//         name
//       }
//     }
//   }
// `;

// export const COMMENT_DELETED_SUBSCRIPTION = gql`
//   subscription commentDeleted {
//     commentDeleted
//   }
// `;

// export const COMMENT_LIKED_SUBSCRIPTION = gql`
//   subscription commentLiked {
//     commentLiked {
//       id
//       text
//       createdAt
//       commentLikes {
//         id
//         user {
//           id
//           name
//         }
//       }
//     }
//   }
// `;

// export const COMMENT_DISLIKED_SUBSCRIPTION = gql`
//   subscription commentDisliked {
//     commentDisliked {
//       id
//       text
//       createdAt
//       commentDislikes {
//         id
//         user {
//           id
//           name
//         }
//       }
//     }
//   }
// `;

// export const POST_UPDATED_SUBSCRIPTION = gql`
//   subscription postUpdated {
//     postUpdated {
//       id
//       title
//       text
//       category
//       createdAt
//       creator {
//         id
//         name
//       }
//       likesCount
//       dislikesCount
//       likes
//       dislikes
//     }
//   }
// `;
