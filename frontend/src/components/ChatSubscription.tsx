import { GET_USER_CHATS } from "@/apolo/queryes";
import { useStateContext } from "@/components/StateProvider";
import {
  MESSAGE_SENT_SUBSCRIPTION,
  MESSAGE_DELETED_SUBSCRIPTION,
  CHAT_DELETED_SUBSCRIPTION,
} from "@/apolo/subscriptions";
import { gql } from "@apollo/client";
import { useSubscription } from "@apollo/client";
function ChatSubscription({ chatId }: { chatId: number }) {
  const { showModal } = useStateContext();
  console.log("<==== 📣 SUBSCRIPTIONs active ====>", chatId);
  useSubscription(MESSAGE_SENT_SUBSCRIPTION, {
    variables: { chatId },
    onData: ({ client, data }) => {
      const newMessage = data?.data?.messageSent;
      if (!newMessage) return;
      console.log("<===== 🟢 SUBSCRIPTION messageSent =======>", newMessage);
      const chatCacheId = client.cache.identify({
        __typename: "Chat",
        id: newMessage.chat.id,
      });
      if (!chatCacheId) return;

      client.cache.modify({
        id: chatCacheId,
        fields: {
          messages(existingRefs = []) {
            const newRef = client.cache.writeFragment({
              data: newMessage,
              fragment: gql`
                fragment NewMessage on Message {
                  id
                  content
                  createdAt
                  sender {
                    id
                    name
                  }
                }
              `,
            });
            return [...existingRefs, newRef];
          },
        },
      });
    },
  });
  useSubscription(MESSAGE_DELETED_SUBSCRIPTION, {
    variables: { chatId },
    onData: ({ client, data }) => {
      console.log("💥MESSAGE_DELETED_SUBSCRIPTION:", data);

      client.refetchQueries({
        include: [GET_USER_CHATS],
      });
    },
  });
  useSubscription(CHAT_DELETED_SUBSCRIPTION, {
    onData: ({ client, data }) => {
      const deletedChatId = data?.data?.chatDeleted;
      if (!deletedChatId) return;

      console.log(
        "<===== 🗑️ SUBSCRIPTION  chatDeleted =======>",
        deletedChatId
      );
      showModal("🗑️ Chat deleted successfully!");
      client.cache.updateQuery({ query: GET_USER_CHATS }, (oldData) => {
        if (!oldData) return { chats: [] };
        return {
          userChats: oldData.userChats.filter(
            (chat: any) => Number(chat.id) !== Number(deletedChatId)
          ),
        };
      });
    },
  });
  return null; // просто подписка без UI
}

export default ChatSubscription;
