"use client";
import React, { useState } from "react";
import "./Blog.scss";
import { useQuery, useMutation } from "@apollo/client";
import { GET_ALL_POSTS } from "@/apolo/queryes";
import { ADD_POST } from "@/apolo/mutations";
import useUserChatSubscriptions from "@/hooks/useUserChatSubscriptions";
import { useStateContext } from "@/components/StateProvider";
import Input from "@/components/ui/Input/Input";
import Button from "@/components/ui/Button/Button";
import Loading from "@/components/Loading";
import Image from "next/image";
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
  const [title, setTitle] = useState("");
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
      const { data } = await addPost({
        variables: {
          category,
          title,
          text,
        },
      });
      setText("");
      setTitle("");
      setCategory("");
    } catch (err) {
      console.error("Error adding post:", err);
      showModal("Error adding post.");
    }
  };

  return (
    <section className="my-4  mx-auto blog w-full">
      <h2 className="text-2xl font-bold mb-4">Blog</h2>
      <ul className="flex flex-col gap-4 ">
        {loading ? (
          <Loading />
        ) : (
          data?.posts.map((post) => (
            <li key={post.id} className="card">
              <h4 className="font-semibold">{post.category}</h4>
              <p className="bg-white my-4 p-2 rounded  text-black">
                {post.text}
              </p>
              <small className="text-white">Author: {post.creator.name}</small>
              <div className="flex gap-4 items-center mt-4 w-full">
                <Image
                  src="/svg/comment.svg"
                  alt={post.creator.name}
                  width={20}
                  height={20}
                />

                <Image
                  src="/svg/like.svg"
                  alt={post.creator.name}
                  width={20}
                  height={20}
                />
                <div className="transform rotate-180">
                  <Image
                    src="/svg/like.svg"
                    alt={post.creator.name}
                    width={20}
                    height={20}
                  />
                </div>
                <div className="ml-auto p-1 rounded-lg border  hover:border-red-800 trasition-all duration-300 cursor-pointer">
                  <Image
                    src="/svg/cross.svg"
                    alt={post.creator.name}
                    width={12}
                    height={12}
                  />
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
      <form onSubmit={handleSubmit} className="m-6 flex flex-col gap-3">
        <Input
          typeInput="text"
          data="Category *"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <Input
          typeInput="text"
          data="Title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Input
          typeInput="textarea"
          data="Enter your post here... *"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="w-50 max-w-1/2 ">
          <Button type="submit" disabled={addLoading}>
            {addLoading ? "Adding..." : "Add Post"}
          </Button>
        </div>
      </form>
    </section>
  );
};

export default Blog;
