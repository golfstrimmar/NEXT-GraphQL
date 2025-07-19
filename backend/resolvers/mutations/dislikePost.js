import { pubsub, POST_DISLIKED } from "./../../utils/pubsub.js";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const dislikePost = async (_, { postId }, { userId }) => {
  if (!userId) {
    throw new Error("Authentication required");
  }

  // Удаляем дизлайк, если был
  await prisma.postLike.deleteMany({
    where: {
      postId,
      userId,
    },
  });

  // Добавляем лайк или ничего не делаем, если уже есть
  try {
    await prisma.postDislike.create({
      data: {
        postId,
        userId,
      },
    });
  } catch (error) {
    if (error.code === "P2002") {
      console.log("Like already exists");
    } else {
      throw error;
    }
  }

  // Загружаем пост с нужными связями
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      creator: true,
      likes: { include: { user: true } },
      dislikes: { include: { user: true } },
    },
  });

  console.log(" To subscribe postDisLiked   🟢--> ");

  const formattedPost = {
    id: post.id,
    title: post.title,
    text: post.text,
    category: post.category,
    createdAt: post.createdAt,
    creator: post.creator,
    likesCount: post.likes.length,
    dislikesCount: post.dislikes.length,
    likes: post.likes.map((like) => like.user.name),
    dislikes: post.dislikes.map((dislike) => dislike.user.name),
  };

  pubsub.publish(POST_DISLIKED, { postDisliked: formattedPost });

  return formattedPost;
};

export default dislikePost;
