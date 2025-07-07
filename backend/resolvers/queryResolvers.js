// queryResolvers.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const Query = {
  users: async () => {
    console.log("=> Запрос users");
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          isLoggedIn: true,
          googleId: true,
        },
      });
      console.log(" Запрос users =>");
      return users;
    } catch (err) {
      console.error("❌ Ошибка при запросе users:", err);
      throw new Error("Ошибка при получении пользователей");
    }
  },
  userChats: async (_, __, { userId }) => {
    console.log("=> Запрос userChats ");
    // Проверка аутентификации
    if (!userId) {
      console.error("Unauthorized attempt to access chats");
      throw new Error("Not authenticated");
    }

    try {
      const chats = await prisma.chat.findMany({
        where: {
          OR: [{ creatorId: userId }, { participantId: userId }],
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          participant: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          messages: {
            include: {
              sender: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

      console.log(`Fetched ${chats.length} chats for user ${userId}`);
      return chats;
    } catch (error) {
      console.error("Error fetching user chats:", error);
      throw new Error("Failed to fetch chats");
    }
  },
  messages: async (_, { chatId }, { userId }) => {
    if (!userId) throw new Error("Not authenticated");

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat || (chat.creatorId !== userId && chat.participantId !== userId)) {
      throw new Error("Access denied to chat messages");
    }

    return await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: "asc" },
      include: { sender: true, chat: true },
    });
  },

  // posts: async (_, { skip = 0, take = 5 }, context) => {
  //   const currentUserId = context?.userId || null;
  //   const totalCount = await prisma.post.count();
  //   const posts = await prisma.post.findMany({
  //     skip,
  //     take,
  //     orderBy: { createdAt: "desc" }, // сортируем по дате, новые сверху
  //     include: {
  //       creator: true,
  //       reactions: { include: { user: true } },
  //       comments: {
  //         include: {
  //           user: true,
  //           reactions: { include: { user: true } },
  //         },
  //       },
  //     },
  //   });
  //   const formattedPosts = posts.map((post) => {
  //     const likes = post.reactions
  //       .filter((r) => r.reaction === "LIKE" && r.user)
  //       .map((r) => r.user.name || "Аноним");

  //     const dislikes = post.reactions
  //       .filter((r) => r.reaction === "DISLIKE" && r.user)
  //       .map((r) => r.user.name || "Аноним");

  //     const currentUserReaction = currentUserId
  //       ? post.reactions.find((r) => r.userId === currentUserId)?.reaction ||
  //         null
  //       : null;

  //     const comments = post.comments.map((comment) => {
  //       const commentLikesCount = comment.reactions.filter(
  //         (r) => r.reaction === "LIKE"
  //       ).length;

  //       const commentDislikesCount = comment.reactions.filter(
  //         (r) => r.reaction === "DISLIKE"
  //       ).length;

  //       const commentUserReaction = currentUserId
  //         ? comment.reactions.find((r) => r.userId === currentUserId)
  //             ?.reaction || null
  //         : null;

  //       return {
  //         id: comment.id,
  //         text: comment.text,
  //         createdAt: comment.createdAt,
  //         user: comment.user,
  //         likesCount: commentLikesCount,
  //         dislikesCount: commentDislikesCount,
  //         currentUserReaction: commentUserReaction,
  //       };
  //     });

  //     return {
  //       id: post.id,
  //       title: post.title,
  //       text: post.text,
  //       category: post.category,
  //       createdAt: post.createdAt,
  //       creator: post.creator,
  //       likesCount: likes.length,
  //       dislikesCount: dislikes.length,
  //       likes,
  //       dislikes,
  //       currentUserReaction,
  //       commentsCount: comments.length,
  //       comments,
  //     };
  //   });

  //   return {
  //     posts: formattedPosts,
  //     totalCount,
  //   };
  // },
  // categories: async () => {
  //   const posts = await prisma.post.findMany({
  //     distinct: ["category"],
  //     select: {
  //       category: true,
  //     },
  //   });
  //   return posts.map((post) => {
  //     return post.category;
  //   });
  // },
};

export default Query;
