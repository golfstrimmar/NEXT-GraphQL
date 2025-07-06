import {
  pubsub,
  USER_CREATED,
  USER_DELETED,
  USER_LOGGEDIN,
  USER_LOGGEDOUT,
  CHAT_CREATED,
  CHAT_DELETED,
  MESSAGE_SENT,
  POST_CREATED,
  REACTION_CHANGED,
  COMMENT_CREATED,
  POST_DELETED,
  POST_COMMENT_DELETED,
  COMMENT_REACTION_CHANGED,
} from "./../utils/pubsub.js";

const Subscription = {
  userCreated: {
    subscribe: () => pubsub.asyncIterator(USER_CREATED),
  },
  userLogin: {
    subscribe: () => pubsub.asyncIterator(USER_LOGGEDIN),
  },
  userLoggedOut: {
    subscribe: () => pubsub.asyncIterator(USER_LOGGEDOUT),
  },
  userDeleted: {
    subscribe: () => pubsub.asyncIterator(USER_DELETED),
  },
  chatCreated: {
    subscribe: () => pubsub.asyncIterator(CHAT_CREATED),
  },
  chatDeleted: {
    subscribe: () => pubsub.asyncIterator(CHAT_DELETED),
  },
  messageSent: {
    subscribe: () => pubsub.asyncIterator(MESSAGE_SENT),
  },
  postCreated: {
    subscribe: () => pubsub.asyncIterator(POST_CREATED),
  },

  reactionChanged: {
    subscribe: () => pubsub.asyncIterator(REACTION_CHANGED),
  },

  commentCreated: {
    subscribe: () => pubsub.asyncIterator(COMMENT_CREATED),
  },

  postDeleted: {
    subscribe: () => pubsub.asyncIterator(POST_DELETED),
  },

  postCommentDeleted: {
    subscribe: () => pubsub.asyncIterator(POST_COMMENT_DELETED),
  },
  commentReactionChanged: {
    subscribe: () => pubsub.asyncIterator(COMMENT_REACTION_CHANGED),
  },
};

export default Subscription;
