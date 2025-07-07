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
  // POST_CREATED,
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
    console.log(" To subscribe  chatCreated  🟢--> ");
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

    // Удаляем сообщения (каскадное удаление должно работать автоматически)
    // await prisma.message.deleteMany({ where: { chatId: id } });

    // const deletedChat = await prisma.chat.delete({
    //   where: { id },
    //   include: {
    //     creator: true,
    //     participant: true,
    //   },
    // });
    console.log(" To subscribe  chatDeleted  🟢--> ");
    pubsub.publish(CHAT_DELETED, { chatDeleted: deletedChat });
    return deletedChat; // Возвращаем полный объект чата
  },

  sendMessage: async (_, { chatId, content }, { userId }) => {
    if (!userId) throw new Error("Not authenticated");

    const chat = await prisma.chat.findUnique({ where: { id: chatId } });
    if (!chat || (chat.creatorId !== userId && chat.participantId !== userId)) {
      throw new Error("Access denied");
    }

    // Обновляем дату изменения чата
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    const message = await prisma.message.create({
      data: {
        content, // Исправлено имя поля
        senderId: userId,
        chatId,
      },
      include: {
        sender: true,
        chat: true,
      },
    });
    console.log(" To subscribe  messageSent  🟢--> ");
    pubsub.publish(MESSAGE_SENT, { messageSent: message });
    // pubsub.publish(`${MESSAGE_SENT}_${chatId}`, { messageSent: message });
    return message;
  },
  // addPost: async (_, { category, title, text }, { userId }) => {
  //   if (!userId) throw new Error("Not authenticated");
  //   console.log("<====🟢add Post🟢====> ", category, title, text, userId);
  //   const post = await prisma.post.create({
  //     data: {
  //       category,
  //       title,
  //       text,
  //       creatorId: userId,
  //     },
  //     include: {
  //       creator: true,
  //     },
  //   });
  //   console.log(" To subscribe postCreated   🟢--> ");
  //   pubsub.publish(POST_CREATED, { postCreated: post });

  //   return post;
  // },
  // deletePost: async (_, { id }, { userId }) => {
  //   if (!userId) {
  //     throw new Error("Not authenticated");
  //   }
  //   const post = await prisma.post.findUnique({ where: { id } });
  //   if (!post || post.creatorId !== userId) {
  //     throw new Error("Access denied");
  //   }
  //   await prisma.post.delete({ where: { id } });
  //   console.log(" To subscribe postDeleted   🟢--> ");
  //   pubsub.publish(POST_DELETED, { postDeleted: id });
  //   return id;
  // },
  // toggleLike: async (_, { postId, reaction }, { userId }) => {
  //   if (!userId) {
  //     throw new Error("Unauthorized");
  //   }

  //   console.log("🔵 toggleLike called", postId, reaction, userId);

  //   let existingReaction;

  //   try {
  //     existingReaction = await prisma.postReaction.findUnique({
  //       where: {
  //         userId_postId: {
  //           userId,
  //           postId: Number(postId),
  //         },
  //       },
  //     });
  //   } catch (err) {
  //     console.error("❌ findUnique failed:", err);
  //   }

  //   let currentUserReaction;

  //   if (existingReaction) {
  //     if (existingReaction.reaction === reaction) {
  //       // Удаляем реакцию
  //       await prisma.postReaction.delete({
  //         where: { id: existingReaction.id },
  //       });
  //       currentUserReaction = null;
  //     } else {
  //       // Обновляем реакцию
  //       await prisma.postReaction.update({
  //         where: { id: existingReaction.id },
  //         data: { reaction },
  //       });
  //       currentUserReaction = reaction;
  //     }
  //   } else {
  //     // Создаем новую реакцию
  //     await prisma.postReaction.create({
  //       data: {
  //         userId,
  //         postId: Number(postId),
  //         reaction,
  //       },
  //     });
  //     currentUserReaction = reaction;
  //   }

  //   // Получаем реакции с пользователями
  //   const postWithReactions = await prisma.post.findUnique({
  //     where: { id: Number(postId) },
  //     include: {
  //       reactions: {
  //         include: { user: true },
  //       },
  //     },
  //   });

  //   const likes = postWithReactions.reactions
  //     .filter((r) => r.reaction === "LIKE" && r.user)
  //     .map((r) => r.user.name || "Аноним");

  //   const dislikes = postWithReactions.reactions
  //     .filter((r) => r.reaction === "DISLIKE" && r.user)
  //     .map((r) => r.user.name || "Аноним");

  //   console.log("To subscribe reactionChanged   🟢--> ");

  //   // Отправка подписки
  //   pubsub.publish(REACTION_CHANGED, {
  //     reactionChanged: {
  //       postId: Number(postId),
  //       likes,
  //       dislikes,
  //       currentUserReaction,
  //     },
  //   });

  //   // Возврат результата мутации
  //   return {
  //     postId: Number(postId),
  //     likes,
  //     dislikes,
  //     currentUserReaction,
  //   };
  // },

  // createComment: async (_, { postId, text }, { userId }) => {
  //   console.log("Creating comment", { postId, text, userId });
  //   if (!userId) {
  //     throw new Error("Unauthorized");
  //   }
  //   if (!text.trim()) {
  //     throw new Error("Comment cannot be empty");
  //   }

  //   const comment = await prisma.postComment.create({
  //     data: {
  //       postId: Number(postId),
  //       text,
  //       userId,
  //     },
  //     include: { user: true, post: true },
  //   });
  //   console.log(" To subscribe commentCreated   🟢--> ");
  //   pubsub.publish(COMMENT_CREATED, {
  //     commentCreated: comment,
  //   });
  //   return comment;
  // },
  // deleteComment: async (_, { postId, commentId }, { userId }) => {
  //   if (!userId) {
  //     throw new Error("Not authenticated");
  //   }

  //   const comment = await prisma.postComment.findUnique({
  //     where: { id: commentId },
  //   });

  //   if (!comment) {
  //     throw new Error("Comment not found");
  //   }

  //   if (comment.userId !== userId) {
  //     throw new Error("Access denied");
  //   }

  //   await prisma.postComment.delete({
  //     where: { id: commentId },
  //   });

  //   console.log("To subscribe postCommentDeleted 🟢-->");

  //   pubsub.publish(POST_COMMENT_DELETED, {
  //     postCommentDeleted: {
  //       commentId: commentId,
  //       postId,
  //     },
  //   });

  //   return commentId;
  // },
  // toggleCommentReaction: async (_, { commentId, reaction }, { userId }) => {
  //   if (!userId) throw new Error("Not authenticated");

  //   // Проверяем, есть ли уже реакция
  //   const existing = await prisma.postCommentReaction.findUnique({
  //     where: {
  //       userId_commentId: {
  //         userId,
  //         commentId,
  //       },
  //     },
  //   });

  //   let currentUserReaction;

  //   if (existing) {
  //     if (existing.reaction === reaction) {
  //       // Если реакция та же — удалить
  //       await prisma.postCommentReaction.delete({
  //         where: {
  //           userId_commentId: {
  //             userId,
  //             commentId,
  //           },
  //         },
  //       });
  //       currentUserReaction = null;
  //     } else {
  //       // Иначе — обновить реакцию
  //       await prisma.postCommentReaction.update({
  //         where: {
  //           userId_commentId: {
  //             userId,
  //             commentId,
  //           },
  //         },
  //         data: {
  //           reaction,
  //         },
  //       });
  //       currentUserReaction = reaction;
  //     }
  //   } else {
  //     // Если не было — создать
  //     await prisma.postCommentReaction.create({
  //       data: {
  //         userId,
  //         commentId,
  //         reaction,
  //       },
  //     });
  //     currentUserReaction = reaction;
  //   }

  //   // Получаем все реакции для пересчёта
  //   const updatedComment = await prisma.postComment.findUnique({
  //     where: { id: commentId },
  //     include: {
  //       reactions: {
  //         include: {
  //           user: true,
  //         },
  //       },
  //       user: true,
  //     },
  //   });

  //   const likesCount = updatedComment.reactions.filter(
  //     (r) => r.reaction === "LIKE"
  //   ).length;

  //   const dislikesCount = updatedComment.reactions.filter(
  //     (r) => r.reaction === "DISLIKE"
  //   ).length;

  //   console.log("To subscribe commentReactionChanged 🟢-->");

  //   pubsub.publish(COMMENT_REACTION_CHANGED, {
  //     commentReactionChanged: {
  //       id: updatedComment.id,
  //       text: updatedComment.text,
  //       createdAt: updatedComment.createdAt,
  //       user: updatedComment.user,
  //       post: { id: updatedComment.postId },
  //       likesCount,
  //       dislikesCount,
  //       currentUserReaction,
  //     },
  //   });
  //   return {
  //     id: updatedComment.id,
  //     text: updatedComment.text,
  //     createdAt: updatedComment.createdAt,
  //     user: updatedComment.user,
  //     post: { id: updatedComment.postId }, // минимально, если надо больше — включи post
  //     likesCount,
  //     dislikesCount,
  //     currentUserReaction,
  //   };
  // },
};

export default Mutation;
