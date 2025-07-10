"use client";
import React from "react";
import { useState } from "react";
import { useMutation } from "@apollo/client";
import { CREATE_POST } from "@/apolo/mutations";
import Input from "../ui/Input/Input";
import Button from "../ui/Button/Button";
import { GET_ALL_POSTS } from "@/apolo/queryes";
import { useStateContext } from "@/components/StateProvider";

const AddPostForm = () => {
  const { user, showModal } = useStateContext();
  const [addPost, { loading: addLoading }] = useMutation(CREATE_POST, {
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
  return (
    <form onSubmit={handleSubmit} className="m-6 flex flex-col gap-3">
      <h2>Add Post form</h2>
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
  );
};

export default AddPostForm;
