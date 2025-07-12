"use client";
import React, { FC, useEffect, useRef, useState } from "react";

import { PostType } from "@/types/post";
import transformData from "@/hooks/useTransformData";
import { useMutation, useQuery } from "@apollo/client";
import { GET_ALL_COMMENTS } from "@/apolo/queryes";
import {
  DELETE_POST,
  LIKE_POST,
  DISLIKE_POST,
  ADD_COMMENT,
  DELETE_COMMENT,
} from "@/apolo/mutations";
import { useStateContext } from "@/components/StateProvider";
import Tab from "@/components/ui/Tab/Tab";
import Image from "next/image";
import { div } from "framer-motion/m";
import Input from "../ui/Input/Input";
import { motion, AnimatePresence } from "framer-motion";

interface PostProps {
  post: PostType;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}
const Post: FC<PostProps> = ({ post, currentPage, setCurrentPage }) => {
  const { user } = useStateContext();
  const [deletePost] = useMutation(DELETE_POST);
  const [likePost] = useMutation(LIKE_POST);
  const [dislikePost] = useMutation(DISLIKE_POST);
  const { data: comments } = useQuery(GET_ALL_COMMENTS, {
    variables: { postId: post.id },
  });
  const [addComment] = useMutation(ADD_COMMENT);
  const [deleteComment] = useMutation(DELETE_COMMENT);

  const { showModal } = useStateContext();
  const [commentText, setCommentText] = useState<string>("");
  const [commentsIsOpen, setCommentsIsOpen] = useState<boolean>(false);
  const tabRef = useRef<HTMLDivElement>(null);
  // --------

  // --------

  useEffect(() => {
    if (comments) {
      console.log("<==== post comments====>", comments.comments);
    }
  }, [comments]);

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
      if (tabRef.current && !tabRef.current.contains(event.target as Node)) {
        setCommentsIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  // --------

  return (
    <li className="card p-4 bg-white rounded shadow  " ref={tabRef}>
      <div className="flex justify-between">
        <h3 className="font-semibold text-red-400">{post.id}</h3>
        {post?.creator?.id === user?.id && (
          <button
            onClick={() => {
              handlerPostDeleted(post.id);
            }}
            className="border-transparent rounded border hover:border-red-500 transition duration-300 ease-in-out cursor-pointer"
          >
            ❌
          </button>
        )}
      </div>

      <h4 className="mt-4">
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
      </div>

      <button
        onClick={() => {
          setCommentsIsOpen((prev) => !commentsIsOpen);
        }}
        className="relative inline-flex  items-center gap-2 cursor-pointer "
      >
        <Image src="./svg/comment.svg" alt="comment" width={25} height={25} />
        <Image
          src="./svg/click-darck.svg"
          alt="arrow-down"
          width={15}
          height={15}
          className={`${
            commentsIsOpen ? "rotate-180" : ""
          }  transition-transform duration-300 ease-in-out `}
        />
      </button>

      <AnimatePresence>
        {commentsIsOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2 w-full overflow-hidden"
          >
            {comments?.comments &&
              comments?.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-slate-200 p-2 w-full rounded"
                >
                  <small className="text-[12px] text-blue-800">
                    {comment.userName.name}
                  </small>
                  <small className="text-[12px] ml-4">
                    {transformData(comment.createdAt)}
                  </small>
                  <div className="bg-slate-100 p-2 w-full rounded">
                    {comment.text}
                  </div>
                  {comment.userName.name === user?.name && (
                    <button
                      onClick={() => {
                        handlerDeleteComment(comment?.id);
                      }}
                      className="border-transparent rounded border hover:border-red-500 transition duration-300 ease-in-out cursor-pointer"
                    >
                      ❌
                    </button>
                  )}
                </div>
              ))}
            {user && (
              <form
                onSubmit={(e) => {
                  handlerAddComment(e, post.id);
                }}
                className="relative w-full bg-amber-50 rounded mt-6"
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

      {/* <div className="flex gap-2 mt-2">
                     <button
                       className="px-3 py-1 rounded bg-[#30344c] text-white hover:bg-[#5b6496]"
                       onClick={() => {
                         showModal({
                           type: "editPost",
                           postId: post.id,
                           postText: post.text,
                           postCategory: post.category,
                         });
                       }}
                     >
                       Edit
                     </button>
                     <button
                       className="px-3 py-1 rounded bg-[#30344c] text-white hover:bg-[#5b6496]"
                       onClick={() => {
                         showModal({
                           type: "deletePost",
                           postId: post.id,
                         });
                       }}
                     >
                       Delete
                     </button>
                   </div>
                   {showModalData.type === "editPost" &&
                       showModalData.postId === post.id && (
                         <EditPostForm
                           postId={post.id}
                           postText={post.text}
                           postCategory={post.category}
                         />
                       )}
                   {showModalData.type === "deletePost" &&
                       showModalData.postId === post.id && (
                         <DeletePostForm postId={post.id} />
                       )}
                   {showModalData.type === "addComment" &&
                       showModalData.postId === post.id && (
                         <AddCommentForm postId={post.id} />
                       }} */}
    </li>
  );
};

export default Post;
