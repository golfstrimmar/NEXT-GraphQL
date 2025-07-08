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
      () => pubsub.asyncIterator([MESSAGE_SENT]),
      (payload, variables) => payload.messageSent.chat.id === variables.chatId
    ),
    resolve: (payload) => {
      console.log("📨 messageSent payload", payload);
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
};

export default Subscription;
