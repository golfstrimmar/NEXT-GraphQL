// pubsub.js
import { PubSub } from "graphql-subscriptions";

const pubsub = new PubSub();

const USER_CREATED = "USER_CREATED";
const USER_DELETED = "USER_DELETED";
const USER_LOGGEDIN = "USER_LOGGEDIN";
const USER_LOGGEDOUT = "USER_LOGGEDOUT";
const CHAT_CREATED = "CHAT_CREATED";
const CHAT_DELETED = "CHAT_DELETED";
const MESSAGE_SENT = "MESSAGE_SENT";

export {
  pubsub,
  USER_CREATED,
  USER_DELETED,
  USER_LOGGEDIN,
  USER_LOGGEDOUT,
  CHAT_CREATED,
  CHAT_DELETED,
  MESSAGE_SENT,
};
