<<<<<<< HEAD
// queryResolvers.js
=======
>>>>>>> simple
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const Query = {
<<<<<<< HEAD
  users: async () => {
    return await prisma.user.findMany();
  },
  chats: async () => {
    return await prisma.chat.findMany({
      include: {
        creator: true,
        participant: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },
=======
  checkToken: async (parent, args, context) => {
    if (!context.user) {
      throw new Error("UserLoggedOut");
    }
    return true;
  },

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

>>>>>>> simple
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
<<<<<<< HEAD
=======

  posts: async (
    _,
    { skip = 0, take = 5, category = null, sortOrder = "decr", searchTerm = "" }
  ) => {
    console.log("=> Запрос posts", {
      skip,
      take,
      category,
      sortOrder,
      searchTerm,
    });

    const where = category ? { category } : {};

    const totalCount = await prisma.post.count({ where });

    const posts = await prisma.post.findMany({
      where,
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

    const formattedPosts = posts
      .map((post) => {
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
      })
      .filter((post) => {
        const matchesSearch =
          post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.text.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === "acr" ? dateA - dateB : dateB - dateA;
      });

    // Применяем skip и take после фильтрации и сортировки
    const paginatedPosts = formattedPosts.slice(skip, skip + take);

    console.log("<===== 📋📋📋 query posts ====>", "totalCount", totalCount);

    return {
      posts: paginatedPosts,
      totalCount: formattedPosts.length, // чтобы учитывалось с учётом фильтрации
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
        id: true,
        createdAt: true,
        text: true,
        postId: true,
        user: {
          select: { id: true, name: true },
        },
        commentLikes: {
          select: {
            id: true,
            user: {
              select: { id: true, name: true },
            },
          },
        },
        commentDislikes: {
          select: {
            id: true,
            user: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    console.log("<====== 📋📋📋 query comments =====>", comments.length);
    return comments;
  },
>>>>>>> simple
};

export default Query;
