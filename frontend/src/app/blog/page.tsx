"use client";
import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { GET_ALL_POSTS, GET_ALL_CATEGORIES } from "@/apolo/queryes";
import AddPostForm from "@/components/AddPostForm/AddPostForm";
import Loading from "@/components/Loading";
import { useStateContext } from "@/components/StateProvider";
import useUserChatSubscriptions from "@/hooks/useUserChatSubscriptions";
const POSTS_PER_PAGE = 5;

const Blog = () => {
  const { user, showModal } = useStateContext();
  const [currentPage, setCurrentPage] = useState(1);
  useUserChatSubscriptions(currentPage, setCurrentPage);
  const { data: postsData, loading: postsLoading } = useQuery(GET_ALL_POSTS, {
    variables: {
      skip: (currentPage - 1) * POSTS_PER_PAGE,
      take: POSTS_PER_PAGE,
    },
  });

  const { data: categoriesData } = useQuery(GET_ALL_CATEGORIES);

  const posts = postsData?.posts?.posts || [];
  const totalCount = postsData?.posts?.totalCount || 0;

  useEffect(() => {
    if (posts) {
      console.log("<==== posts====>", posts);
    }
  }, [posts]);
  // ----------------------------

  // ----------------------------

  // ----------------------------
  return (
    <section className="my-[80px] mx-auto blog w-full">
      <div className="container">
        <h2 className="text-2xl font-bold mb-4">📚 Blog</h2>

        <AddPostForm />

        <div className="my-4">
          <h4 className="font-semibold">Categories:</h4>
          <ul className="flex gap-2 flex-wrap mt-2">
            {categoriesData?.categories?.map((cat, idx) => (
              <li
                key={idx}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded"
              >
                {cat}
              </li>
            ))}
          </ul>
        </div>

        {postsLoading ? (
          <Loading />
        ) : (
          <ul className="flex flex-col gap-4 mt-6">
            {posts.map((post) => (
              <li key={post.id} className="card p-4 bg-white rounded shadow">
                <h4 className="font-semibold text-blue-600">{post.category}</h4>
                <p className="text-black my-2">{post.text}</p>
                <small className="text-gray-600">
                  Автор: {post.creator.name}
                </small>
              </li>
            ))}
          </ul>
        )}

        {posts.length > 0 && (
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded bg-[#30344c] text-white hover:bg-[#5b6496] disabled:opacity-50"
            >
              ← Prev
            </button>
            <span>
              Page {currentPage} of {Math.ceil(totalCount / POSTS_PER_PAGE)}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) =>
                  prev < Math.ceil(totalCount / POSTS_PER_PAGE)
                    ? prev + 1
                    : prev
                )
              }
              disabled={currentPage >= Math.ceil(totalCount / POSTS_PER_PAGE)}
              className="px-3 py-1 rounded bg-[#30344c] text-white hover:bg-[#5b6496] disabled:opacity-50"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Blog;

// "use client";
// import React, { useState, useEffect, useRef } from "react";
// import "./Blog.scss";
// import { useQuery, useMutation } from "@apollo/client";
// import { GET_ALL_POSTS } from "@/apolo/queryes";
// import {
//   ADD_POST,
//   // TOGGLE_LIKE,
//   // CREATE_COMMENT,
//   // DELETE_POST,
//   // DELETE_POST_COMMENT,
//   // TOGGLE_COMMENT_REACTION,
// } from "@/apolo/mutations";
// import useUserChatSubscriptions from "@/hooks/useUserChatSubscriptions";
// import { useStateContext } from "@/components/StateProvider";
// import Input from "@/components/ui/Input/Input";
// import Button from "@/components/ui/Button/Button";
// import Loading from "@/components/Loading";
// import Image from "next/image";
// import transformData from "@/hooks/useTransformData";
// import AddPostForm from "@/components/AddPostForm/AddPostForm";
// import { motion, AnimatePresence } from "framer-motion";

// import { PostType } from "@/types/post";

// const Blog = () => {
//   const { user, showModal } = useStateContext();

//   const POSTS_PER_PAGE = 5;
//   const [currentPage, setCurrentPage] = useState(1);

//   // useUserChatSubscriptions(currentPage, setCurrentPage);
//   // const { data, loading, error } = useQuery(GET_ALL_POSTS, {
//   //   variables: {
//   //     skip: (currentPage - 1) * POSTS_PER_PAGE,
//   //     take: POSTS_PER_PAGE,
//   //   },
//   // });
//   // --------------------------------------
//   // const [deletePost] = useMutation(DELETE_POST, {
//   //   refetchQueries: [{ query: GET_ALL_POSTS }],
//   // });
//   // const [toggleLike] = useMutation(TOGGLE_LIKE);

//   // const [createComment] = useMutation(CREATE_COMMENT, {
//   //   refetchQueries: [{ query: GET_ALL_POSTS }],
//   // });
//   // const [toggleCommentReaction] = useMutation(TOGGLE_COMMENT_REACTION);
//   // const [deleteComment] = useMutation(DELETE_POST_COMMENT, {
//   //   refetchQueries: [{ query: GET_ALL_POSTS }],
//   // });
//   // --------------------------------------
//   // const [commentTexts, setCommentTexts] = useState<{
//   //   [postId: string]: string;
//   // }>({});

//   // const [openCommentsMenus, setOpenCommentsMenus] = useState<{
//   //   [postId: string]: boolean;
//   // }>({});

//   // const [openLikeMenus, setOpenLikeMenus] = useState<{
//   //   [postId: string]: boolean;
//   // }>({});
//   // const [openDislikeMenus, setOpenDislikeMenus] = useState<{
//   //   [postId: string]: boolean;
//   // }>({});
//   // -------------------------

//   // -------------------------

//   // useEffect(() => {
//   //   if (data?.posts) {
//   //     console.log("<==== posts on blog page====>", data?.posts);
//   //   }
//   // }, [data?.posts]);

//   // const handleDelitePost = async (id: number) => {
//   //   if (!user) return showModal("Login to delit post.");
//   //   try {
//   //     await deletePost({
//   //       variables: {
//   //         id,
//   //       },
//   //     });
//   //     showModal("Post deleted successfully.");
//   //   } catch (err) {
//   //     console.error("Error reacting to post:", err);
//   //   }
//   // };

//   // const handleReaction = async (
//   //   postId: string,
//   //   reaction: "LIKE" | "DISLIKE"
//   // ) => {
//   //   if (!user) return showModal("Login to react to posts.");
//   //   try {
//   //     await toggleLike({
//   //       variables: {
//   //         postId,
//   //         reaction,
//   //       },
//   //     });
//   //   } catch (err) {
//   //     console.error("Error reacting to post:", err);
//   //   }
//   // };
//   // const handleAddComment = async (postId: string) => {
//   //   if (!user) {
//   //     showModal("Login to comment.");
//   //     return;
//   //   }
//   //   const commentText = commentTexts[postId]?.trim();
//   //   if (!commentText) {
//   //     showModal("Comment cannot be empty.");
//   //     return;
//   //   }

//   //   try {
//   //     await createComment({
//   //       variables: { postId: Number(postId), text: commentText },
//   //     });
//   //     // Очистить поле после отправки
//   //     setCommentTexts((prev) => ({ ...prev, [postId]: "" }));
//   //   } catch (err) {
//   //     console.error("Error adding comment:", err);
//   //     showModal("Error adding comment.");
//   //   }
//   // };
//   // ---------------------------
//   // const setCommentsMenus = (postId: string) => {
//   //   setOpenCommentsMenus((prev) => {
//   //     const isOpen = prev[postId];
//   //     return isOpen ? {} : { [postId]: true };
//   //   });
//   // };
//   // const toggleLikeMenu = (postId: string) => {
//   //   setOpenLikeMenus((prev) => {
//   //     const isOpen = prev[postId];
//   //     return {
//   //       [postId]: !isOpen,
//   //     };
//   //   });
//   //   setOpenDislikeMenus({});
//   // };

//   // const toggleDislikeMenu = (postId: string) => {
//   //   setOpenDislikeMenus((prev) => {
//   //     const isOpen = prev[postId];
//   //     return {
//   //       [postId]: !isOpen,
//   //     };
//   //   });
//   //   setOpenLikeMenus({});
//   // };
//   // const handleDeletePostComment = async (postId, commentId) => {
//   //   if (!user) return showModal("Login to delit comment.");
//   //   console.log("<===== postId, commentId====>", postId, commentId);
//   //   try {
//   //     await deleteComment({
//   //       variables: {
//   //         postId: Number(postId),
//   //         commentId: Number(commentId),
//   //       },
//   //     });
//   //     showModal("Comment deleted successfully.");
//   //   } catch (err) {
//   //     console.error("Error deleting comment:", err);
//   //   }
//   // };
//   // const handleCommentReaction = async (
//   //   commentId: string,
//   //   reaction: "LIKE" | "DISLIKE"
//   // ) => {
//   //   if (!user) return showModal("Login to react to comment.");
//   //   try {
//   //     await toggleCommentReaction({
//   //       variables: {
//   //         commentId: Number(commentId),
//   //         reaction,
//   //       },
//   //     });
//   //   } catch (err) {
//   //     console.error("Error reacting to comment:", err);
//   //     showModal("Error reacting to comment.");
//   //   }
//   // };

//   // useEffect(() => {
//   //   const handleClickOutside = (e: MouseEvent) => {
//   //     if (!(e.target instanceof Node)) return;
//   //     if (!e.target.closest(".wertung")) {
//   //       setOpenLikeMenus({});
//   //       setOpenDislikeMenus({});
//   //     }
//   //     if (
//   //       !(e.target as HTMLElement).closest(".comments") &&
//   //       !(e.target as HTMLElement).closest(".comment-toggle")
//   //     ) {
//   //       setOpenCommentsMenus({});
//   //     }
//   //   };
//   //   document.addEventListener("click", handleClickOutside);
//   //   return () => document.removeEventListener("click", handleClickOutside);
//   // }, []);

//   return (
//     <section className="my-[80px] mx-auto blog w-full">
//       <div className="container ">
//         <h2 className="text-2xl font-bold mb-4">Blog</h2>
//         {/* <ul className="flex flex-col gap-4">
//           {loading ? (
//             <Loading />
//           ) : (
//             data?.posts.posts.map((post) => (
//               <li key={post.id} className="card">
//                 <h4 className="font-semibold">{post.category}</h4>
//                 <p className="bg-white my-4 p-2 rounded text-black">
//                   {post.text}
//                 </p>
//                 <small className="text-white">
//                   Author: {post.creator.name}
//                 </small>
//                 <div className="flex  items-center mt-4 w-full">

//                   <button
//                     // onClick={() => setCommentsMenus(post.id)}
//                     className="comment-toggle cursor-pointer"
//                   >
//                     <Image
//                       src="/svg/comment.svg"
//                       alt="comment"
//                       width={20}
//                       height={20}
//                     />
//                   </button>

//                   <button
//                     // onClick={() => handleReaction(post.id, "LIKE")}
//                     className="flex items-center gap-2 cursor-pointer ml-4"
//                   >
//                     <Image
//                       src="/svg/like.svg"
//                       alt="like"
//                       width={20}
//                       height={20}
//                       className={
//                         post.currentUserReaction === "LIKE"
//                           ? "opacity-100"
//                           : "opacity-40"
//                       }
//                     />
//                   </button>
//                   <div className="relative ml-1 wertung">
//                     <button
//                       className="text-sm ml-1 px-1  text-grey bg-blue-300 rounded flex items-center gap-2 cursor-pointer"
//                       onClick={() => {
//                         // toggleLikeMenu(post.id);
//                       }}
//                     >
//                       {post.likes.length}

//                       <Image
//                         src="/svg/click.svg"
//                         alt="like"
//                         width={15}
//                         height={15}
//                         className={
//                           post.currentUserReaction === "LIKE"
//                             ? "opacity-100"
//                             : "opacity-40"
//                         }
//                       />
//                     </button>
//                     <AnimatePresence>
//                       {Array.isArray(post.likes) &&
//                         post.likes.length > 0 &&
//                         openLikeMenus[post.id] && (
//                           <motion.div
//                             initial={{ height: 0, opacity: 0, y: 0 }}
//                             animate={{ height: "auto", opacity: 1, y: 0 }}
//                             exit={{ height: 0, opacity: 0, y: 0 }}
//                             transition={{ duration: 0.2, ease: "easeInOut" }}
//                             className="absolute top-full bg-white border border-gray-200 rounded-b-md shadow-md z-10 w-fit min-w-[150px] max-w-full"
//                           >
//                             <ul className="p-3 space-y-2">
//                               {post?.likes.map((detail, index) => (
//                                 <li
//                                   key={index}
//                                   className="text-sm ml-1   flex justify-between"
//                                 >
//                                   {detail}
//                                 </li>
//                               ))}
//                             </ul>
//                           </motion.div>
//                         )}
//                     </AnimatePresence>
//                   </div>

//                   <button
//                     // onClick={() => handleReaction(post.id, "DISLIKE")}
//                     className="flex items-center gap-2 cursor-pointer ml-4 rotate-180"
//                   >
//                     <Image
//                       src="/svg/like.svg"
//                       alt="like"
//                       width={20}
//                       height={20}
//                       className={
//                         post.currentUserReaction === "DISLIKE"
//                           ? "opacity-100"
//                           : "opacity-40"
//                       }
//                     />
//                   </button>
//                   <div className="relative ml-1 wertung">
//                     <button
//                       className="text-sm ml-1 px-1  text-grey bg-blue-300 rounded flex items-center gap-2 cursor-pointer "
//                       onClick={() => {
//                         // toggleDislikeMenu(post.id);
//                       }}
//                     >
//                       {post.dislikes.length}

//                       <Image
//                         src="/svg/click.svg"
//                         alt="like"
//                         width={15}
//                         height={15}
//                         className={
//                           post.currentUserReaction === "DISLIKE"
//                             ? "opacity-100"
//                             : "opacity-40"
//                         }
//                       />
//                     </button>
//                     <AnimatePresence>
//                       {Array.isArray(post.dislikes) &&
//                         post.dislikes.length > 0 &&
//                         openDislikeMenus[post.id] && (
//                           <motion.div
//                             initial={{ height: 0, opacity: 0, y: 0 }}
//                             animate={{ height: "auto", opacity: 1, y: 0 }}
//                             exit={{ height: 0, opacity: 0, y: 0 }}
//                             transition={{ duration: 0.2, ease: "easeInOut" }}
//                             className="absolute top-full bg-white border border-gray-200 rounded-b-md shadow-md z-10 w-fit min-w-[150px] max-w-full"
//                           >
//                             <ul className="p-3 space-y-2">
//                               {post?.dislikes.map((detail, index) => (
//                                 <li
//                                   key={index}
//                                   className="text-sm ml-1   flex justify-between"
//                                 >
//                                   {detail}
//                                 </li>
//                               ))}
//                             </ul>
//                           </motion.div>
//                         )}
//                     </AnimatePresence>
//                   </div>

//                   {post?.creator.id === user?.id && (
//                     <button
//                       onClick={() => {
//                         handleDelitePost(post.id);
//                       }}
//                       className="ml-auto p-1 rounded-lg border hover:border-red-800 transition-all duration-300 cursor-pointer"
//                     >
//                       <Image
//                         src="/svg/cross.svg"
//                         alt="delete"
//                         width={12}
//                         height={12}
//                       />
//                     </button>
//                   )}
//                 </div>

//                 <AnimatePresence>
//                   {openCommentsMenus[post.id] && (
//                     <motion.div
//                       initial={{ height: 0, opacity: 0, y: 0 }}
//                       animate={{ height: "auto", opacity: 1, y: 0 }}
//                       exit={{ height: 0, opacity: 0, y: 0 }}
//                       transition={{ duration: 0.3, ease: "easeInOut" }}
//                       className="mt-2  bg-white border border-gray-200 rounded-md shadow-md  w-full "
//                     >
//                       <div className="comments  p-2 bg-blue-100 ">
//                         <h5 className="font-semibold mb-2 text-black">
//                           Comments:
//                         </h5>
//                         <ul className="p-3 space-y-2">
//                           {post.comments.length === 0 && (
//                             <p className="inline-block text-sm text-gray-600 px-2 rounded">
//                               No comments yet.
//                             </p>
//                           )}

//                           {post.comments.map((comment, index) => (
//                             <li
//                               key={index}
//                               className="mb-2 border-b border-gray-300 pb-2 "
//                             >
//                               <div className="text-black bg-white rounded px-2">
//                                 {comment.text}
//                               </div>
//                               <div className="text-[12px] flex items-center mt-2 gap-2">
//                                 <small>👤 {comment.user.name}</small>
//                                 <small className="ml-2">
//                                   🕒 {transformData(comment.createdAt)}
//                                 </small>
//                                 <button
//                                   onClick={() =>
//                                     handleCommentReaction(comment.id, "LIKE")
//                                   }
//                                   className="flex items-center gap-1 cursor-pointer px-1 rounded bg-green-100 hover:bg-green-200 text-sm"
//                                 >
//                                   👍 {comment.likesCount}
//                                 </button>

//                                 <button
//                                   onClick={() =>
//                                     handleCommentReaction(comment.id, "DISLIKE")
//                                   }
//                                   className="flex items-center gap-1 cursor-pointer px-1 rounded bg-red-100 hover:bg-red-200 text-sm"
//                                 >
//                                   👎 {comment.dislikesCount}
//                                 </button>
//                                 {comment.user.id === user?.id && (
//                                   <button
//                                     type="button"
//                                     onClick={() => {
//                                       handleDeletePostComment(
//                                         post.id,
//                                         comment.id
//                                       );
//                                     }}
//                                     className="ml-auto p-1 rounded-lg  cursor-pointer"
//                                   >
//                                     <Image
//                                       src="/svg/cross.svg"
//                                       alt="send"
//                                       width={12}
//                                       height={12}
//                                     />
//                                   </button>
//                                 )}
//                               </div>
//                             </li>
//                           ))}
//                         </ul>
//                         {user ? (
//                           <form
//                             onSubmit={(e) => {
//                               e.preventDefault();
//                               handleAddComment(post.id);
//                             }}
//                             className="mt-2 flex gap-2 relative py-1 "
//                           >
//                             <input
//                               type="text"
//                               placeholder="Write a comment..."
//                               value={commentTexts[post.id] || ""}
//                               onChange={(e) =>
//                                 setCommentTexts((prev) => ({
//                                   ...prev,
//                                   [post.id]: e.target.value,
//                                 }))
//                               }
//                               className="flex-grow p-1 rounded border border-gray-400 bg-white text-[14px]"
//                             />
//                             <button
//                               type="submit"
//                               className="cursor-pointer absolute right-2 top-1/2 transform -translate-y-1/2 z-10 p-1 border hover:border-blue-500 rounded-md transition-all duration-200"
//                             >
//                               <Image
//                                 src="/svg/envelope.svg"
//                                 alt="send"
//                                 width={15}
//                                 height={15}
//                               />
//                             </button>
//                           </form>
//                         ) : (
//                           <p className="text-sm text-gray-600 mt-2">
//                             Login to add a comment
//                           </p>
//                         )}{" "}
//                       </div>
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </li>
//             ))
//           )}
//         </ul>
//         {data && data.posts.posts && (
//           <div className="flex justify-center items-center gap-4 mt-6 ">
//             <button
//               onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//               disabled={currentPage === 1}
//               className="
//     px-3 py-1 rounded text-white cursor-pointer
//     bg-[#30344c]
//     hover:bg-[#5b6496]
//     disabled:bg-gray-700
//     disabled:cursor-not-allowed
//     disabled:opacity-50
//     transition-colors duration-200
//     focus:outline-none focus:ring-2 focus:ring-blue-400
//   "
//             >
//               ← Prev
//             </button>
//             <span>
//               Page {currentPage} of{" "}
//               {Math.ceil(data.posts.totalCount / POSTS_PER_PAGE)}
//             </span>
//             <button
//               onClick={() =>
//                 setCurrentPage((prev) =>
//                   prev < Math.ceil(data.posts.totalCount / POSTS_PER_PAGE)
//                     ? prev + 1
//                     : prev
//                 )
//               }
//               disabled={
//                 currentPage >= Math.ceil(data.posts.totalCount / POSTS_PER_PAGE)
//               }
//               className="
//     px-3 py-1 rounded text-white cursor-pointer
//     bg-[#30344c]
//     hover:bg-[#5b6496]
//     disabled:bg-gray-700
//     disabled:cursor-not-allowed
//     disabled:opacity-50
//     transition-colors duration-200
//     focus:outline-none focus:ring-2 focus:ring-blue-400
//   "
//             >
//               Next →
//             </button>
//           </div>
//         )}
//         <AddPostForm /> */}
//       </div>
//     </section>
//   );
// };

// export default Blog;
