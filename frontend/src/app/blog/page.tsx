import Blog from "@/components/Blog/Blog";
import { fetchPostsSSR } from "@/utils/fetchPostsSSR"; // твоя серверная функция
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | GraphQL App",
  description: "Browse latest posts from the blog",
};

export default async function BlogPage() {
  const initialPosts = await fetchPostsSSR(1, 5);

  return <Blog initialPosts={initialPosts} />;
}
