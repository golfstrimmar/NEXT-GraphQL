"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_USER_CHATS } from "@/apolo/queryes";
import { DELETE_CHAT, SEND_MESSAGE } from "@/apolo/mutations";
import { useStateContext } from "@/components/StateProvider";
import transformData from "@/hooks/useTransformData";
import Image from "next/image";
import Input from "@/components/ui/Input/Input";
import useUserChatSubscriptions from "@/hooks/useUserChatSubscriptions";
import UsersList from "@/components/UsersList/UsersList";
import "./chats.scss";
import { Chat } from "@/types/chat";

const Chats = () => {
  const { user } = useStateContext();
  const [deleteChat] = useMutation(DELETE_CHAT);
  const [sendMessage] = useMutation(SEND_MESSAGE);
  const { showModal } = useStateContext();
  useUserChatSubscriptions();
  const [texts, setTexts] = useState<Record<number, string>>({});

  // -----------------
  const {
    data: chatsData,
    loading: chatsLoading,
    error: chatsError,
  } = useQuery(GET_USER_CHATS, {
    skip: !user,
  });
  const chats: Chat[] = useMemo(() => {
    return chatsData?.userChats ?? [];
  }, [chatsData]);
  // -----------------
  const handleDeleteChat = async (id: number) => {
    try {
      const { data } = await deleteChat({ variables: { id } });
      console.log("<=====🟢 MUTATION deleteChat =====>", data);
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
      await sendMessage({
        variables: { chatId: chatID, content: messageText },
      });
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
        <div className="flex flex-col  gap-2 ">
          {!user && (
            <p className="inline-block mt-6  bg-gray-200  border rounded p-2 text-center">
              <span className="bg-white p-1 rounded">
                Please log in to see your chats.
              </span>
            </p>
          )}
          {user && <h2 className="mt-4">Your Chats:</h2>}

          {chats.length === 0 && <p>No chats found</p>}
          {chats
            ?.filter(
              (chat) =>
                chat.creator.id === user?.id || chat.participant.id === user?.id
            )
            .map((chat) => (
              <div
                key={chat.id}
                className="p-2 w-full mb-2 border rounded bg-white chat"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p>
                      📢 <strong>{chat.creator.name}</strong> ↔{" "}
                      <strong>{chat.participant.name}</strong>
                    </p>
                    <p className="text-[12px] text-gray-200">
                      🕒 {transformData(chat.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteChat(chat.id)}
                    type="button"
                  >
                    <Image
                      src="/svg/cross.svg"
                      alt="delete"
                      width={20}
                      height={20}
                      className="cursor-pointer bg-white p-1 border hover:border-red-500 rounded-md transition-all duration-200"
                    />
                  </button>
                </div>
                <ul className="flex flex-col gap-2  my-4  ">
                  {chat.messages &&
                    chat.messages?.map((message) => (
                      <li
                        key={message.id}
                        className="text-black bg-white rounded p-1"
                      >
                        <h3 className="text-black font-bold  text-[16px] ">
                          {message.sender.name}:
                        </h3>
                        <p className="text-black border border-gray-400 rounded p-1">
                          {message.content}
                        </p>
                        <p className="text-[12px]">
                          {transformData(message.createdAt)}
                        </p>
                      </li>
                    ))}
                </ul>
                {/* --------------------------------- */}
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
