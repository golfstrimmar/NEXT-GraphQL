"use client";
import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_ALL_CHATS } from "@/apolo/queryes";
import { DELETE_CHAT, SEND_MESSAGE } from "@/apolo/mutations";
import { useStateContext } from "@/components/StateProvider";
import transformData from "@/hooks/useTransformData";
import Image from "next/image";
import Input from "@/components/ui/Input/Input";
import useUserChatSubscriptions from "@/hooks/useUserChatSubscriptions";
import UsersList from "@/components/UsersList/UsersList";

type ChatType = {
  id: number;
  createdAt: string;
  creator: { id: number; name: string };
  participant: { id: number; name: string };
  messages: {
    id: number;
    text: string;
    sender: { id: number; name: string };
  }[];
};

const Chats = () => {
  const { user } = useStateContext();
  const { data: allChatsData } = useQuery<{ chats: ChatType[] }>(GET_ALL_CHATS);
  const [deleteChat] = useMutation(DELETE_CHAT);
  const [sendMessage] = useMutation(SEND_MESSAGE);
  const { showModal } = useStateContext();
  useUserChatSubscriptions();

  const [texts, setTexts] = useState<Record<number, string>>({});

  // -----------------

  useEffect(() => {
    if (allChatsData?.chats) {
      console.log("<==== chats ====>", allChatsData?.chats);
    }
  }, [allChatsData?.chats]);
  // -----------------
  const handleDeleteChat = async (id: number) => {
    try {
      const { data } = await deleteChat({ variables: { id } });
      console.log("<=====🟢 MUTATION deleteChat   =====>", data);
      showModal("Chat deleted successfully!");
    } catch (err) {
      console.error("Mutation error:", err);
      showModal("Failed to delete chat");
    }
  };

  // -----------------
  const handleSendMessage = async (
    e: React.FormEvent<HTMLFormElement>,
    chatID: number
  ) => {
    e.preventDefault();
    const messageText = texts[chatID] || "";
    if (!messageText.trim()) {
      showModal("Text is required!");
      return;
    }
    try {
      await sendMessage({ variables: { chatId: chatID, text: messageText } });
      setTexts((prev) => ({ ...prev, [chatID]: "" }));
    } catch (err) {
      console.error("Mutation error:", err);
      showModal("Failed to send message");
    }
  };

  // ----------------

  return (
    <div className="mt-[80px] ">
      <div className="container">
        <UsersList />
        <div className="flex flex-col  gap-2">
          {!user && (
            <p className="inline-block mt-6  bg-gray-200  border rounded p-2 text-center">
              <span className="bg-white p-1 rounded">
                Please log in to see your chats.
              </span>
            </p>
          )}
          {user && <h2 className="mt-4">Your Chats:</h2>}

          {allChatsData?.chats?.length === 0 && <p>No chats found</p>}
          {allChatsData?.chats
            ?.filter(
              (chat) =>
                chat.creator.id === user?.id || chat.participant.id === user?.id
            )
            .map((chat) => (
              <div
                key={chat.id}
                className="p-2 w-full mb-2 border rounded bg-white"
              >
                <p>
                  📢 <strong>{chat.creator.name}</strong> ↔{" "}
                  <strong>{chat.participant.name}</strong>
                </p>
                <p className="text-sm text-gray-500">
                  🕒 {transformData(chat.createdAt)}
                </p>
                <p>id: {chat.id}</p>
                <button onClick={() => handleDeleteChat(chat.id)} type="button">
                  <Image
                    src="/svg/cross.svg"
                    alt="delete"
                    width={20}
                    height={20}
                    className="cursor-pointer bg-white p-1 border hover:border-red-500 rounded-md transition-all duration-200"
                  />
                </button>

                <ul className="flex flex-col">
                  {chat.messages &&
                    chat.messages?.map((message) => (
                      <li key={message.id}>
                        <span className="font-bold">
                          {message.sender.name}:
                        </span>{" "}
                        {message.text}
                      </li>
                    ))}
                </ul>

                <form
                  className="mt-2 relative"
                  onSubmit={(e) => handleSendMessage(e, chat.id)}
                >
                  <Input
                    typeInput="text"
                    data="Write a message..."
                    value={texts[chat.id] || ""}
                    onChange={(e) =>
                      setTexts((prev) => ({
                        ...prev,
                        [chat.id]: e.target.value,
                      }))
                    }
                  />
                  <button
                    type="submit"
                    className="cursor-pointer absolute right-2 top-1/2 transform -translate-y-1/2 z-10 p-1 border hover:border-blue-500 rounded-md transition-all duration-200"
                  >
                    <Image
                      src="/svg/envelope.svg"
                      alt="send"
                      width={20}
                      height={20}
                    />
                  </button>
                </form>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Chats;
