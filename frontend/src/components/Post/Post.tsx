"use client";
import React, { FC, useEffect, useRef, useState } from "react";
import { PostType } from "@/types/post";
import transformData from "@/hooks/useTransformData";
import { useApolloClient, useMutation, useQuery } from "@apollo/client";
import { GET_ALL_COMMENTS } from "@/apolo/queryes";
import {
  DELETE_POST,
  LIKE_POST,
  DISLIKE_POST,
  ADD_COMMENT,
  DELETE_COMMENT,
  LIKE_COMMENT,
  DISLIKE_COMMENT,
} from "@/apolo/mutations";
import { useStateContext } from "@/components/StateProvider";
import Tab from "@/components/ui/Tab/Tab";
import Image from "next/image";
import Input from "../ui/Input/Input";
import { motion, AnimatePresence } from "framer-motion";
import CommentType from "@/types/comment";

interface PostProps {
  post: PostType;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  PostToEdit: (post: PostType) => void; // Добавить сюда
}
const Post: FC<PostProps> = ({
  post,
  currentPage,
  setCurrentPage,
  PostToEdit,
  openCommentsPostId,
  setOpenCommentsPostId,
}) => {
  const { user } = useStateContext();
  const client = useApolloClient();
  const [deletePost] = useMutation(DELETE_POST);
  const [likePost] = useMutation(LIKE_POST);
  const [dislikePost] = useMutation(DISLIKE_POST);
  const [likeComment] = useMutation(LIKE_COMMENT);
  const [dislikeComment] = useMutation(DISLIKE_COMMENT);

  const [addComment] = useMutation(ADD_COMMENT);
  const [deleteComment] = useMutation(DELETE_COMMENT);

  const { showModal } = useStateContext();
  const [commentText, setCommentText] = useState<string>("");
  const tabRef = useRef<HTMLDivElement>(null);

  const [comments, setComments] = useState([]);
  const isOpen = openCommentsPostId === post.id;

  // --------
  const { data, loading, error } = useQuery(GET_ALL_COMMENTS, {
    variables: { postId: post.id },
    skip: !isOpen,
  });
  // --------
  useEffect(() => {
    if (data?.comments) {
      setComments(data?.comments);
    }
  }, [data?.comments]);
  // --------
  const handlerPostDeleted = async (id: number) => {
    try {
      await deletePost({
        variables: { id },
      });
    } catch (err) {
      console.log("------Failed to delete post. Please try again.-------", err);
      showModal(err?.message);
    }
  };
  // --------
  const handleLikePost = async (id) => {
    try {
      await likePost({
        variables: { postId: id },
      });
    } catch (err) {
      console.log("------Failed to like post.-------", err);
      showModal(err?.message);
    }
  };
  const handleDislikePost = (id) => {
    try {
      dislikePost({
        variables: { postId: id },
      });
    } catch (err) {
      console.log("------Failed to dislikePost -------", err);
      showModal(err?.message);
    }
  };
  // --------
  const handlerAddComment = async (e, id) => {
    e.preventDefault();
    console.log("<====comment====>", id, commentText);
    try {
      const { data } = await addComment({
        variables: { postId: id, text: commentText },
      });
      setCommentText("");
    } catch (err) {
      console.log("------Failed to add comment -------", err);
      showModal(err?.message);
    }
  };
  // --------
  const handlerDeleteComment = async (commentId) => {
    try {
      await deleteComment({
        variables: {
          id: commentId,
        },
      });
    } catch (err) {
      console.error(err);
    }
  };
  // --------
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        !event.target.closest(".comments-button") &&
        !event.target.closest(".comments-container")
      ) {
        setOpenCommentsPostId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  // --------
  const handleLikeComment = async (id) => {
    try {
      await likeComment({
        variables: { commentId: id },
      });
    } catch (err) {
      console.log("------Failed to like post.-------", err);
      showModal(err?.message);
    }
  };
  const handleDislikeComment = async (id) => {
    try {
      await dislikeComment({
        variables: { commentId: id },
      });
    } catch (err) {
      console.log("------Failed to dislike post -------", err);
      showModal(err?.message);
    }
  };
  // --------

  // --------
  return (
    <li className="card p-2 bg-white rounded shadow  relative" ref={tabRef}>
      <div className="absolute top-[5px] right-[5px]">
        {post?.creator?.id === user?.id && (
          <button
            onClick={() => {
              handlerPostDeleted(post.id);
            }}
            className=" border-transparent rounded border hover:border-red-500 transition duration-300 ease-in-out cursor-pointer"
          >
            ❌
          </button>
        )}
      </div>
      <h4 className="">
        <small className="text-indigo-400">Title: </small>
        {post.title}
      </h4>
      <h4>
        <small className="text-indigo-400">Category: </small>
        {post.category}
      </h4>
      <h4 className="">
        <small className="text-indigo-400">Autor: </small>
        {post.creator.name}
      </h4>
      <p className="text-black my-4">{post.text}</p>
      <small className="text-gray-400 ">
        Created: {transformData(post.createdAt)}
      </small>
      <div className="flex gap-4  mt-4">
        <div className="relative flex items-center gap-2">
          <button
            onClick={() => {
              handleLikePost(post.id);
            }}
            className="cursor-pointer"
          >
            👍
          </button>
          <Tab length={post.likesCount} details={post.likes} />
        </div>
        <div className="relative flex items-center gap-2">
          <button
            onClick={() => {
              handleDislikePost(post.id);
            }}
            className="cursor-pointer"
          >
            👎
          </button>
          <Tab length={post.dislikesCount} details={post.dislikes} />
        </div>
        {user && post.creator.id === user?.id && (
          <button
            onClick={() => {
              PostToEdit(post);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="cursor-pointer "
          >
            <Image
              src="./svg/edit-white.svg"
              alt="edit"
              width={15}
              height={15}
              className="ml-2"
            />
          </button>
        )}
      </div>
      <button
        onClick={() => {
          setOpenCommentsPostId(isOpen ? null : post.id);
        }}
        className="relative inline-flex  items-center gap-2 cursor-pointer comments-button"
      >
        <Image src="./svg/comment.svg" alt="comment" width={25} height={25} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2 w-full overflow-hidden comments-container"
          >
            {comments &&
              comments.map((comment: CommentType) => (
                <div
                  key={comment.id}
                  className="bg-slate-200 p-2 w-full rounded"
                >
                  <div className="flex mb-2">
                    <small className="text-[12px] text-blue-800">
                      {comment.userName.name}
                    </small>
                    <small className="text-[12px] ml-4">
                      {transformData(comment.createdAt)}
                    </small>
                    {comment.userName.name === user?.name && (
                      <button
                        onClick={() => {
                          handlerDeleteComment(comment?.id);
                        }}
                        className="ml-auto border-transparent rounded border hover:border-red-500 transition duration-300 ease-in-out cursor-pointer"
                      >
                        ❌
                      </button>
                    )}
                  </div>
                  <div className="bg-slate-100 p-2 w-full rounded !leading-normal">
                    {comment.text}
                  </div>
                  {/*--------------------------------------------------------------------*/}
                  <div className="flex mt-2">
                    <button
                      onClick={() => {
                        handleLikeComment(comment.id);
                      }}
                      className="cursor-pointer"
                    >
                      👍
                    </button>
                    <small className="text-[12px] text-blue-800">
                      {comment.commentLikes.length}
                    </small>

                    <button
                      onClick={() => {
                        handleDislikeComment(comment.id);
                      }}
                      className="cursor-pointer ml-4"
                    >
                      👎
                    </button>
                    <small className="text-[12px] text-blue-800">
                      {comment.commentDislikes.length}
                    </small>
                  </div>
                  {/*--------------------------------------------------------------------*/}

                  {/*--------------------------------------------------------------------*/}
                </div>
              ))}
            {user && (
              <form
                onSubmit={(e) => {
                  handlerAddComment(e, post.id);
                }}
                className="relative w-full bg-amber-50 rounded mt-6 "
              >
                <Input
                  typeInput="text"
                  name="comment"
                  data="Add comment here ..."
                  value={commentText}
                  onChange={(e) => {
                    setCommentText(e.target.value);
                  }}
                />
                <button
                  type="submit"
                  className="cursor-pointer absolute right-2 top-1/2 transform -translate-y-1/2 z-10 p-1 border hover:border-blue-500 rounded-md transition-all duration-200"
                >
                  <Image
                    src="/svg/envelope.svg"
                    alt="send"
                    width={20}
                    height={20}
                  />
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
};

export default Post;
