"use client";
import React from "react";
import { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { CREATE_POST, UPDATE_POST } from "@/apolo/mutations";
import Input from "../ui/Input/Input";
import Button from "../ui/Button/Button";
import { GET_ALL_POSTS } from "@/apolo/queryes";
import { useStateContext } from "@/components/StateProvider";
import { PostType } from "@/types/post";

const AddPostForm = ({ post, setPostToEdit }) => {
  const { user, showModal } = useStateContext();
  const [addPost, { loading: addLoading }] = useMutation(CREATE_POST, {
    refetchQueries: [{ query: GET_ALL_POSTS }],
  });
  const [updatePost, { loading: updateLoading }] = useMutation(UPDATE_POST);

  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [isEdited, setisEdited] = useState<boolean>(false);

  // ------------------------------

  useEffect(() => {
    if (post) {
      setisEdited(true);
      console.log("<==== 📝 post to update ====>", post);
      setText(post.text);
      setTitle(post.title);
      setCategory(post.category);
    }
  }, [post]);
  // ------------------------------

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
    if (isEdited) {
      try {
        await updatePost({ variables: { category, title, text, id: post.id } });
        setText("");
        setTitle("");
        setCategory("");
        setisEdited(false);
        setPostToEdit(null);
      } catch (err) {
        console.error("Error updating post:", err);
        showModal("Error updating post.");
      }
    } else {
      try {
        await addPost({ variables: { category, title, text } });
        setText("");
        setTitle("");
        setCategory("");
      } catch (err) {
        console.error("Error adding post:", err);
        showModal("Error adding post.");
      }
    }
  };
  return (
    <form onSubmit={handleSubmit} className="my-6 flex flex-col gap-3">
      <h2>➕ Add Post form</h2>
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
      <div className="flex gap-3 ">
        <Button type="submit" disabled={addLoading}>
          {addLoading
            ? "Adding..."
            : updateLoading
            ? "Updating..."
            : isEdited
            ? "Update Post"
            : "Add Post"}
        </Button>

        <button
          type="reset"
          onClick={() => {
            setText("");
            setTitle("");
            setCategory("");
            setisEdited(false);
            setPostToEdit(null);
          }}
          className="text-amber-200 bg-amber-800 font-medium hover:text-amber-600 transition-colors duration-200 cursor-pointer  px-5 py-2.5 rounded"
        >
          reset
        </button>
      </div>
    </form>
  );
};

export default AddPostForm;
