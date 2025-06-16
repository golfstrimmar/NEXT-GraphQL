"use client";
import Image from "next/image";
import { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";

const CREATE_MESSAGE = gql`
  mutation CreateMessage($text: String!, $authorId: ID!) {
    createMessage(text: $text, authorId: $authorId) {
      id
      text
      author {
        userName
      }
      createdAt
    }
  }
`;

const GET_MESSAGES = gql`
  query Messages {
    messages {
      id
      text
      author {
        userName
      }
      createdAt
    }
  }
`;

export default function Home() {
  const [text, setText] = useState("");
  const { loading, error, data, refetch } = useQuery(GET_MESSAGES);
  const [createMessage] = useMutation(CREATE_MESSAGE);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createMessage({
        variables: { text, authorId: "1" }, // Замени "1" на реальный ID пользователя
      });
      setText("");
      refetch(); // Обнови список сообщений
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>Ошибка: {error.message}</p>;

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1>Сообщения</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Напиши сообщение"
          />
          <button type="submit">Отправить</button>
        </form>
        <ul>
          {data.messages.map((message) => (
            <li key={message.id}>
              {message.author.userName}: {message.text} ({message.createdAt})
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
