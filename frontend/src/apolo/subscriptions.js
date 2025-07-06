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

export const USER_DELETED_SUBSCRIPTION = gql`
  subscription userDeleted {
    userDeleted {
      id
      email
      name
      createdAt
    }
  }
`;

export const CHAT_CREATED_SUBSCRIPTION = gql`
  subscription chatCreated {
    chatCreated {
      id
      createdAt
      creator {
        id
        email
        name
      }
      participant {
        id
        email
        name
      }
    }
  }
`;

export const CHAT_DELETED_SUBSCRIPTION = gql`
  subscription chatDeleted {
    chatDeleted
  }
`;

export const MESSAGE_SENT_SUBSCRIPTION = gql`
  subscription messageSent {
    messageSent {
      id
      text
      createdAt
      chat {
        id
      }
      sender {
        id
        name
      }
    }
  }
`;

export const POST_CREATED_SUBSCRIPTION = gql`
  subscription postCreated {
    postCreated {
      id
      text
      title
      category
      createdAt
      creator {
        id
        name
      }
    }
  }
`;

export const REACTION_CHANGED_SUBSCRIPTION = gql`
  subscription reactionChanged {
    reactionChanged {
      postId
      likes
      dislikes
      currentUserReaction
    }
  }
`;

export const COMMENT_CREATED_SUBSCRIPTION = gql`
  subscription commentCreated {
    commentCreated {
      id
      text
      createdAt
      post {
        id
      }
      user {
        id
        name
      }
    }
  }
`;

export const POST_DELETED_SUBSCRIPTION = gql`
  subscription postDeleted {
    postDeleted
  }
`;

export const POST_COMMENT_DELETED_SUBSCRIPTION = gql`
  subscription postCommentDeleted {
    postCommentDeleted {
      commentId
      postId
    }
  }
`;

export const COMMENT_REACTION_CHANGED_SUBSCRIPTION = gql`
  subscription commentReactionChanged {
    commentReactionChanged {
      id
      text
      createdAt
      user {
        id
        name
      }
      post {
        id
      }
      likesCount
      dislikesCount
      currentUserReaction
    }
  }
`;
