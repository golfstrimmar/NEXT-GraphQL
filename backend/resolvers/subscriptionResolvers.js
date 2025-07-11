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
  COMMENT_ADDED,
} from "./../utils/pubsub.js";

const Subscription = {
  // User subscriptions
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

  // Chat subscriptions
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

  // Post subscriptions
  postCreated: {
    subscribe: () => {
      console.log("📡 Новая подписка на postCreated");
      return pubsub.asyncIterator(POST_CREATED);
    },
    resolve: (payload) => {
      console.log("<===== 📨 postCreated payload : =====> ", payload);
      return payload.postCreated;
    },
  },
  postDeleted: {
    subscribe: () => {
      console.log("📡 Новая подписка на postDeleted");
      return pubsub.asyncIterator(POST_DELETED);
    },
    resolve: (payload) => {
      console.log("<===== 📨 postDeleted payload : =====> ", payload);
      return payload.postDeleted;
    },
  },
  commentAdded: {
    subscribe: withFilter(
      () => {
        console.log("📡 Новая подписка на commentAdded");
        return pubsub.asyncIterator(COMMENT_ADDED);
      },
      (payload, variables) => {
        console.log(
          "🔍 Проверка фильтра commentAdded:",
          payload.commentAdded.post.id,
          variables.postId
        );
        return (
          Number(payload.commentAdded.post.id) === Number(variables.postId)
        );
      }
    ),
    resolve: (payload) => {
      console.log("📨 commentAdded payload :", payload.commentAdded);
      return payload.commentAdded;
    },
  },
};

export default Subscription;
