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
          picture: true,
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

  posts: async (_, { skip = 0, take = 5, category = null }) => {
    console.log("=> Запрос posts", { skip, take, category });

    const where = category ? { category } : {};

    const totalCount = await prisma.post.count({ where });

    const posts = await prisma.post.findMany({
      skip,
      take,
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        text: true,
        category: true,
        createdAt: true,
        creator: {
          select: { id: true, name: true, email: true },
        },
        likes: {
          select: {
            user: { select: { name: true } },
          },
        },
        dislikes: {
          select: {
            user: { select: { name: true } },
          },
        },
      },
    });

    const formattedPosts = posts.map((post) => {
      const likes = post.likes.map((like) => like.user.name || "Аноним");
      const dislikes = post.dislikes.map(
        (dislike) => dislike.user.name || "Аноним"
      );

      return {
        id: post.id,
        title: post.title,
        text: post.text,
        category: post.category,
        createdAt: post.createdAt,
        creator: post.creator,
        likesCount: likes.length,
        dislikesCount: dislikes.length,
        likes,
        dislikes,
      };
    });

    console.log(
      "<===== 📋📋📋 query posts ====>",
      // "formattedPosts",
      // formattedPosts,
      "totalCount",
      totalCount
    );

    return {
      posts: formattedPosts,
      totalCount,
    };
  },

  categories: async () => {
    const posts = await prisma.post.findMany({
      distinct: ["category"],
      select: {
        category: true,
      },
    });
    return posts.map((post) => post.category);
  },

  comments: async (_, { postId }) => {
    const comments = await prisma.comment.findMany({
      where: { postId },
      select: {
        user: {
          select: { name: true },
        },
        postId: true,
        text: true,
        createdAt: true,
        id: true,
      },
    });

    console.log("<====== 📋📋📋 query comments =====>", comments);
    return comments;
  },
};

export default Query;
