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

  posts: async () => {
    const posts = await prisma.post.findMany({
      include: {
        creator: true,
        reactions: true,
      },
    });

    return posts.map((post) => {
      const likes = post.reactions.filter((r) => r.reaction === "LIKE").length;
      const dislikes = post.reactions.filter(
        (r) => r.reaction === "DISLIKE"
      ).length;

      return {
        id: post.id,
        category: post.category,
        title: post.title,
        text: post.text,
        createdAt: post.createdAt.toISOString(),
        creator: post.creator,
        likes,
        dislikes,
        currentUserReaction: null,
      };
    });
  },
};

export default Query;
