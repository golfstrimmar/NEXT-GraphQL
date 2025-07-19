import { pubsub, COMMENT_ADDED } from "./../../utils/pubsub.js";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const addComment = async (_, { postId, text }, { userId }) => {
  if (!userId) {
    throw new Error("Not authenticated");
  }

  console.log("<=== addComment postId, text=====>", postId, text);

  const comment = await prisma.comment.create({
    data: {
      postId,
      userId,
      text,
    },
    include: {
      user: {
        select: { name: true },
      },
    },
  });

  console.log(" To subscribe commentAdded   🟢--> ");
  pubsub.publish(COMMENT_ADDED, { commentAdded: comment });

  return comment;
};

export default addComment;
