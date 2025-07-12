import { withFilter } from "graphql-subscriptions";

import {
  pubsub,
  USER_CREATED,
  USER_DELETED,
  USER_LOGGEDIN,
  USER_LOGGEDOUT,
  CHAT_CREATED,
  CHAT_DELETED,
  MESSAGE_SENT,
  MESSAGE_DELETED,
  POST_CREATED,
  POST_DELETED,
  POST_LIKED,
  POST_DISLIKED,
  COMMENT_ADDED,
  COMMENT_DELETED,
} from "./../utils/pubsub.js";

const Subscription = {
  //=== User subscriptions
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

  //===== Chat subscriptions
  chatCreated: {
    subscribe: () => pubsub.asyncIterator(CHAT_CREATED),
  },

  chatDeleted: {
    subscribe: () => pubsub.asyncIterator(CHAT_DELETED),
    resolve: (payload) => payload.chatDeleted,
  },

  messageSent: {
    subscribe: withFilter(
      (...args) => {
        console.log("✅ [Server] subscribe() called for messageSent");
        return pubsub.asyncIterator([MESSAGE_SENT]);
      },
      (payload, variables) => {
        console.log(
          "🔍 [Server] withFilter check:",
          payload.messageSent.chat.id,
          variables.chatId
        );
        return Number(payload.messageSent.chat.id) === Number(variables.chatId);
      }
    ),
    resolve: (payload) => {
      console.log(
        "📦 [Server] resolve() called with payload:",
        payload.messageSent.id
      );
      return payload.messageSent;
    },
  },

  messageDeleted: {
    subscribe: withFilter(
      () => pubsub.asyncIterator([MESSAGE_DELETED]),
      (payload, variables) => {
        console.log(
          "🔔 filter payload.chatId:",
          payload.messageDeleted.chatId,
          "variables.chatId:",
          variables.chatId
        );
        return payload.messageDeleted.chatId === variables.chatId;
      }
    ),
    resolve: (payload) => {
      console.log(
        "📨 messageDeleted payload",
        payload.messageDeleted.messageId
      );
      return payload.messageDeleted.messageId;
    },
  },

  //===== Post subscriptions
  postCreated: {
    subscribe: () => {
      console.log("📡 New subscribe postCreated");
      return pubsub.asyncIterator(POST_CREATED);
    },
    resolve: (payload) => {
      console.log("<===== 📨 postCreated payload : =====> ", payload);
      return payload.postCreated;
    },
  },
  postDeleted: {
    subscribe: () => {
      console.log("📡 New subscribe  postDeleted");
      return pubsub.asyncIterator(POST_DELETED);
    },
    resolve: (payload) => {
      console.log("<===== 📨 postDeleted payload : =====> ", payload);
      return payload.postDeleted;
    },
  },
  postLiked: {
    subscribe: () => {
      console.log("📡 New subscribe  postLiked");
      return pubsub.asyncIterator(POST_LIKED);
    },
    resolve: (payload) => {
      console.log("<===== 📨 post LIKED payload : =====> ", payload);
      return payload.postLiked;
    },
  },
  postDisliked: {
    subscribe: () => {
      console.log("📡 New subscribe  postDisliked");
      return pubsub.asyncIterator(POST_DISLIKED);
    },
    resolve: (payload) => {
      console.log("<===== 📨 post DISLIKED payload : =====> ", payload);
      return payload.postDisliked;
    },
  },
  // === comments ==========
  commentAdded: {
    subscribe: () => {
      console.log("📡 New subscribe commentAdded");
      return pubsub.asyncIterator(COMMENT_ADDED);
    },
    resolve: (payload) => {
      console.log("📨 commentAdded payload :", payload.commentAdded);
      return payload.commentAdded;
    },
  },
  commentDeleted: {
    subscribe: () => {
      console.log("📡 New subscribe commentDeleted");
      return pubsub.asyncIterator(COMMENT_DELETED);
    },
    resolve: (payload) => {
      console.log("📨 commentDeleted payload :", payload);
      return payload.commentDeleted; // уже id, без .id
    },
  },
};

export default Subscription;
