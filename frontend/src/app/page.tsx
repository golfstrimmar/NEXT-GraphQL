"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useSubscription, gql } from "@apollo/client";
import { useApolloClient } from "@apollo/client";
import Link from "next/link";
import Button from "@/components/ui/Button/Button";
import Input from "@/components/ui/Input/Input";
import dynamic from "next/dynamic";

const ModalMessage = dynamic(
  () => import("@/components/ui/ModalMessage/ModalMessage"),
  { ssr: false }
);

// GraphQL запросы
const GET_USERS = gql`
  query GetUsers {
    users {
      id
      userName
      email
      createdAt
      avatarUrl
    }
  }
`;

const GET_MESSAGES = gql`
  query GetMessages {
    messages {
      id
      text
      createdAt
      author {
        id
        userName
      }
    }
  }
`;

const CREATE_MESSAGE = gql`
  mutation CreateMessage($text: String!, $authorId: ID!) {
    createMessage(text: $text, authorId: $authorId) {
      id
      text
      author {
        id
        userName
      }
      createdAt
    }
  }
`;

const USER_CREATED_SUBSCRIPTION = gql`
  subscription OnUserCreated {
    userCreated {
      id
      userName
      email
      createdAt
      avatarUrl
    }
  }
`;

const MESSAGE_CREATED_SUBSCRIPTION = gql`
  subscription OnMessageCreated {
    messageCreated {
      id
      text
      createdAt
      author {
        id
        userName
      }
    }
  }
`;

export default function ChatPage() {
  const client = useApolloClient();
  const [text, setText] = useState("");
  const [currentUserId, setCurrentUserId] = useState("1");
  const [successMessage, setSuccessMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Запросы данных
  const {
    data: usersData,
    loading: usersLoading,
    subscribeToMore: subscribeToMoreUsers,
  } = useQuery(GET_USERS);

  const { data: messagesData, loading: messagesLoading } =
    useQuery(GET_MESSAGES);

  useEffect(() => {
    if (usersData?.users) {
      console.log("<==== usersData?.users====>", usersData?.users);
    }
  }, [usersData?.users]);

  // Подписка на новых пользователей
  useEffect(() => {
    const unsubscribe = subscribeToMoreUsers({
      document: USER_CREATED_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const newUser = subscriptionData.data.userCreated;
        return {
          ...prev,
          users: [...prev.users, newUser],
        };
      },
    });
    return () => unsubscribe();
  }, [subscribeToMoreUsers]);

  // Подписка на новые сообщения
  useSubscription(MESSAGE_CREATED_SUBSCRIPTION, {
    onData: ({ data }) => {
      const newMessage = data.data.messageCreated;
      client.cache.updateQuery({ query: GET_MESSAGES }, (existing) => ({
        messages: [...(existing?.messages || []), newMessage],
      }));
    },
  });

  // Мутация для создания сообщения
  const [createMessage] = useMutation(CREATE_MESSAGE, {
    onCompleted: () => {
      setText("");
      setSuccessMessage("Message sent!");
      setIsModalOpen(true);
      setTimeout(() => setIsModalOpen(false), 1500);
    },
    onError: (error) => {
      console.error("Error:", error);
      setSuccessMessage("Failed to send message");
      setIsModalOpen(true);
      setTimeout(() => setIsModalOpen(false), 1500);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    createMessage({
      variables: {
        text: text.trim(),
        authorId: currentUserId,
      },
    });
  };

  return (
    <div className="min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 w-full max-w-2xl">
        <ModalMessage message={successMessage} open={isModalOpen} />

        {/* Форма отправки сообщения */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <Input
            typeInput="text"
            data="Enter your message"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1"
          />
          <Button
            buttonText="Send"
            buttonType="submit"
            disabled={!text.trim()}
          />
        </form>

        {/* Список пользователей */}
        <section>
          <h2 className="text-xl font-semibold mb-4">
            Users ({usersData?.users?.length || 0})
          </h2>
          {usersData?.users?.length === 0 ? (
            <div className="animate-pulse">Loading users...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {usersData?.users?.map((user) => (
                <div key={user.id} className="border p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="font-medium">{user.userName}</h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <p className="text-xs text-gray-400">
                        Joined:{" "}
                        {new Date(Number(user.createdAt)).toLocaleString(
                          "de-DE",
                          {
                            timeZone: "Europe/Berlin",
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Список сообщений */}
        <section>
          <h2 className="text-xl font-semibold mb-4">
            Messages ({messagesData?.messages?.length || 0})
          </h2>
          {messagesLoading ? (
            <div className="animate-pulse">Loading messages...</div>
          ) : (
            <ul className="space-y-3">
              {messagesData?.messages?.map((message) => (
                <li key={message.id} className="border-b pb-3">
                  <div className="flex justify-between items-start">
                    <span className="font-medium">
                      {message.author.userName}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="mt-1 text-gray-800">{message.text}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
