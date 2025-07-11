import { useEffect } from "react";
import { useQuery } from "@apollo/client";
import { GET_ALL_POSTS } from "@/apolo/queryes";
import PostType from "@/types/post";

type PostsResponse = {
  posts: {
    posts: PostType[];
    totalCount: number;
  };
};

const GetAllPostsQuery = ({
  POSTS_PER_PAGE = 5,
  currentPage = 1,
  setPosts,
  setPostsLoading,
  setTotalCount,
  catToFilter,
}) => {
  const { data: postsData, loading: postsLoading } = useQuery<PostsResponse>(
    GET_ALL_POSTS,
    {
      variables: {
        skip: (currentPage - 1) * POSTS_PER_PAGE,
        take: POSTS_PER_PAGE,
        category: catToFilter,
      },
    }
  );

  useEffect(() => {
    setPosts(postsData?.posts?.posts || []);
    setTotalCount(postsData?.posts?.totalCount || 0);
  }, [postsData, setPosts, setTotalCount]);

  useEffect(() => {
    setPostsLoading(postsLoading);
  }, [postsLoading, setPostsLoading]);

  return null;
};

export default GetAllPostsQuery;
