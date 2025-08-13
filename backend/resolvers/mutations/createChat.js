import { pubsub, CHAT_CREATED } from "./../../utils/pubsub.js";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


export const createChat = async (_, { title, participantId }, { userId }) => {
  if (!userId) throw new Error("Not authenticated");
  if (userId === participantId)
    throw new Error("Cannot create chat with yourself");

  const existingChat = await prisma.chat.findFirst({
    where: {
      OR: [
        { creatorId: userId, participantId },
        { creatorId: participantId, participantId: userId },
      ],
    },
  });

  if (existingChat) throw new Error("Chat already exists");

  const chat = await prisma.chat.create({
    data: {
      creatorId: userId,
      participantId,
    },
    include: {
      creator: true,
      participant: true,
    },
  });
  console.log("To subscribe chatCreated 🟢-->");
  pubsub.publish(CHAT_CREATED, { chatCreated: chat });
  return chat;
};
export default createChat;
