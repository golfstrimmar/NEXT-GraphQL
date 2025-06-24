"use client";

import { useState, useEffect } from "react";
import { gql, useQuery, useMutation, useSubscription } from "@apollo/client";
import { useSelector } from "react-redux";

const GET_CHATS = gql`
  query {
    chats {
      id
      createdAt
      creator {
        id
        email
        name
      }
      participant {
        id
        email
        name
      }
      messages {
        id
        content
        createdAt
        sender {
          id
          name
        }
      }
    }
  }
`;

const CREATE_CHAT = gql`
  mutation ($participantId: ID!) {
    createChat(participantId: $participantId) {
      id
      createdAt
      creator {
        id
        email
        name
      }
      participant {
        id
        email
        name
      }
      messages {
        id
        content
        createdAt
        sender {
          id
          name
        }
      }
    }
  }
`;

const CHAT_CREATED_SUBSCRIPTION = gql`
  subscription {
    chatCreated {
      id
      createdAt
      creator {
        id
        email
        name
      }
      participant {
        id
        email
        name
      }
      messages {
        id
        content
        createdAt
        sender {
          id
          name
        }
      }
    }
  }
`;

const SEND_MESSAGE = gql`
  mutation ($chatId: ID!, $content: String!) {
    sendMessage(chatId: $chatId, content: $content) {
      id
      content
      createdAt
      sender {
        id
        name
      }
    }
  }
`;

const MESSAGE_SENT_SUBSCRIPTION = gql`
  subscription ($chatId: ID!) {
    messageSent(chatId: $chatId) {
      id
      content
      createdAt
      sender {
        id
        name
      }
    }
  }
`;

export default function Chats() {
  const users = useSelector(
    (state: { auth: { users: any[] } }) => state.auth.users
  );
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const [participantId, setParticipantId] = useState("");
  const user = useSelector((state: { auth: { user: any } }) => state.auth.user);
  const { data, loading, error, refetch } = useQuery(GET_CHATS);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [createChat, { loading: createChatLoading }] = useMutation(CREATE_CHAT);
  const [sendMessage, { loading: sendMessageLoading }] =
    useMutation(SEND_MESSAGE);
  const shouldSubscribe = Boolean(selectedChatId && !loading);

  const { data: subscriptionData } = useSubscription(
    MESSAGE_SENT_SUBSCRIPTION,
    {
      variables: { chatId: selectedChatId?.toString() },
      skip: !shouldSubscribe,
    }
  );
  const { data: chatCreatedData } = useSubscription(CHAT_CREATED_SUBSCRIPTION);

  console.log("📡 useSubscription CALLED for chatId =", selectedChatId);
  const [messages, setMessages] = useState<any[]>([]);

  const selectedChat = data?.chats.find(
    (chat: any) => Number(chat.id) === selectedChatId
  );

  let otherUser = null;

  if (selectedChat) {
    otherUser =
      Number(selectedChat.creator.id) === user?.id
        ? selectedChat.participant
        : selectedChat.creator;
  }

  // ------------------------------------------------

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
      console.log(
        "📥 Subscription message received:",
        subscriptionData.messageSent
      );
      setMessages((prev) => [...prev, subscriptionData.messageSent]);
    }
  }, [subscriptionData]);
  useEffect(() => {
    if (data) {
      console.log("<==== chats ====>", data.chats);
    }
    if (error && error.message === "Unexpected error.") {
      setErrorMessage("For get chats you need to be logged in.");
    }
  }, [data, error]);

  useEffect(() => {
    if (data?.chats && selectedChatId) {
      const selectedChat = data.chats.find(
        (chat: any) => Number(chat.id) === selectedChatId
      );
      if (selectedChat) {
        setMessages(selectedChat.messages);
      }
    }
  }, [data, selectedChatId]);

  const handleCreateChat = async (participantId: string) => {
    try {
      const { data } = await createChat({ variables: { participantId } });
      setSelectedChatId(Number(data.createChat.id));
    } catch (err) {
      console.error("Create chat error:", err);
      alert("Failed to create chat");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChatId || !messageContent.trim()) return;
    try {
      await sendMessage({
        variables: { chatId: selectedChatId, content: messageContent },
      });
      setMessageContent("");
    } catch (err) {
      console.error("Send message error:", err);
      alert("Failed to send message");
    }
  };

  if (error) return <p className="text-red-500 text-l mt-4">{errorMessage}</p>;

  return (
    <div className="flex h-screen p-4 mt-[100px]">
      <div className="w-1/3 border-r pr-4">
        {loading && (
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-4 border-gray-300 animate-spin"></div>
            <div className="absolute inset-1 rounded-full border-4 border-blue-500 border-t-transparent animate-spin-slower"></div>
          </div>
        )}
        <h1 className="text-2xl font-bold mb-4">Chats</h1>
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Start chat with:</h2>
          {users
            .filter((u) => u.id !== user?.id)
            .map((u) => (
              <button
                key={u.id}
                onClick={() => handleCreateChat(u.id)}
                className="mr-2 mb-2 px-3 py-1 bg-blue-200 rounded hover:bg-blue-300"
              >
                {u.name || u.email}
              </button>
            ))}
        </div>
        {data?.chats.map((chat: any) => (
          <div
            key={chat.id}
            onClick={() => setSelectedChatId(Number(chat.id))}
            className={`p-2 border rounded mb-2 cursor-pointer ${
              selectedChatId === chat.id ? "bg-gray-200" : ""
            }`}
          >
            <p>
              {Number(chat.creator.id) === user?.id
                ? chat.participant.name || chat.participant.email
                : chat.creator.name || chat.creator.email}
            </p>
            <p className="text-sm text-gray-500">
              Created: {new Date(chat.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
      <div className="w-2/3 pl-4">
        {selectedChatId ? (
          <>
            <h2 className="text-xl font-bold mb-4">
              Chat #{selectedChatId} with {otherUser?.name || otherUser?.email}
            </h2>
            <div className="h-[500px] overflow-y-auto border p-4 mb-4">
              {messages.map((message: any) => (
                <div
                  key={message.id}
                  className={`mb-2 ${
                    message.sender.id === user?.id ? "text-right" : "text-left"
                  }`}
                >
                  <p className="inline-block p-2 rounded bg-gray-100">
                    <strong>{message.sender.name || "Anonymous"}:</strong>{" "}
                    {message.content}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(message.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage}>
              <input
                type="text"
                placeholder="Type a message..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                className="w-full p-2 border rounded mb-2"
                required
              />
              <button
                type="submit"
                disabled={sendMessageLoading}
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
              >
                {sendMessageLoading ? "Sending..." : "Send"}
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
