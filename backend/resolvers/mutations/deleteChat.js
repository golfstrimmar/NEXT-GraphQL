import { pubsub, CHAT_DELETED } from "./../../utils/pubsub.js";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const deleteChat = async (_, { id }, { userId }) => {
  if (!userId) throw new Error("Not authenticated");

  const chat = await prisma.chat.findUnique({
    where: { id },
    include: {
      creator: true,
      participant: true,
      messages: true,
    },
  });

  if (!chat) throw new Error("Chat not found");
  if (chat.creatorId !== userId && chat.participantId !== userId) {
    throw new Error("You do not have permission to delete this chat");
  }

  // Удаляем сообщения (если не срабатывает каскад)
  await prisma.message.deleteMany({ where: { chatId: id } });

  const deletedChat = await prisma.chat.delete({
    where: { id },
    include: {
      creator: true,
      participant: true,
    },
  });

  console.log("🟢 To subscribe chatDeleted --> ", deletedChat.id);
  pubsub.publish(CHAT_DELETED, { chatDeleted: deletedChat.id }); // ✅ тут id
  return deletedChat;
};

export default deleteChat;
