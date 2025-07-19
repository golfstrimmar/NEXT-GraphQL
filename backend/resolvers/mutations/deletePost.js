import { pubsub, POST_DELETED } from "./../../utils/pubsub.js";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const deletePost = async (_, { id }, { userId }) => {
  if (!userId) {
    throw new Error("Not authenticated");
  }
  const post = await prisma.post.findUnique({ where: { id } });

  console.log("<==== 🟢 mut deletePost====>", post, userId);
  if (!post || post.creatorId !== userId) {
    throw new Error("You have no permission to delete this post");
  }
  await prisma.post.delete({ where: { id } });
  console.log(" To subscribe postDeleted   🟢--> ");
  pubsub.publish(POST_DELETED, { postDeleted: id });
  return id;
};

export default deletePost;
