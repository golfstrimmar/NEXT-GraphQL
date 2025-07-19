// utils/fetchPostsSSR.ts
import { client } from "@/apolo/apolloClient";
import { GET_ALL_CATEGORIES, GET_ALL_POSTS } from "@/apolo/queryes";

export async function fetchPostsSSR() {
  let postsData = { posts: [], totalCount: 0 };
  let categoriesData = [];

  try {
    const { data } = await client.query({
      query: GET_ALL_POSTS,
      variables: {
        skip: 0,
        take: 5,
        category: null,
        sortOrder: "decr",
        searchTerm: "",
      },
      fetchPolicy: "no-cache",
    });
    postsData = data.posts;
  } catch (error) {
    console.error("Error fetching posts:", error);
  }

  try {
    const { data } = await client.query({
      query: GET_ALL_CATEGORIES,
      fetchPolicy: "no-cache",
    });
    categoriesData = data.categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
  }

  return {
    posts: postsData.posts || [],
    totalCount: postsData.totalCount || 0,
    categories: categoriesData || [],
  };
}
