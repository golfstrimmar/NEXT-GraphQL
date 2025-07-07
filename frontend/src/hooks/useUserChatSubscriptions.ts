import { useSubscription } from "@apollo/client";
import { gql } from "@apollo/client";
import { GET_USERS, GET_USER_CHATS, GET_ALL_POSTS } from "@/apolo/queryes";
import {
  USER_CREATED_SUBSCRIPTION,
  USER_DELETED_SUBSCRIPTION,
  USER_LOGIN_SUBSCRIPTION,
  USER_LOGGEDOUT_SUBSCRIPTION,
  CHAT_CREATED_SUBSCRIPTION,
  CHAT_DELETED_SUBSCRIPTION,
  MESSAGE_SENT_SUBSCRIPTION,
  // POST_CREATED_SUBSCRIPTION,
  // REACTION_CHANGED_SUBSCRIPTION,
  // COMMENT_CREATED_SUBSCRIPTION,
  // POST_DELETED_SUBSCRIPTION,
  // POST_COMMENT_DELETED_SUBSCRIPTION,
  // COMMENT_REACTION_CHANGED_SUBSCRIPTION,
} from "@/apolo/subscriptions";

import { useStateContext } from "@/components/StateProvider";

const POSTS_PER_PAGE = 5;

export default function useUserChatSubscriptions() {
  // currentPage: number | null = null,
  // setCurrentPage: ((page: number) => void) | null = null
  const { user, setUser } = useStateContext();

  // Пользователи: добавление
  useSubscription(USER_CREATED_SUBSCRIPTION, {
    onData: ({ client, data }) => {
      const newUser = data?.data?.userCreated;
      if (!newUser) return;
      client.cache.updateQuery({ query: GET_USERS }, (oldData) => {
        if (!oldData) return { users: [newUser] };
        const exists = oldData.users.some((u: any) => u.id === newUser.id);
        if (exists) return oldData;
        return {
          users: [...oldData.users, newUser],
        };
      });
    },
  });

  // Пользователь вошел в систему
  useSubscription(USER_LOGIN_SUBSCRIPTION, {
    onData: ({ client, data }) => {
      const loggedInUser = data?.data?.userLogin;
      if (!loggedInUser) return;
      client.cache.updateQuery({ query: GET_USERS }, (oldData) => {
        if (!oldData) return null;
        return {
          users: oldData.users.map((u: any) =>
            u.id === loggedInUser.id ? { ...u, isLoggedIn: true } : u
          ),
        };
      });
    },
  });

  // Пользователь вышел из системы
  useSubscription(USER_LOGGEDOUT_SUBSCRIPTION, {
    onData: ({ client, data }) => {
      const userLoggedOut = data?.data?.userLoggedOut;
      if (!userLoggedOut) return;
      if (userLoggedOut?.id === user?.id) {
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      client.cache.updateQuery({ query: GET_USERS }, (oldData) => {
        if (!oldData) return null;
        return {
          users: oldData.users.map((u: any) =>
            u.id === userLoggedOut.id ? { ...u, isLoggedIn: false } : u
          ),
        };
      });
    },
  });

  // Пользователь удалён
  useSubscription(USER_DELETED_SUBSCRIPTION, {
    onData: ({ client, data }) => {
      const deletedUserId = data?.data?.userDeleted?.id;
      if (!deletedUserId) return;

      // Если текущий пользователь — удаленный, логаутим
      const currentUserLoggedIn = localStorage.getItem("user");
      if (currentUserLoggedIn) {
        const currentUser = JSON.parse(currentUserLoggedIn);
        if (currentUser.id === deletedUserId) {
          setUser(null);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }

      // Принудительно сбросить кеш
      // client.resetStore();

      // Или можно вручную обновить кеш через refetch нужных запросов
      client.refetchQueries({
        include: [GET_USERS],
      });
    },
  });

  useSubscription(CHAT_CREATED_SUBSCRIPTION, {
    onData: ({ client, data }) => {
      const newChat = data?.data?.chatCreated;
      if (!newChat) return;
      client.cache.updateQuery({ query: GET_USER_CHATS }, (oldData) => {
        if (!oldData || !oldData.chats) return { chats: [newChat] };
        const exists = oldData.chats.some((c: any) => c.id === newChat.id);
        if (exists) return oldData;
        return {
          chats: [newChat, ...oldData.chats],
        };
      });
    },
  });

  useSubscription(CHAT_DELETED_SUBSCRIPTION, {
    onData: ({ client, data }) => {
      const deletedChatId = data?.data?.chatDeleted;
      if (!deletedChatId) return;
      client.cache.updateQuery({ query: GET_ALL_CHATS }, (oldData) => {
        if (!oldData) return { chats: [] };
        return {
          chats: oldData.chats.filter(
            (chat: any) => Number(chat.id) !== Number(deletedChatId)
          ),
        };
      });
    },
  });

  useSubscription(MESSAGE_SENT_SUBSCRIPTION, {
    onData: ({ client, data }) => {
      const newMessage = data?.data?.messageSent;
      if (!newMessage) return;
      const chatId = newMessage.chat?.id;
      const chatCacheId = client.cache.identify({
        __typename: "Chat",
        id: String(chatId),
      });
      if (!chatCacheId) return;
      client.cache.modify({
        id: chatCacheId,
        fields: {
          messages(existingMessages = [], { readField, toReference }) {
            // Проверяем, есть ли сообщение с таким id в кеше
            if (
              existingMessages.some(
                (ref) => readField("id", ref) === newMessage.id
              )
            ) {
              return existingMessages; // если есть — возвращаем как есть
            }

            // Создаем ссылку на новое сообщение в кеше
            const newMessageRef = toReference({
              __typename: "Message",
              id: newMessage.id,
            });

            // Добавляем ссылку в список сообщений
            return [...existingMessages, newMessageRef];
          },
        },
      });
    },
  });

  // // --- Пост создан — добавляем в кэш первой страницы и переключаемся на первую страницу ---
  // useSubscription(POST_CREATED_SUBSCRIPTION, {
  //   onData: ({ client, data }) => {
  //     const newPost = data?.data?.postCreated;
  //     if (!newPost) return;

  //     // Переключаемся на первую страницу (если еще не там)
  //     if (currentPage !== 1) {
  //       setCurrentPage(1);
  //     }

  //     // Обновляем кэш — вставляем новый пост в первую страницу (skip=0, take=POSTS_PER_PAGE)
  //     client.cache.updateQuery(
  //       {
  //         query: GET_ALL_POSTS,
  //         variables: { skip: 0, take: POSTS_PER_PAGE },
  //       },
  //       (oldData) => {
  //         if (!oldData || !oldData.posts || !oldData.posts.posts) {
  //           return { posts: { posts: [newPost], totalCount: 1 } };
  //         }

  //         const exists = oldData.posts.posts.some(
  //           (p: any) => p.id === newPost.id
  //         );
  //         if (exists) return oldData;

  //         return {
  //           posts: {
  //             posts: [newPost, ...oldData.posts.posts].slice(0, POSTS_PER_PAGE),
  //             totalCount: oldData.posts.totalCount + 1,
  //           },
  //         };
  //       }
  //     );
  //   },
  // });

  // // --- Пост удалён — очищаем кэш текущей страницы, обновляем totalCount и сбрасываем пагинацию на первую страницу ---
  // useSubscription(POST_DELETED_SUBSCRIPTION, {
  //   onData: ({ client, data }) => {
  //     const deletedPostId = data?.data?.postDeleted;
  //     if (!deletedPostId) return;

  //     // Сбрасываем страницу на первую
  //     if (currentPage !== 1) {
  //       setCurrentPage(1);
  //     }

  //     // Очищаем кэш текущей страницы
  //     client.cache.evict({
  //       fieldName: "posts",
  //       args: {
  //         skip: (currentPage - 1) * POSTS_PER_PAGE,
  //         take: POSTS_PER_PAGE,
  //       },
  //     });

  //     // Обновляем кэш первой страницы и totalCount
  //     client.cache.updateQuery(
  //       {
  //         query: GET_ALL_POSTS,
  //         variables: { skip: 0, take: POSTS_PER_PAGE },
  //       },
  //       (oldData) => {
  //         if (!oldData || !oldData.posts || !oldData.posts.posts) {
  //           return { posts: { posts: [], totalCount: 0 } };
  //         }

  //         const updatedPosts = oldData.posts.posts.filter(
  //           (post: any) => post.id !== deletedPostId
  //         );

  //         // Устанавливаем totalCount на основе оставшихся постов или уменьшаем, но не ниже 0
  //         const newTotalCount = Math.max(0, oldData.posts.totalCount - 1);

  //         return {
  //           posts: {
  //             posts: updatedPosts,
  //             totalCount: newTotalCount,
  //           },
  //         };
  //       }
  //     );

  //     client.cache.gc();
  //   },
  // });

  // // Реакция на пост (лайк, дизлайк)
  // useSubscription(REACTION_CHANGED_SUBSCRIPTION, {
  //   onData: ({ client, data }) => {
  //     const reacted = data?.data?.reactionChanged;
  //     if (!reacted) return;
  //     client.cache.modify({
  //       id: client.cache.identify({ __typename: "Post", id: reacted.postId }),
  //       fields: {
  //         likes() {
  //           return reacted.likes;
  //         },
  //         dislikes() {
  //           return reacted.dislikes;
  //         },
  //         currentUserReaction() {
  //           return reacted.currentUserReaction;
  //         },
  //       },
  //     });
  //   },
  // });

  // // Комментарий создан
  // useSubscription(COMMENT_CREATED_SUBSCRIPTION, {
  //   onData: ({ client, data }) => {
  //     const newComment = data?.data?.commentCreated;
  //     if (!newComment || !newComment.post?.id) {
  //       console.warn(
  //         "<===== 🚨 COMMENT_CREATED_SUBSCRIPTION: Invalid comment data =====>",
  //         newComment
  //       );
  //       return;
  //     }
  //     console.log(
  //       "<===== 📝 Subscribed to COMMENT_CREATED: =====>",
  //       newComment
  //     );

  //     // Обновляем кэш для текущей страницы
  //     client.cache.updateQuery(
  //       {
  //         query: GET_ALL_POSTS,
  //         variables: {
  //           skip: (currentPage - 1) * POSTS_PER_PAGE,
  //           take: POSTS_PER_PAGE,
  //         },
  //       },
  //       (oldData) => {
  //         if (!oldData || !oldData.posts || !oldData.posts.posts) {
  //           console.warn(
  //             "<===== 🚨 COMMENT_CREATED_SUBSCRIPTION: No posts in cache =====>",
  //             oldData
  //           );
  //           return { posts: { posts: [], totalCount: 0 } };
  //         }

  //         const updatedPosts = oldData.posts.posts.map((post: any) =>
  //           post.id === newComment.post.id
  //             ? {
  //                 ...post,
  //                 comments: [
  //                   ...(post.comments || []),
  //                   {
  //                     ...newComment,
  //                     likesCount: newComment.likesCount ?? 0,
  //                     dislikesCount: newComment.dislikesCount ?? 0,
  //                     currentUserReaction:
  //                       newComment.currentUserReaction ?? null,
  //                   },
  //                 ],
  //               }
  //             : post
  //         );

  //         return {
  //           posts: {
  //             posts: updatedPosts,
  //             totalCount: oldData.posts.totalCount,
  //           },
  //         };
  //       }
  //     );
  //   },
  // });
  // // Удаление комментария
  // useSubscription(POST_COMMENT_DELETED_SUBSCRIPTION, {
  //   onData: ({ client, data }) => {
  //     const deleted = data?.data?.postCommentDeleted;
  //     if (!deleted?.commentId || !deleted?.postId) return;

  //     client.cache.modify({
  //       id: client.cache.identify({ __typename: "Post", id: deleted.postId }),
  //       fields: {
  //         comments(existingRefs = [], { readField }) {
  //           return existingRefs.filter(
  //             (commentRef: any) =>
  //               readField("id", commentRef) !== deleted.commentId
  //           );
  //         },
  //       },
  //     });
  //   },
  //   onError: (error) => {
  //     console.error("POST_COMMENT_DELETED_SUBSCRIPTION error", error);
  //   },
  // });

  // // Реакция на комментарий
  // useSubscription(COMMENT_REACTION_CHANGED_SUBSCRIPTION, {
  //   onData: ({ client, data }) => {
  //     const updatedComment = data?.data?.commentReactionChanged;
  //     if (!updatedComment?.id) return;

  //     client.cache.writeFragment({
  //       id: client.cache.identify({
  //         __typename: "PostComment",
  //         id: updatedComment.id,
  //       }),
  //       fragment: gql`
  //         fragment UpdatedComment on PostComment {
  //           id
  //           likesCount
  //           dislikesCount
  //           currentUserReaction
  //         }
  //       `,
  //       data: updatedComment,
  //     });
  //   },
  //   onError: (error) => {
  //     console.error("COMMENT_REACTION_CHANGED_SUBSCRIPTION error", error);
  //   },
  // });
}
