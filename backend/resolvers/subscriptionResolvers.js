import {
  pubsub,
  USER_CREATED,
  USER_DELETED,
  USER_LOGGEDIN,
  USER_LOGGEDOUT,
  CHAT_CREATED,
  CHAT_DELETED,
  MESSAGE_SENT,
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
    subscribe: (_, { chatId }) =>
      pubsub.asyncIterator(`${MESSAGE_SENT}_${chatId}`),
    resolve: (payload) => payload.messageSent,
  },
};

export default Subscription;
