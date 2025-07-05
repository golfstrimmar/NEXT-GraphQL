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
  POST_CREATED,
  REACTION_CHANGED,
  COMMENT_CREATED,
  POST_DELETED,
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

      const { email, name, sub: googleId } = payload;

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
            googleId: user.googleId || googleId, // не перезаписываем, если уже есть
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
    // 1. Найти все чаты пользователя (creator или participant)
    const userChats = await prisma.chat.findMany({
      where: {
        OR: [{ creatorId: id }, { participantId: id }],
      },
      select: { id: true },
    });

    const chatIds = userChats.map((chat) => chat.id);

    // 2. Удалить все сообщения из этих чатов
    if (chatIds.length > 0) {
      await prisma.message.deleteMany({
        where: {
          chatId: { in: chatIds },
        },
      });
    }

    // 3. Удалить все эти чаты
    await prisma.chat.deleteMany({
      where: {
        id: { in: chatIds },
      },
    });

    // 4. Удалить самого пользователя
    const user = await prisma.user.delete({ where: { id } });
    console.log("To subscribe userDeleted  🟢-->");
    pubsub.publish(USER_DELETED, { userDeleted: user });

    return user;
  },

  createChat: async (_, { participantId }, { userId }) => {
    if (!userId) {
      throw new Error("Not authenticated");
    }

    if (userId === participantId) {
      throw new Error("Cannot create chat with yourself");
    }

    const existingChat = await prisma.chat.findFirst({
      where: {
        OR: [
          { creatorId: userId, participantId },
          { creatorId: participantId, participantId: userId },
        ],
      },
    });

    if (existingChat) {
      throw new Error("Chat already exists.");
    }

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
    console.log(" To subscribe create chat 🟢-->");
    pubsub.publish(CHAT_CREATED, { chatCreated: chat });
    return chat;
  },
  deleteChat: async (_, { id }, { userId }) => {
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const chat = await prisma.chat.findUnique({
      where: { id },
      include: {
        creator: true,
        participant: true,
      },
    });

    if (!chat) {
      throw new Error("Chat not found");
    }

    const isParticipant =
      chat.creatorId === userId || chat.participantId === userId;
    if (!isParticipant) {
      throw new Error("You do not have permission to delete this chat");
    }

    await prisma.message.deleteMany({
      where: { chatId: id },
    });

    await prisma.chat.delete({ where: { id } });

    console.log("To subscribe deleteChat 🟢-->", id);
    pubsub.publish(CHAT_DELETED, { chatDeleted: id });

    return id;
  },

  sendMessage: async (_, { chatId, text }, { userId }) => {
    if (!userId) throw new Error("Not authenticated");

    const chat = await prisma.chat.findUnique({ where: { id: chatId } });

    if (!chat || (chat.creatorId !== userId && chat.participantId !== userId)) {
      throw new Error("Access denied");
    }

    const message = await prisma.message.create({
      data: {
        text,
        senderId: userId,
        chatId,
      },
      include: {
        sender: true,
        chat: true,
      },
    });
    console.log("To subscribe messageSent 🟢-->");
    pubsub.publish(MESSAGE_SENT, {
      messageSent: message,
    });

    return message;
  },
  addPost: async (_, { category, title, text }, { userId }) => {
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
    console.log(" To subscribe postCreated   🟢--> ");
    pubsub.publish(POST_CREATED, { postCreated: post });

    return post;
  },
  deletePost: async (_, { id }, { userId }) => {
    if (!userId) {
      throw new Error("Not authenticated");
    }
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post || post.creatorId !== userId) {
      throw new Error("Access denied");
    }
    await prisma.post.delete({ where: { id } });
    console.log(" To subscribe postDeleted   🟢--> ");
    pubsub.publish(POST_DELETED, { postDeleted: id });
    return id;
  },
  toggleLike: async (_, { postId, reaction }, { userId }) => {
    if (!userId) {
      throw new Error("Unauthorized");
    }
    console.log("🔵 toggleLike called", postId, reaction, userId);

    let existingReaction;
    try {
      existingReaction = await prisma.postReaction.findUnique({
        where: {
          userId_postId: {
            userId,
            postId: Number(postId),
          },
        },
      });
    } catch (err) {
      console.error("❌ findUnique failed:", err);
    }

    let currentUserReaction;

    if (existingReaction) {
      if (existingReaction.reaction === reaction) {
        // Удаляем реакцию
        await prisma.postReaction.delete({
          where: { id: existingReaction.id },
        });
        currentUserReaction = null;
      } else {
        // Обновляем реакцию
        await prisma.postReaction.update({
          where: { id: existingReaction.id },
          data: { reaction },
        });
        currentUserReaction = reaction;
      }
    } else {
      // Создаем новую реакцию
      await prisma.postReaction.create({
        data: {
          userId,
          postId: Number(postId),
          reaction,
        },
      });
      currentUserReaction = reaction;
    }

    // Получаем обновлённые лайки и дизлайки
    const post = await prisma.post.findUnique({
      where: { id: Number(postId) },
      include: { reactions: true },
    });

    const likes = post.reactions.filter((r) => r.reaction === "LIKE").length;
    const dislikes = post.reactions.filter(
      (r) => r.reaction === "DISLIKE"
    ).length;
    console.log(" To subscribe reactionChanged   🟢--> ");

    pubsub.publish(REACTION_CHANGED, {
      reactionChanged: {
        postId: Number(postId),
        likes,
        dislikes,
        currentUserReaction,
      },
    });

    return {
      postId: Number(postId),
      likes,
      dislikes,
      currentUserReaction,
    };
  },

  createComment: async (_, { postId, text }, { userId }) => {
    console.log("Creating comment", { postId, text, userId });
    if (!userId) {
      throw new Error("Unauthorized");
    }
    if (!text.trim()) {
      throw new Error("Comment cannot be empty");
    }

    const comment = await prisma.postComment.create({
      data: {
        postId: Number(postId),
        text,
        userId,
      },
      include: { user: true, post: true },
    });
    console.log(" To subscribe commentCreated   🟢--> ");
    pubsub.publish(COMMENT_CREATED, {
      commentCreated: comment,
    });
    return comment;
  },
};

export default Mutation;
