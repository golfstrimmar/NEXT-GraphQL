"use client";
import React, { useState } from "react";
import "./Blog.scss";
import { useQuery, useMutation } from "@apollo/client";
import { GET_ALL_POSTS } from "@/apolo/queryes";
import { ADD_POST, TOGGLE_LIKE } from "@/apolo/mutations";
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
  likes: number;
  dislikes: number;
  currentUserReaction: "LIKE" | "DISLIKE" | null;
  creator: {
    id: string;
    name: string;
  };
};

const Blog = () => {
  useUserChatSubscriptions();
  const { user, showModal } = useStateContext();
  const { data, loading } = useQuery<{ posts: PostType[] }>(GET_ALL_POSTS);
  const [addPost, { loading: addLoading }] = useMutation(ADD_POST, {
    refetchQueries: [{ query: GET_ALL_POSTS }],
  });

  const [toggleLike] = useMutation(TOGGLE_LIKE, {
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
      await addPost({ variables: { category, title, text } });
      setText("");
      setTitle("");
      setCategory("");
    } catch (err) {
      console.error("Error adding post:", err);
      showModal("Error adding post.");
    }
  };

  const handleReaction = async (
    postId: string,
    reaction: "LIKE" | "DISLIKE"
  ) => {
    if (!user) return showModal("Login to react to posts.");
    try {
      await toggleLike({
        variables: {
          postId,
          reaction,
        },
      });
    } catch (err) {
      console.error("Error reacting to post:", err);
    }
  };

  return (
    <section className="my-4 mx-auto blog w-full">
      <h2 className="text-2xl font-bold mb-4">Blog</h2>
      <ul className="flex flex-col gap-4">
        {loading ? (
          <Loading />
        ) : (
          data?.posts.map((post) => (
            <li key={post.id} className="card">
              <h4 className="font-semibold">{post.category}</h4>
              <p className="bg-white my-4 p-2 rounded text-black">
                {post.text}
              </p>
              <small className="text-white">Author: {post.creator.name}</small>
              <div className="flex gap-4 items-center mt-4 w-full">
                <Image
                  src="/svg/comment.svg"
                  alt="comment"
                  width={20}
                  height={20}
                />
                <button onClick={() => handleReaction(post.id, "LIKE")}>
                  <Image
                    src="/svg/like.svg"
                    alt="like"
                    width={20}
                    height={20}
                    className={
                      post.currentUserReaction === "LIKE"
                        ? "opacity-100"
                        : "opacity-40"
                    }
                  />
                  <span className="text-sm ml-1">{post.likes}</span>
                </button>
                <button onClick={() => handleReaction(post.id, "DISLIKE")}>
                  <div className="transform rotate-180">
                    <Image
                      src="/svg/like.svg"
                      alt="dislike"
                      width={20}
                      height={20}
                      className={
                        post.currentUserReaction === "DISLIKE"
                          ? "opacity-100"
                          : "opacity-40"
                      }
                    />
                  </div>
                  <span className="text-sm ml-1">{post.dislikes}</span>
                </button>
                <div className="ml-auto p-1 rounded-lg border hover:border-red-800 transition-all duration-300 cursor-pointer">
                  <Image
                    src="/svg/cross.svg"
                    alt="delete"
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
        <div className="w-50 max-w-1/2">
          <Button type="submit" disabled={addLoading}>
            {addLoading ? "Adding..." : "Add Post"}
          </Button>
        </div>
      </form>
    </section>
  );
};

export default Blog;
