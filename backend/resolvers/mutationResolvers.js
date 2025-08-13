import { addUser } from "./mutations/addUser.js";
import { loginUser } from "./mutations/loginUser.js";
import { logoutUser } from "./mutations/logoutUser.js";
import { setPassword } from "./mutations/setPassword.js";
import { googleLogin } from "./mutations/googleLogin.js";
import { deleteUser } from "./mutations/deleteUser.js";
import { createChat } from "./mutations/createChat.js";
import { deleteChat } from "./mutations/deleteChat.js";
import { sendMessage } from "./mutations/sendMessage.js";
import { deleteMessage } from "./mutations/deleteMessage.js";
import { createPost } from "./mutations/createPost.js";
import { deletePost } from "./mutations/deletePost.js";
import { likePost } from "./mutations/likePost.js";
import { dislikePost } from "./mutations/dislikePost.js";
import { addComment } from "./mutations/addComment.js";
import { deleteComment } from "./mutations/deleteComment.js";
import { likeComment } from "./mutations/likeComment.js";
import { dislikeComment } from "./mutations/dislikeComment.js";
import { updatePost } from "./mutations/updatePost.js";

const Mutation = {
  addUser,
  loginUser,
  logoutUser,
  googleLogin,
  setPassword,
  deleteUser,
  createChat,
  deleteChat,
  sendMessage,
  deleteMessage,
  createPost,
  deletePost,
  likePost,
  dislikePost,
  addComment,
  deleteComment,
  likeComment,
  dislikeComment,
  updatePost,
};

export default Mutation;
