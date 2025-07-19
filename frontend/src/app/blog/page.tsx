import { fetchPostsSSR } from "@/utils/fetchPostsSSR";
import Blog from "@/components/Blog/Blog";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | GraphQL App",
  description: "Browse latest posts from the blog",
};

export default async function BlogPage() {
  const { posts, totalCount, categories } = await fetchPostsSSR();

  return (
    <Blog
      initialPosts={posts}
      initialCategories={categories}
      initialTotalCount={totalCount}
    />
  );
}
