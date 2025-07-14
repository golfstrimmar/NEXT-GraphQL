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
import Select from "@/components/ui/Select/Select";
import Image from "next/image";

const Blog = () => {
  const { user, showModal } = useStateContext();
  const [currentPage, setCurrentPage] = useState(1);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [postsLoading, setPostsLoading] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [catToFilter, setCatToFilter] = useState<string>("");
  const [postToEdit, setPostToEdit] = useState<PostType>(null);
  const [sortOrder, setSortOrder] = useState("decr");
  const [searchTerm, setSearchTerm] = useState("");
  const [mathCount, setMathCount] = useState<number>(0);
  useUserPostSubscriptions(
    setCurrentPage,
    currentPage,
    setTotalCount,
    setPosts,
    setPostsLoading,
    catToFilter
  );
  const [openCommentsPostId, setOpenCommentsPostId] = useState<number | null>(
    null
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
      console.log("<==== posts data====>", data?.posts?.posts);
      console.log("<====totalCount data====>", data?.posts?.totalCount);
      setMathCount(data?.posts?.totalCount);
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
    if (postToEdit) {
      console.log("<==== postToEdit====>", postToEdit);
    }
  }, [postToEdit]);

  // ----------------------------
  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
  };

  const filteredAndSortedPosts = useMemo(() => {
    return [...posts]
      .filter((post) => {
        const matchesCategory = catToFilter
          ? post.category === catToFilter
          : true;
        const matchesSearch =
          post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.text.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        const dateA = new Date(Number(a.createdAt));
        const dateB = new Date(Number(b.createdAt));
        return sortOrder === "acr"
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
      });
  }, [posts, searchTerm, catToFilter, sortOrder]);

  // ----------------------------
  useEffect(() => {
    setMathCount(filteredAndSortedPosts.length);
  }, [filteredAndSortedPosts]);

  // useEffect(() => {
  //   if (totalCount) {
  //     console.log("<==== totalCount====>", totalCount);
  //   }
  // }, [totalCount]);
  // ----------------------------
  return (
    <section className="my-[80px] mx-auto blog w-full ">
      <div className="container">
        <h2 className="!text-3xl font-bold mb-4">📚 Blog</h2>

        <GetAllPostsQuery
          currentPage={currentPage}
          POSTS_PER_PAGE={POSTS_PER_PAGE}
          catToFilter={catToFilter}
          setPosts={setPosts}
          setPostsLoading={setPostsLoading}
          setTotalCount={setTotalCount}
        />

        <AddPostForm post={postToEdit} setPostToEdit={setPostToEdit} />
        {/* ====Categories======= */}
        <div className="mt-6">
          <h4 className="font-semibold">📂 Categories:</h4>
          {categories.length > 0 ? (
            <div className="flex items-center gap-2 my-2">
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
        {/* =======Sort======== */}
        <div className="mt-6">
          <h4 className="font-semibold">🔄 Sort by Date created :</h4>
          <Select
            selectItems={[
              { value: "acr", name: "Oldest to Newest" },
              { value: "decr", name: "Newest to Oldest" },
            ]}
            value={sortOrder}
            onChange={handleSortChange}
          />
        </div>
        <div className="mt-6 relative">
          <h4 className="font-semibold">🔍 Search posts:</h4>
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border p-2 rounded mb-4 w-full !bg-[#f8f4e3]"
          />
          <button
            onClick={() => {
              setSearchTerm("");
            }}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer"
          >
            <Image src="./svg/reset.svg" alt="clear" width={20} height={20} />
          </button>
        </div>
        {/* ===========Posts=========== */}
        <div className="mt-6">
          <h4 className="font-semibold ">📝 Posts({totalCount}):</h4>
          {postsLoading ? (
            <Loading />
          ) : filteredAndSortedPosts.length > 0 ? (
            <ul className="flex flex-col gap-4 mt-2">
              {filteredAndSortedPosts.map((post) => (
                <Post
                  key={post.id}
                  post={post}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  PostToEdit={setPostToEdit}
                  openCommentsPostId={openCommentsPostId}
                  setOpenCommentsPostId={setOpenCommentsPostId}
                />
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No posts found.</p>
          )}
        </div>
        {/* ========= PAGINATION ========= */}
        {filteredAndSortedPosts.length > 0 && (
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`p-1 rounded-full bg-slate-400  hover:bg-slate-600 transition-all duration-200  ${
                currentPage === 1
                  ? "opacity-20 cursor-not-allowed"
                  : "cursor-pointer "
              }`}
            >
              <Image
                src="./svg/chevron-left.svg"
                alt="prev"
                width={15}
                height={15}
                className="w-[15px] h-[15px]"
              />{" "}
            </button>
            <span className="">
              <strong>{currentPage}</strong> / <small>{mathCount}</small>
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => (prev < mathCount ? prev + 1 : prev))
              }
              disabled={currentPage >= mathCount}
              className={`p-1 rounded-full bg-slate-400  hover:bg-slate-600 transition-all duration-200  ${
                currentPage >= Math.ceil(totalCount / POSTS_PER_PAGE)
                  ? "opacity-20 cursor-not-allowed"
                  : "cursor-pointer "
              }`}
            >
              <Image
                src="./svg/chevron-right.svg"
                alt="prev"
                width={20}
                height={20}
                className="w-[15px] h-[15px]"
              />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Blog;
