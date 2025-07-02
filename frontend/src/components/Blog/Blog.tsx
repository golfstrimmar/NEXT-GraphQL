"use client";
import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_ALL_POSTS } from "@/apolo/queryes";
import { ADD_POST } from "@/apolo/mutations";
import useUserChatSubscriptions from "@/hooks/useUserChatSubscriptions";
import { useStateContext } from "@/components/StateProvider";

type PostType = {
  id: string;
  text: string;
  category: string;
  createdAt: string;
  creator: {
    id: string;
    name: string;
  };
};

const Blog = () => {
  useUserChatSubscriptions();
  const { user, showModal } = useStateContext();
  const { data, loading, error } = useQuery<{ posts: PostType[] }>(
    GET_ALL_POSTS
  );

  const [addPost, { loading: addLoading }] = useMutation(ADD_POST, {
    refetchQueries: [{ query: GET_ALL_POSTS }],
  });

  const [text, setText] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showModal("To add a post, you must be logged in.");
      setText("");
      setCategory("");
      return;
    }
    if (!text.trim() || !category.trim()) {
      showModal("Please fill in all fields.");
      return;
    }
    try {
      await addPost({
        variables: {
          text,
          category,
        },
      });
      
      setText("");
      setCategory("");
    } catch (err) {
      console.error("Error adding post:", err);
      showModal("Error adding post.");
    }
  };

  // if (loading) return <p>Загрузка постов...</p>;
  // if (error) return <p>Ошибка загрузки постов.</p>;

  return (
    <section className="mt-4  mx-auto">
      <h2 className="text-2xl font-bold mb-4">Блог</h2>

      <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-3">
        <textarea
          placeholder="Текст поста"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          className="p-2 border rounded resize-none"
          required
        />
        <input
          type="text"
          placeholder="Категория"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="p-2 border rounded"
          required
        />
        <button
          type="submit"
          disabled={addLoading}
          className="bg-blue-600 text-white py-2 rounded disabled:opacity-50"
        >
          {addLoading ? "Добавление..." : "Добавить пост"}
        </button>
      </form>

      <ul className="flex flex-col gap-4">
        {data?.posts.map((post) => (
          <li key={post.id} className="border p-4 rounded shadow-sm">
            <h4 className="font-semibold">{post.category}</h4>
            <p>{post.text}</p>
            <small>Автор: {post.creator.name}</small>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Blog;
