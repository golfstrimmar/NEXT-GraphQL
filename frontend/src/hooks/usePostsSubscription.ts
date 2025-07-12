import { useState, useEffect } from "react";
import { useSubscription } from "@apollo/client";
import {
  GET_ALL_POSTS,
  GET_ALL_CATEGORIES,
  GET_ALL_COMMENTS,
} from "@/apolo/queryes";
import {
  POST_CREATED_SUBSCRIPTION,
  POST_DELETED_SUBSCRIPTION,
  POST_LIKED_SUBSCRIPTION,
  POST_DISLIKED_SUBSCRIPTION,
  COMMENT_CREATED_SUBSCRIPTION,
  COMMENT_DELETED_SUBSCRIPTION,
} from "@/apolo/subscriptions";
import { useStateContext } from "@/components/StateProvider";
const POSTS_PER_PAGE = 5;

export default function useUserPostSubscriptions(
  setCurrentPage,
  currentPage,
  setTotalCount,
  setPosts,
  setPostsLoading,
  catToFilter
) {
  const { showModal } = useStateContext();

  useSubscription(POST_CREATED_SUBSCRIPTION, {
    onData: ({ client, data }) => {
      // исправляем: убираем лишний .data
      const newPost = data?.data?.postCreated;
      console.log("<===== 🟢 SUBSCRIPTION postCreated =======>", newPost);
      if (!newPost) return;

      if (currentPage !== 1) {
        setCurrentPage(1);
      }

      showModal(`✅ Post created successfully!`);
      client.refetchQueries({
        include: [GET_ALL_POSTS, GET_ALL_CATEGORIES],
      });
    },
  });

  useSubscription(POST_DELETED_SUBSCRIPTION, {
    onData: ({ client, data }) => {
      const deletedPostId = data?.data?.postDeleted;
      if (!deletedPostId) return;

      console.log("<===== 🟢 SUBSCRIPTION postDeleted =======>", deletedPostId);
      showModal("🗑️ Post deleted successfully.");

      // Обновляем totalCount и корректируем currentPage
      setTotalCount((prev) => {
        const newTotalCount = prev - 1;
        const totalPages = Math.ceil(newTotalCount / POSTS_PER_PAGE);

        // Если текущая страница превышает новое количество страниц, переходим на последнюю
        if (currentPage > totalPages && totalPages > 0) {
          setCurrentPage(totalPages);
        } else if (totalPages === 0) {
          setCurrentPage(1); // Сбрасываем на первую страницу, если постов нет
        }

        return newTotalCount;
      });

      // Повторный запрос GET_ALL_POSTS с обновленной страницей и фильтром по категории
      client.refetchQueries({
        include: [GET_ALL_POSTS, GET_ALL_CATEGORIES],
        variables: {
          page: currentPage,
          postsPerPage: POSTS_PER_PAGE,
          category: catToFilter || undefined, // Учитываем фильтр по категории
        },
      });
    },
  });

  useSubscription(POST_LIKED_SUBSCRIPTION, {
    onData: ({ client, data }) => {
      const postId = data?.data?.postLiked;
      if (!postId) return;

      console.log("<===== 🟢 SUBSCRIPTION postLiked =======>", postId);
      // showModal("👍 Post liked successfully.");

      client.cache.modify({
        id: client.cache.identify({ __typename: "Post", _id: updatedPost._id }),
        fields: {
          likesCount() {
            return updatedPost.likesCount;
          },
          // другие поля, если нужно
        },
      });
    },
  });

  useSubscription(POST_DISLIKED_SUBSCRIPTION, {
    onData: ({ client, data }) => {
      const postId = data?.data?.postDisliked;
      if (!postId) return;

      console.log("<===== 🟢 SUBSCRIPTION postDisliked =======>", postId);
      // showModal("👎 Post disliked successfully.");

      client.cache.modify({
        id: client.cache.identify({ __typename: "Post", _id: updatedPost._id }),
        fields: {
          dislikesCont() {
            return updatedPost.dislikesCount;
          },
        },
      });
    },
  });

  useSubscription(COMMENT_CREATED_SUBSCRIPTION, {
    onData: ({ client, data }) => {
      const newComment = data?.data?.commentAdded;
      if (!newComment) return;

      console.log("<===== 🟢 SUBSCRIPTION commentCreated =======>", newComment);
      showModal(`✅ Comment created successfully!`);
      client.refetchQueries({
        include: [GET_ALL_COMMENTS],
      });
    },
  });

  useSubscription(COMMENT_DELETED_SUBSCRIPTION, {
    onData: ({ client, data }) => {
      const deletedCommentId = data?.data?.commentDeleted;
      if (!deletedCommentId) return;

      console.log(
        "<===== 🟢 SUBSCRIPTION commentDeleted =======>",
        deletedCommentId
      );
      showModal("🗑️ Comment deleted successfully.");
      client.refetchQueries({
        include: [GET_ALL_COMMENTS],
      });
    },
  });
}
