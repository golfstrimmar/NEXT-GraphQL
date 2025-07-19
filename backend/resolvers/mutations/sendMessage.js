import { pubsub, MESSAGE_SENT } from "./../../utils/pubsub.js";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const sendMessage = async (_, { chatId, content }, { userId }) => {
  if (!userId) throw new Error("Not authenticated");
  console.log("<====🟢 chatId mutation sendMessage====>", chatId);
  const chat = await prisma.chat.findUnique({ where: { id: chatId } });
  if (!chat || (chat.creatorId !== userId && chat.participantId !== userId)) {
    throw new Error("Access denied");
  }

  await prisma.chat.update({
    where: { id: chatId },
    data: { updatedAt: new Date() },
  });

  const message = await prisma.message.create({
    data: {
      content,
      senderId: userId,
      chatId,
    },
    include: {
      sender: true,
      chat: true,
    },
  });
  console.log("<====🟢 mutation message sent====>", message);
  console.log(" To subscribe  messageSent  🟢--> ");
  pubsub.publish(MESSAGE_SENT, { messageSent: message });
  return message;
};
export default sendMessage;
