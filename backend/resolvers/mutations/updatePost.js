import { pubsub, POST_UPDATED } from "../../utils/pubsub.js";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const updatePost = async (
  _,
  { id, category, title, text },
  { userId }
) => {
  if (!userId) throw new Error("Not authenticated");

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      creator: true,
      likes: true,
      dislikes: true,
    },
  });

  if (!post) throw new Error("Post not found");

  const updatedPost = await prisma.post.update({
    where: { id },
    data: {
      category,
      title,
      text,
    },
    include: {
      creator: true,
      likes: true,
      dislikes: true,
    },
  });

  const result = {
    ...updatedPost,
    likesCount: updatedPost.likes.length,
    dislikesCount: updatedPost.dislikes.length,
    likes: updatedPost.likes.map((like) => like.userId),
    dislikes: updatedPost.dislikes.map((dislike) => dislike.userId),
  };

  pubsub.publish(POST_UPDATED, { postUpdated: result });
  return result;
};

export default updatePost;
