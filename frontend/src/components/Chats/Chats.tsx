"use client";

import { useState, useEffect } from "react";
import { gql, useQuery, useMutation, useSubscription } from "@apollo/client";
import { useSelector } from "react-redux";
import dynamic from "next/dynamic";
import Button from "@/components/ui/Button/Button";
import Image from "next/image";
import { div } from "framer-motion/m";
import {
  GET_CHATS,
  CREATE_CHAT,
  CHAT_CREATED_SUBSCRIPTION,
  SEND_MESSAGE,
  MESSAGE_SENT_SUBSCRIPTION,
} from "@/apolo/apolo";
const ModalMessage = dynamic(
  () => import("@/components/ModalMessage/ModalMessage"),
  {
    ssr: false,
  }
);

export default function Chats() {
  const users = useSelector(
    (state: { auth: { users: any[] } }) => state.auth.users
  );
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const [participantId, setParticipantId] = useState("");
  const user = useSelector((state: { auth: { user: any } }) => state.auth.user);

  const { data, loading, error, refetch } = useQuery(GET_CHATS, {
    ssr: false,
    skip: !user?.id, // Пропускаем если нет пользователя
  });

  const [errorMessage, setErrorMessage] = useState<string>("");
  const [createChat, { loading: createChatLoading }] = useMutation(CREATE_CHAT);
  const [sendMessage, { loading: sendMessageLoading }] =
    useMutation(SEND_MESSAGE);
  const shouldSubscribe = Boolean(selectedChatId && !loading);

  const { data: subscriptionData } = useSubscription(
    MESSAGE_SENT_SUBSCRIPTION,
    {
      variables: { chatId: selectedChatId?.toString() },
      skip: !selectedChatId || !user?.id,
    }
  );
  const { data: chatCreatedData } = useSubscription(CHAT_CREATED_SUBSCRIPTION, {
    skip: !user?.id,
  });
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [openModalMessage, setOpenModalMessage] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  console.log("📡 useSubscription CALLED for chatId =", selectedChatId);
  const [messages, setMessages] = useState<any[]>([]);

  const selectedChat = data?.chats.find(
    (chat: any) => Number(chat.id) === selectedChatId
  );

  // const getOtherUser = () => {
  //   let otherUser = null;
  //   if (selectedChat) {
  //     otherUser =
  //       Number(selectedChat.creator.id) === user?.id
  //         ? selectedChat.participant
  //         : selectedChat.creator;
  //   }
  //   return otherUser;
  // };

  // ------------------------------------------------
  const showModal = (message: string) => {
    setSuccessMessage(message);
    setOpenModalMessage(true);
    setIsModalVisible(true);
    setTimeout(() => {
      setOpenModalMessage(false);
      setSuccessMessage("");
      return;
    }, 2000);
  };
  // ------------------------------------------------

  useEffect(() => {
    if (users) {
      console.log("<==== users====>", users);
    }
  }, [users]);

  useEffect(() => {
    if (chatCreatedData?.chatCreated) {
      console.log("📥 New chat created:", chatCreatedData.chatCreated);
      refetch();
      // Опционально: автоматически выбираем новый чат
      setSelectedChatId(Number(chatCreatedData.chatCreated.id));
    }
  }, [chatCreatedData, refetch]);

  useEffect(() => {
    if (subscriptionData?.messageSent) {
      setMessages((prev) => [...prev, subscriptionData.messageSent]);
    }
  }, [subscriptionData]);
  useEffect(() => {
    if (data) {
      console.log("<==== chats ====>", data.chats);
    }
    if (error && error.message === "Unexpected error.") {
      showModal("For get chats you need to be logged in.");
    }
  }, [data, error]);

  useEffect(() => {
    if (selectedChatId && data?.chats) {
      const chat = data.chats.find((c: any) => Number(c.id) === selectedChatId);
      if (chat) setMessages(chat.messages || []);
    }
  }, [selectedChatId, data]);

  const handleCreateChat = async (participantId: string) => {
    try {
      const { data } = await createChat({ variables: { participantId } });
      setSelectedChatId(Number(data?.createChat.id));
    } catch (err) {
      console.error("Create chat error:", err);
      showModal("Chat already exists.");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChatId || !messageContent.trim()) {
      showModal("Please fill in all fields.");
      return;
    }
    try {
      await sendMessage({
        variables: { chatId: selectedChatId, content: messageContent },
      });
      setMessageContent("");
    } catch (err) {
      console.error("Send message error:", err);
      showModal("Failed to send message.");
    }
  };
  // --------------window---------------------
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest(".chat") || target.closest(".chat-form")) {
        console.log(
          "<==== target =======>",
          target.closest(".chat-container") || target.closest(".chat-form")
        );
      }

      if (!target.closest(".chat-form") && !target.closest(".chat")) {
        setSelectedChatId(null);
      }
    };

    window.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);
  // -----------
  const currentUsers = () => {
    const CU = users
      .filter((u) => u.id !== user.id)
      .filter(
        (u) =>
          !data.chats?.some((c: any) => Number(c.creator.id) === u.id) &&
          !data.chats?.some((c: any) => Number(c.participant.id) === u.id)
      );
    return (
      <>
        {CU.length > 0 && (
          <h2 className="text-lg font-semibold">Start chat with:</h2>
        )}
        <div className="flex flex-wrap gap-2">
          {CU.map((u) => (
            <div key={u.id}>
              {/* <p>{u.id}</p> */}
              <Button onClick={() => handleCreateChat(u.id)}>
                {u.name || u.email}
              </Button>
            </div>
          ))}
        </div>
      </>
    );
  };
  // -----------
  if (error) return <p className="text-red-500 text-l mt-4">{errorMessage}</p>;

  return (
    <div className=" h-screen mt-2">
      {isModalVisible && (
        <ModalMessage message={successMessage} open={openModalMessage} />
      )}
      <div className="">
        {loading && (
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-4 border-gray-300 animate-spin"></div>
            <div className="absolute inset-1 rounded-full border-4 border-blue-500 border-t-transparent animate-spin-slower"></div>
          </div>
        )}
        <h1 className="text-2xl font-bold mb-4">Chats for user: {user.name}</h1>
        <div className="mb-4">{currentUsers()}</div>
        <h2 className="text-lg font-semibold">Your chats with:</h2>
        <div className="chat-container">
          {data?.chats.map((chat: any) => (
            <div
              key={chat.id}
              onClick={() => {
                if (selectedChatId !== Number(chat.id)) {
                  setSelectedChatId(Number(chat.id));
                } else {
                  setSelectedChatId(null);
                }
              }}
              className={`chat px-2 inline-flex gap-2 mr-2 justify-between items-center transition-all duration-300   border rounded-2xl  mb-2 cursor-pointer ${
                selectedChatId === Number(chat.id) ? "bg-lime-400" : ""
              }`}
            >
              <p>
                {Number(chat.creator.id) === user?.id
                  ? chat.participant.name || chat.participant.email
                  : chat.creator.name || chat.creator.email}
              </p>

              <Image src="/svg/click.svg" alt="click" width={15} height={15} />
            </div>
          ))}
        </div>
      </div>
      <div className="chat-form">
        {selectedChatId ? (
          <>
            <p className="text-[12px] text-gray-400">
              Chat created: {new Date(selectedChat?.createdAt).toLocaleString()}
            </p>
            <div className=" border p-4 mb-4">
              {messages.map((message: any) => (
                <div
                  key={message.id}
                  className={` mb-2 grid grid-cols-[max-content_1fr] gap-2 p-1 bg-gray-100 ${
                    message.sender.id === user?.id ? "text-right" : "text-left"
                  }`}
                >
                  <div>
                    <p
                      className={`inline-block px-2 rounded text-[14px] text-bold ${
                        message.sender.name === user?.name
                          ? "bg-blue-400"
                          : "bg-lime-400"
                      }`}
                    >
                      {message.sender.name}
                    </p>

                    <p className="text-[10px] px-2 text-gray-500">
                      {new Date(message.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <p className="inline-block px-2 bg-white rounded border border-gray-300 ">
                    {message.content}
                  </p>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="relative">
              <input
                type="text"
                placeholder="Type new message..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                className="w-full p-2 border rounded "
                required
              />
              <button
                type="submit"
                disabled={sendMessageLoading}
                className="cursor-pointer absolute z-20 right-2 top-1/2 -translate-y-1/2"
              >
                <Image
                  src="/svg/envelope.svg"
                  alt="send"
                  width={25}
                  height={25}
                />
              </button>
            </form>
          </>
        ) : (
          <p>Select a chat to view messages</p>
        )}
      </div>
    </div>
  );
}
