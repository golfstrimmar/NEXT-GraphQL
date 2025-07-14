import { pubsub, COMMENT_LIKED } from "./../../utils/pubsub.js";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const likeComment = async (_, { commentId }, { userId }) => {
  console.log("=======", userId, commentId);
  if (!userId) throw new Error("Authentication required");

  // Удаляем дизлайк, если он есть
  await prisma.commentDislike.deleteMany({
    where: { commentId, userId },
  });

  try {
    await prisma.commentLike.create({
      data: { commentId, userId },
    });
  } catch (error) {
    if (error.code !== "P2002") {
      throw error;
    }
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: {
      commentLikes: { include: { user: true } },
      commentDislikes: { include: { user: true } },
    },
  });

  pubsub.publish(COMMENT_LIKED, { commentLiked: comment });
  return comment;
};

export default likeComment;
