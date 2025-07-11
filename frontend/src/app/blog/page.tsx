"use client";
import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { GET_ALL_CATEGORIES } from "@/apolo/queryes";
import AddPostForm from "@/components/AddPostForm/AddPostForm";
import Loading from "@/components/Loading";
import { useStateContext } from "@/components/StateProvider";
import useUserChatSubscriptions from "@/hooks/useUserChatSubscriptions";
import GetAllPostsQuery from "@/components/GetAllPosts";
const POSTS_PER_PAGE = 5;
import PostType from "@/types/post";
import { button } from "framer-motion/m";
import "./Blog.scss";
import Post from "@/components/Post/Post";
const Blog = () => {
  const { user, showModal } = useStateContext();
  const [currentPage, setCurrentPage] = useState(1);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<PostType[]>([]);
  const [postsLoading, setPostsLoading] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);

  useUserChatSubscriptions(currentPage, setCurrentPage);

  const { data: categoriesData } = useQuery(GET_ALL_CATEGORIES);
  const [catToFilter, setCatToFilter] = useState<string>("");
  // ----------------------------
  useEffect(() => {
    if (categoriesData) {
      console.log("<==== data: categoriesData====>", categoriesData.categories);
    }
  }, [categoriesData]);
  // ----------------------------

  useEffect(() => {
    if (posts) {
      console.log("<==== posts====>", posts);
      setFilteredPosts(posts);
    }
  }, [posts]);
  // ----------------------------
  useEffect(() => {
    if (catToFilter) {
      const newPosts = [...posts];
      setFilteredPosts((prev) =>
        newPosts.filter((post) => post.category === catToFilter)
      );
    }
  }, [catToFilter]);
  // ----------------------------

  // ----------------------------
  return (
    <section className="my-[80px] mx-auto blog w-full ">
      <div className="container">
        <h2 className="text-2xl font-bold mb-4">📚 Blog</h2>
        {user && (
          <GetAllPostsQuery
            currentPage={currentPage}
            POSTS_PER_PAGE={POSTS_PER_PAGE}
            catToFilter={catToFilter}
            setPosts={setPosts}
            setPostsLoading={setPostsLoading}
            setTotalCount={setTotalCount}
          />
        )}
        <AddPostForm />
        <div className="my-4 blog">
          <h4 className="font-semibold">Categories:</h4>
          {categoriesData?.categories.length > 0 ? (
            <>
              <button
                onClick={() => {
                  setCatToFilter("");
                }}
                className={`text-blue-800 px-3 py-1 rounded cursor-pointer transition-colors duration-300 hover:bg-blue-200 ${
                  catToFilter === ""
                    ? "bg-blue-300 hover:bg-blue-300"
                    : "bg-blue-100"
                }`}
              >
                All
              </button>
              <ul className="flex gap-2 flex-wrap mt-2">
                {categoriesData?.categories?.map((cat, idx) => (
                  <li key={idx}>
                    <button
                      onClick={() => {
                        setCatToFilter(cat);
                      }}
                      className={`text-blue-800 px-3 py-1 rounded cursor-pointer transition-colors duration-300 hover:bg-blue-200  ${
                        cat === catToFilter
                          ? "bg-blue-300 hover:bg-blue-300"
                          : "bg-blue-100"
                      }`}
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-gray-600">No categories found.</p>
          )}
        </div>
        {/* ===========Posts=========== */}
        <h4 className="font-semibold">Posts({totalCount}):</h4>
        {postsLoading ? (
          <Loading />
        ) : filteredPosts.length > 0 ? (
          <ul className="flex flex-col gap-4 mt-6">
            {filteredPosts.map((post) => (
              <Post
                key={post.id}
                post={post}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
              />
              // <li key={post.id} className="card p-4 bg-white rounded shadow">
              //   <h4 className="font-semibold text-blue-600">{post.category}</h4>
              //   <p className="text-black my-2">{post.text}</p>
              //   <small className="text-gray-600">
              //     Autor: {post.creator.name}
              //   </small>
              //   <small className="text-gray-600">
              //     {new Date(post.createdAt).toLocaleString()}
              //   </small>
              //   emo
              //   <div className="flex gap-4  mt-2">
              //     <div className="text-amber-200">
              //       <button >👍</button> {post.likesCount}
              //     </div>
              //     <div className="text-amber-200">
              //       <button>👎</button> {post.dislikesCount}
              //     </div>
              //   </div>

              //   <button  onClick={() => {handlerPostDeleted(post.id) }}>❌</button>
              //   {/* <div className="flex gap-2 mt-2">
              //     <button
              //       className="px-3 py-1 rounded bg-[#30344c] text-white hover:bg-[#5b6496]"
              //       onClick={() => {
              //         showModal({
              //           type: "editPost",
              //           postId: post.id,
              //           postText: post.text,
              //           postCategory: post.category,
              //         });
              //       }}
              //     >
              //       Edit
              //     </button>
              //     <button
              //       className="px-3 py-1 rounded bg-[#30344c] text-white hover:bg-[#5b6496]"
              //       onClick={() => {
              //         showModal({
              //           type: "deletePost",
              //           postId: post.id,
              //         });
              //       }}
              //     >
              //       Delete
              //     </button>
              //   </div>
              //   {showModalData.type === "editPost" &&
              //       showModalData.postId === post.id && (
              //         <EditPostForm
              //           postId={post.id}
              //           postText={post.text}
              //           postCategory={post.category}
              //         />
              //       )}
              //   {showModalData.type === "deletePost" &&
              //       showModalData.postId === post.id && (
              //         <DeletePostForm postId={post.id} />
              //       )}
              //   {showModalData.type === "addComment" &&
              //       showModalData.postId === post.id && (
              //         <AddCommentForm postId={post.id} />
              //       }} */}
              // </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No posts found.</p>
        )}

        {/* ========= PAGINATION ========= */}
        {filteredPosts.length > 0 && (
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
