import { pubsub, COMMENT_DELETED } from "./../../utils/pubsub.js";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const deleteComment = async (_, { id }, { userId }) => {
  if (!userId) {
    throw new Error("Not authenticated");
  }
  console.log("====> delete comment", id);
  const comment = await prisma.comment.delete({ where: { id } });
  pubsub.publish(COMMENT_DELETED, { commentDeleted: comment.id });
  return comment;
};

export default deleteComment;
