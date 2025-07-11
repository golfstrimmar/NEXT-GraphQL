"use client";
import React, { FC, useEffect } from "react";
import useUserChatSubscriptions from "@/hooks/useUserChatSubscriptions";
import { PostType } from "@/types/post";
import transformData from "@/hooks/useTransformData";
import { useMutation } from "@apollo/client";
import { DELETE_POST } from "@/apolo/mutations";
import { useStateContext } from "@/components/StateProvider";

interface PostProps {
  post: PostType;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}
const Post: FC<PostProps> = ({ post, currentPage, setCurrentPage }) => {
  useUserChatSubscriptions(currentPage, setCurrentPage);
  const [deletePost, { loading: deleteLoading }] = useMutation(DELETE_POST);
  const { showModal } = useStateContext();
  // --------

  useEffect(() => {
    if (post) {
      console.log("<==== post====>", post);
    }
  }, [post]);
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

  return (
    <li className="card p-4 bg-white rounded shadow flex flex-col gap-2">
      <h3 className="font-semibold text-red-700">{post.id}</h3>
      <h4 className="font-semibold text-red-700">{post.category}</h4>
      <p className="text-black my-2">{post.text}</p>
      <small className="text-indigo-400">Autor: {post.creator.name}</small>
      <small className="text-gray-400 ">
        Created: {transformData(post.createdAt)}
      </small>
      <div className="flex gap-4  mt-2">
        <div className="text-amber-200">
          <button>👍</button> {post.likesCount}
        </div>
        <div className="text-amber-200">
          <button>👎</button> {post.dislikesCount}
        </div>
        <button
          onClick={() => {
            handlerPostDeleted(post.id);
          }}
          className="border-transparent rounded border hover:border-red-500 transition duration-300 ease-in-out cursor-pointer"
        >
          ❌
        </button>
      </div>
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
