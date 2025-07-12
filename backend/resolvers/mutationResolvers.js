import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
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
  COMMENT_ADDED,
  POST_DELETED,
  POST_LIKED,
  POST_DISLIKED,
  // REACTION_CHANGED,
  // COMMENT_CREATED,
  // POST_DELETED,
  // POST_COMMENT_DELETED,
  // COMMENT_REACTION_CHANGED,
} from "./../utils/pubsub.js";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";
const SALT_ROUNDS = 10;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const Mutation = {
  addUser: async (_, { email, name, password, googleId }) => {
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    }

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        googleId,
      },
    });
    console.log(" To subscribe  User created  🟢--> ", user);
    pubsub.publish(USER_CREATED, { userCreated: user });
    return user;
  },

  loginUser: async (_, { email, password }) => {
    console.log("====> mutation login user", email, password);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("User not found");
    if (!user.password) {
      throw new Error("GoogleOnlyAccount"); // специальный код ошибки
    }
    const isPasswordValid = await bcrypt.compare(password, user.password || "");
    if (!isPasswordValid) throw new Error("Invalid password");

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "1h",
    });

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { isLoggedIn: true },
    });
    console.log(" To subscribe login   🟢--> ");
    pubsub.publish(USER_LOGGEDIN, { userLogin: updatedUser }); // 👈 название поля должно совпадать с typeDefs

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      isLoggedIn: true,
      token,
    };
  },
  setPassword: async (_, { email, newPassword }) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("User not found");
    if (user.password) throw new Error("Password already set");

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    return await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });
  },
  googleLogin: async (_, { idToken }) => {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new Error("Invalid Google token");
      }

      const { email, name, sub: googleId, picture } = payload;
      console.log("<========>", picture);
      if (!email) {
        throw new Error("Email not provided by Google");
      }

      let user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        // Создание нового пользователя с googleId
        user = await prisma.user.create({
          data: {
            email,
            name,
            password: "", // Пустой пароль для Google-пользователя
            googleId,
            isLoggedIn: true,
            picture: picture || "",
          },
        });
        pubsub.publish(USER_CREATED, { userCreated: user });
        pubsub.publish(USER_LOGGEDIN, { userLogin: user });
        console.log("<==== user created via Google ====>", user);
      } else {
        // Обновление существующего пользователя (включая googleId, если ранее не был установлен)
        user = await prisma.user.update({
          where: { email },
          data: {
            name: name || user.name,
            isLoggedIn: true,
            googleId: user.googleId || googleId,
            picture: picture || "",
          },
        });

        console.log("<==== 🟢 user logged in via Google update ====>", user);
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );
      console.log("To subscribe userLogin  🟢-->");
      pubsub.publish(USER_LOGGEDIN, { userLogin: user });

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        isLoggedIn: true,
        picture: picture || "",
        token,
      };
    } catch (err) {
      console.error("Google login error:", err);
      throw new Error("Failed to authenticate with Google");
    }
  },

  logoutUser: async (_, __, { userId }) => {
    if (!userId) throw new Error("Not authenticated");

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isLoggedIn: false },
    });
    console.log("To subscribe logout  🟢-->");
    pubsub.publish(USER_LOGGEDOUT, {
      userLoggedOut: updatedUser,
    });

    return true;
  },
  deleteUser: async (_, { id }) => {
    console.log("====> delete user", id);
    const user = await prisma.user.delete({ where: { id } });
    console.log(" To subscribe  userDeleted  🟢--> ", user);
    pubsub.publish(USER_DELETED, { userDeleted: user });
    return user;
  },

  createChat: async (_, { title, participantId }, { userId }) => {
    if (!userId) throw new Error("Not authenticated");
    if (userId === participantId)
      throw new Error("Cannot create chat with yourself");

    const existingChat = await prisma.chat.findFirst({
      where: {
        OR: [
          { creatorId: userId, participantId },
          { creatorId: participantId, participantId: userId },
        ],
      },
    });

    if (existingChat) throw new Error("Chat already exists");

    const chat = await prisma.chat.create({
      data: {
        creatorId: userId,
        participantId,
      },
      include: {
        creator: true,
        participant: true,
      },
    });
    console.log("To subscribe chatCreated 🟢-->");
    pubsub.publish(CHAT_CREATED, { chatCreated: chat });
    return chat;
  },
  deleteChat: async (_, { id }, { userId }) => {
    if (!userId) throw new Error("Not authenticated");

    const chat = await prisma.chat.findUnique({
      where: { id },
      include: {
        creator: true,
        participant: true,
        messages: true,
      },
    });

    if (!chat) throw new Error("Chat not found");
    if (chat.creatorId !== userId && chat.participantId !== userId) {
      throw new Error("You do not have permission to delete this chat");
    }

    // Удаляем сообщения (если не срабатывает каскад)
    await prisma.message.deleteMany({ where: { chatId: id } });

    const deletedChat = await prisma.chat.delete({
      where: { id },
      include: {
        creator: true,
        participant: true,
      },
    });

    console.log("🟢 To subscribe chatDeleted --> ", deletedChat.id);
    pubsub.publish(CHAT_DELETED, { chatDeleted: deletedChat.id }); // ✅ тут id
    return deletedChat;
  },

  sendMessage: async (_, { chatId, content }, { userId }) => {
    if (!userId) throw new Error("Not authenticated");
    console.log("<====🟢 chatId mutation sendMessage====>", chatId);
    const chat = await prisma.chat.findUnique({ where: { id: chatId } });
    if (!chat || (chat.creatorId !== userId && chat.participantId !== userId)) {
      throw new Error("Access denied");
    }

    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    const message = await prisma.message.create({
      data: {
        content,
        senderId: userId,
        chatId,
      },
      include: {
        sender: true,
        chat: true,
      },
    });
    console.log("<====🟢 mutation message sent====>", message);
    console.log(" To subscribe  messageSent  🟢--> ");
    pubsub.publish(MESSAGE_SENT, { messageSent: message });
    return message;
  },
  deleteMessage: async (_, { chatId, messageId }, { userId }) => {
    if (!userId) throw new Error("Not authenticated");
    if (!chatId) throw new Error("Not found");

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        messages: {
          where: { id: messageId },
        },
      },
    });

    if (!chat) throw new Error("Chat not found");

    if (chat.creatorId !== userId && chat.participantId !== userId) {
      throw new Error("You do not have permission to delete this message");
    }

    const message = chat.messages[0];
    if (!message) throw new Error("Message not found in this chat");

    await prisma.message.delete({ where: { id: messageId } });

    console.log("🟢 To subscribe messageDeleted -->", chatId, messageId);
    pubsub.publish(MESSAGE_DELETED, { messageDeleted: { messageId, chatId } });

    return messageId;
  },

  createPost: async (_, { category, title, text }, { userId }) => {
    if (!userId) throw new Error("Not authenticated");
    console.log("<====🟢add Post🟢====> ", category, title, text, userId);
    const post = await prisma.post.create({
      data: {
        category,
        title,
        text,
        creatorId: userId,
      },
      include: {
        creator: true,
      },
    });
    const postForReturn = {
      ...post,
      likesCount: 0,
      dislikesCount: 0,
      likes: [],
      dislikes: [],
    };
    console.log(" To subscribe postCreated   🟢--> ");

    pubsub.publish(POST_CREATED, {
      postCreated: postForReturn,
    });
    return postForReturn;
  },

  deletePost: async (_, { id }, { userId }) => {
    if (!userId) {
      throw new Error("Not authenticated");
    }
    const post = await prisma.post.findUnique({ where: { id } });

    console.log("<==== 🟢 mut deletePost====>", post, userId);
    if (!post || post.creatorId !== userId) {
      throw new Error("You have no permission to delete this post");
    }
    await prisma.post.delete({ where: { id } });
    console.log(" To subscribe postDeleted   🟢--> ");
    pubsub.publish(POST_DELETED, { postDeleted: id });
    return id;
  },

  likePost: async (_, { postId }, { userId }) => {
    console.log("<====userId====>", userId);
    if (!userId) {
      throw new Error("Authentication required");
    }

    // Удаляем дизлайк, если был
    await prisma.postDislike.deleteMany({
      where: {
        postId,
        userId,
      },
    });

    // Добавляем лайк или ничего не делаем, если уже есть
    try {
      await prisma.postLike.create({
        data: {
          postId,
          userId,
        },
      });
    } catch (error) {
      if (error.code === "P2002") {
        console.log("Like already exists");
      } else {
        throw error;
      }
    }

    // Загружаем пост с нужными связями
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        creator: true,
        likes: { include: { user: true } },
        dislikes: { include: { user: true } },
      },
    });
    console.log(" To subscribe postLiked   🟢--> ");

    const formattedPost = {
      id: post.id,
      title: post.title,
      text: post.text,
      category: post.category,
      createdAt: post.createdAt,
      creator: post.creator,
      likesCount: post.likes.length,
      dislikesCount: post.dislikes.length,
      likes: post.likes.map((like) => like.user.name),
      dislikes: post.dislikes.map((dislike) => dislike.user.name),
    };

    pubsub.publish(POST_LIKED, { postLiked: formattedPost });

    return formattedPost;
  },
  dislikePost: async (_, { postId }, { userId }) => {
    if (!userId) {
      throw new Error("Authentication required");
    }

    // Удаляем дизлайк, если был
    await prisma.postLike.deleteMany({
      where: {
        postId,
        userId,
      },
    });

    // Добавляем лайк или ничего не делаем, если уже есть
    try {
      await prisma.postDislike.create({
        data: {
          postId,
          userId,
        },
      });
    } catch (error) {
      if (error.code === "P2002") {
        console.log("Like already exists");
      } else {
        throw error;
      }
    }

    // Загружаем пост с нужными связями
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        creator: true,
        likes: { include: { user: true } },
        dislikes: { include: { user: true } },
      },
    });

    console.log(" To subscribe postDisLiked   🟢--> ");

    const formattedPost = {
      id: post.id,
      title: post.title,
      text: post.text,
      category: post.category,
      createdAt: post.createdAt,
      creator: post.creator,
      likesCount: post.likes.length,
      dislikesCount: post.dislikes.length,
      likes: post.likes.map((like) => like.user.name),
      dislikes: post.dislikes.map((dislike) => dislike.user.name),
    };

    pubsub.publish(POST_DISLIKED, { postDisliked: formattedPost });

    return formattedPost;
  },

  addComment: async (_, { postId, text }, { userId }) => {
    if (!userId) {
      throw new Error("Not authenticated");
    }

    console.log("<=== addComment postId, text=====>", postId, text);

    const comment = await prisma.comment.create({
      data: {
        postId,
        userId,
        text,
      },
      include: {
        user: {
          select: { name: true },
        },
      },
    });

    console.log(" To subscribe commentAdded   🟢--> ");
    pubsub.publish(COMMENT_ADDED, { commentAdded: comment });

    return comment;
  },
};

export default Mutation;
