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
};

export default Subscription;
