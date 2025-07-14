import { pubsub, POST_CREATED } from "./../../utils/pubsub.js";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createPost = async (_, { category, title, text }, { userId }) => {
  if (!userId) throw new Error("Not authenticated");
  console.log("<====🟢add Post🟢====> ", category, title, text, userId);
  const post = await prisma.post.create({
    data: {
      category,
      title,
      text,
      creatorId: userId,
    },
    include: {
      creator: true,
    },
  });
  const postForReturn = {
    ...post,
    likesCount: 0,
    dislikesCount: 0,
    likes: [],
    dislikes: [],
  };
  console.log(" To subscribe postCreated   🟢--> ");

  pubsub.publish(POST_CREATED, {
    postCreated: postForReturn,
  });
  return postForReturn;
};
export default createPost;
