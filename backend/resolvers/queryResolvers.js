// queryResolvers.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const Query = {
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
  posts: async (_, __, { userId }) => {
    const posts = await prisma.post.findMany({
      include: {
        creator: true,
        reactions: true, // если есть связь
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return posts.map((post) => {
      const likes = post.reactions.filter((r) => r.type === "LIKE").length;
      const dislikes = post.reactions.filter(
        (r) => r.type === "DISLIKE"
      ).length;

      const currentUserReaction = userId
        ? post.reactions.find((r) => r.userId === userId)?.type || null
        : null;

      return {
        ...post,
        likes,
        dislikes,
        currentUserReaction,
      };
    });
  },
};

export default Query;
