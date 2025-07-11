import { useState, useEffect } from "react";
import { useSubscription } from "@apollo/client";
import { GET_ALL_POSTS, GET_ALL_CATEGORIES } from "@/apolo/queryes";
import {
  POST_CREATED_SUBSCRIPTION,
  POST_DELETED_SUBSCRIPTION,
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
        include: [GET_ALL_POSTS],
      });
    },
  });

  useSubscription(POST_DELETED_SUBSCRIPTION, {
    onData: ({ client, data }) => {
      const deletedPostId = data?.data?.postDeleted;
      if (!deletedPostId) return;

      console.log("<===== 🟢 SUBSCRIPTION postDeleted =======>", deletedPostId);
      showModal("🗑️ Пост успешно удален.");

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
        include: [GET_ALL_POSTS],
        variables: {
          page: currentPage,
          postsPerPage: POSTS_PER_PAGE,
          category: catToFilter || undefined, // Учитываем фильтр по категории
        },
      });
    },
  });
}
