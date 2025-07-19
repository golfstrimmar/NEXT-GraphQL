import { client } from "@/apolo/apolloClient";
import { gql } from "@apollo/client";

const GET_ALL_POSTS = gql`
  query GetAllPosts(
    $skip: Int!
    $take: Int!
    $category: String
    $sortOrder: String
    $searchTerm: String
  ) {
    posts(
      skip: $skip
      take: $take
      category: $category
      sortOrder: $sortOrder
      searchTerm: $searchTerm
    ) {
      posts {
        id
        title
        text
        category
        createdAt
        creator {
          id
          name
          email
        }
        likesCount
        dislikesCount
        likes
        dislikes
      }
      totalCount
    }
  }
`;

export async function fetchPostsSSR({
  skip = 0,
  take = 5,
  category = null,
  sortOrder = "decr",
  searchTerm = "",
} = {}) {
  try {
    const { data } = await client.query({
      query: GET_ALL_POSTS,
      variables: { skip, take, category, sortOrder, searchTerm },
      fetchPolicy: "no-cache",
    });
    return data.posts || { posts: [], totalCount: 0 };
  } catch (error) {
    console.error("SSR fetchPostsSSR error:", error);
    return { posts: [], totalCount: 0 };
  }
}
