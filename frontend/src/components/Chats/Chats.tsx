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
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const [participantId, setParticipantId] = useState("");
  const user = useSelector((state: { auth: { user: any } }) => state.auth.user);
  const { data, loading, error } = useQuery(GET_CHATS);
  const [createChat, { loading: createChatLoading }] = useMutation(CREATE_CHAT);
  const [sendMessage, { loading: sendMessageLoading }] =
    useMutation(SEND_MESSAGE);
  const { data: subscriptionData } = useSubscription(
    MESSAGE_SENT_SUBSCRIPTION,
    {
      variables: { chatId: selectedChatId },
      skip: !selectedChatId,
    }
  );

  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (data?.chats && selectedChatId) {
      const selectedChat = data.chats.find(
        (chat: any) => chat.id === selectedChatId
      );
      if (selectedChat) {
        setMessages(selectedChat.messages);
      }
    }
  }, [data, selectedChatId]);

  useEffect(() => {
    if (subscriptionData?.messageSent) {
      setMessages((prev) => [...prev, subscriptionData.messageSent]);
    }
  }, [subscriptionData]);

  const handleCreateChat = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await createChat({ variables: { participantId } });
      setParticipantId("");
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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="flex h-screen p-4 mt-[100px]">
      <div className="w-1/3 border-r pr-4">
        <h1 className="text-2xl font-bold mb-4">Chats</h1>
        <form onSubmit={handleCreateChat} className="mb-4">
          <input
            type="text"
            placeholder="Participant ID"
            value={participantId}
            onChange={(e) => setParticipantId(e.target.value)}
            className="w-full p-2 border rounded mb-2"
            required
          />
          <button
            type="submit"
            disabled={createChatLoading}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {createChatLoading ? "Creating..." : "Create Chat"}
          </button>
        </form>
        {data?.chats.map((chat: any) => (
          <div
            key={chat.id}
            onClick={() => setSelectedChatId(Number(chat.id))}
            className={`p-2 border rounded mb-2 cursor-pointer ${
              selectedChatId === chat.id ? "bg-gray-200" : ""
            }`}
          >
            <p>
              {chat.creator.id === user?.id
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
            <h2 className="text-xl font-bold mb-4">Chat #{selectedChatId}</h2>
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
