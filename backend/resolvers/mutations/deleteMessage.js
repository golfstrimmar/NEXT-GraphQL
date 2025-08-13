import { pubsub, MESSAGE_DELETED } from "./../../utils/pubsub.js";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const deleteMessage = async (_, { chatId, messageId }, { userId }) => {
  if (!userId) throw new Error("Not authenticated");
  if (!chatId) throw new Error("Not found");

  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: {
      messages: {
        where: { id: messageId },
      },
    },
  });

  if (!chat) throw new Error("Chat not found");

  if (chat.creatorId !== userId && chat.participantId !== userId) {
    throw new Error("You do not have permission to delete this message");
  }

  const message = chat.messages[0];
  if (!message) throw new Error("Message not found in this chat");

  await prisma.message.delete({ where: { id: messageId } });

  console.log("🟢 To subscribe messageDeleted -->", chatId, messageId);
  pubsub.publish(MESSAGE_DELETED, { messageDeleted: { messageId, chatId } });

  return messageId;
};
export default deleteMessage;
