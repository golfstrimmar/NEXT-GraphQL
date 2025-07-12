"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@apollo/client";
import { GET_ALL_CATEGORIES, GET_ALL_POSTS } from "@/apolo/queryes";
import AddPostForm from "@/components/AddPostForm/AddPostForm";
import Loading from "@/components/Loading";
import { useStateContext } from "@/components/StateProvider";
import useUserPostSubscriptions from "@/hooks/usePostsSubscription";
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
  const [catToFilter, setCatToFilter] = useState<string>("");

  useUserPostSubscriptions(
    setCurrentPage,
    currentPage,
    setTotalCount,
    setPosts,
    setPostsLoading,
    catToFilter
  );

  const { data: categoriesData } = useQuery(GET_ALL_CATEGORIES);

  const { data, loading, error } = useQuery(GET_ALL_POSTS, {
    variables: {
      skip: 0,
      take: 5,
      category: null,
    },
  });

  useEffect(() => {
    if (data) {
      console.log("<==== posts====>", data?.posts?.posts);
      console.log("<====totalCount====>", data?.posts?.totalCount);
      setPosts(data?.posts?.posts);
      setTotalCount(data?.posts?.totalCount);
    }
  }, [data]);

  // ----------------------------
  const categories = useMemo(() => {
    return categoriesData?.categories ?? [];
  }, [categoriesData]);
  // ----------------------------

  useEffect(() => {
    if (posts) {
      console.log("<==== posts====>", posts);
      setFilteredPosts(posts);
    }
  }, [posts]);

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
          {categories.length > 0 ? (
            <div className="flex items-center gap-2">
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
              <ul className="flex gap-2 flex-wrap ">
                {categories.map((cat, idx) => (
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
            </div>
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
              className="px-3 py-1 rounded bg-[#30344c] text-white hover:bg-[#5b6496] disabled:opacity-50 cursor-pointer"
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
              className="px-3 py-1 rounded bg-[#30344c] text-white hover:bg-[#5b6496] disabled:opacity-50 cursor-pointer"
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
