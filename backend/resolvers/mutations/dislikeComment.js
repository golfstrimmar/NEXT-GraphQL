import { pubsub, COMMENT_DISLIKED } from "./../../utils/pubsub.js";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const dislikeComment = async (_, { commentId }, { userId }) => {
  console.log("=======",userId,commentId)

  if (!userId) throw new Error("Authentication required");

  // Удаляем лайк, если он есть
  await prisma.commentLike.deleteMany({
    where: { commentId, userId },
  });

  try {
    await prisma.commentDislike.create({
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

  pubsub.publish(COMMENT_DISLIKED, { commentDisliked: comment });
  return comment;
};

export default dislikeComment;
