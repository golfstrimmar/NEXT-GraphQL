"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useMutation } from "@apollo/client";
import { LOGOUT_USER } from "@/apolo/mutations";
import useUserChatSubscriptions from "@/hooks/useUserChatSubscriptions";

import { useStateContext } from "@/components/StateProvider";
import UsersList from "@/components/UsersList/UsersList";
import useIdleLogout from "@/hooks/useIdleLogout";
import isTokenExpired from "@/utils/checkTokenExpiration";
import Chats from "@/components/Chats/Chats";

export default function Users() {
  const router = useRouter();
  const { user, setUser } = useStateContext();

  useIdleLogout();
  const [logoutUser] = useMutation(LOGOUT_USER);

  // ===============================
  useUserChatSubscriptions();

  // ===============================
  const handleActivity = async () => {
    try {
      await logoutUser();
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
      console.log("------Failed to log out. Please try again.-------");
    }
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      const token = localStorage.getItem("token");
      if (token && isTokenExpired(token)) {
        handleActivity();
      }
    }, 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);
  // ===============================

  // -------------------------

  // function ChatMessages({ chatId }: { chatId: number }) {
  //   const { data, loading } = useQuery(GET_MESSAGES, { variables: { chatId } });
  //   const [createMessage] = useMutation(CREATE_MESSAGE);
  //   const [messageText, setMessageText] = useState("");

  //   // Подписка на новые сообщения
  //   useSubscription(MESSAGE_CREATED_SUBSCRIPTION, {
  //     variables: { chatId },
  //     onData: ({ client, data }) => {
  //       const newMessage = data?.data?.messageCreated;
  //       if (!newMessage) return;
  //       client.cache.updateQuery(
  //         { query: GET_MESSAGES, variables: { chatId } },
  //         (oldData: any) => {
  //           if (!oldData) return { messages: [newMessage] };
  //           const exists = oldData.messages.some(
  //             (m: any) => m.id === newMessage.id
  //           );
  //           if (exists) return oldData;
  //           return { messages: [...oldData.messages, newMessage] };
  //         }
  //       );
  //     },
  //   });

  //   const handleSendMessage = async (e: React.FormEvent) => {
  //     e.preventDefault();
  //     if (!messageText.trim()) return;

  //     try {
  //       await createMessage({ variables: { chatId, text: messageText } });
  //       setMessageText("");
  //     } catch (err) {
  //       console.error("Error sending message:", err);
  //     }
  //   };

  //   if (loading) return <p>Loading messages...</p>;

  //   return (
  //     <div className="mt-2 border-t pt-2">
  //       <div className="max-h-40 overflow-y-auto mb-2">
  //         {data?.messages?.length === 0 && <p>No messages yet</p>}
  //         {data?.messages?.map((msg: any) => (
  //           <div key={msg.id} className="mb-1">
  //             <strong>{msg.sender.name}: </strong>
  //             <span>{msg.text}</span>
  //             <span className="text-xs text-gray-400 ml-2">
  //               {transformData(msg.createdAt)}
  //             </span>
  //           </div>
  //         ))}
  //       </div>
  //       <form onSubmit={handleSendMessage} className="flex gap-2">
  //         <input
  //           type="text"
  //           value={messageText}
  //           onChange={(e) => setMessageText(e.target.value)}
  //           placeholder="Type your message..."
  //           className="flex-grow border rounded p-1"
  //         />
  //         <button
  //           type="submit"
  //           className="bg-blue-500 text-white px-3 rounded hover:bg-blue-600"
  //         >
  //           Send
  //         </button>
  //       </form>
  //     </div>
  //   );
  // }
  // -------------------------

  return (
    <div className="container mx-auto flex justify-between items-center">
      <div className="mt-[80px] w-full">
        <UsersList />
        <Chats />
      </div>
    </div>
  );
}
