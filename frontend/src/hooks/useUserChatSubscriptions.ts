import { useSubscription } from "@apollo/client";
import { useState, useEffect } from "react";
import {
  GET_USERS,
  GET_USER_CHATS,
  GET_ALL_POSTS,
  GET_ALL_CATEGORIES,
} from "@/apolo/queryes";
import {
  USER_CREATED_SUBSCRIPTION,
  USER_DELETED_SUBSCRIPTION,
  USER_LOGIN_SUBSCRIPTION,
  USER_LOGGEDOUT_SUBSCRIPTION,
  CHAT_CREATED_SUBSCRIPTION,
  POST_CREATED_SUBSCRIPTION,
  POST_DELETED_SUBSCRIPTION,
  // REACTION_CHANGED_SUBSCRIPTION,
  // COMMENT_CREATED_SUBSCRIPTION,
  // POST_DELETED_SUBSCRIPTION,
  // POST_COMMENT_DELETED_SUBSCRIPTION,
  // COMMENT_REACTION_CHANGED_SUBSCRIPTION,
} from "@/apolo/subscriptions";
import { useStateContext } from "@/components/StateProvider";
import { gql } from "@apollo/client";
const POSTS_PER_PAGE = 5;

export default function useUserChatSubscriptions(
  currentPage: number | null,
  setCurrentPage: ((page: number) => void) | null
) {
  const { user, setUser, showModal } = useStateContext();

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
      const newUserID = data?.data?.userLogin;
      if (!newUserID) return;
      console.log("<==== 👤 LOGIN SUCCESS====>", newUserID);
      // const cacheId = newUserID;
      const cacheId = client.cache.identify(newUserID);
      client.cache.modify({
        id: cacheId,
        fields: {
          isLoggedIn() {
            return true;
          },
        },
      });
    },
  });

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

  useSubscription(USER_DELETED_SUBSCRIPTION, {
    onData: ({ client, data }) => {
      const deletedUserId = data?.data?.userDeleted?.id;
      if (!deletedUserId) return;
      showModal("🗑️ User deleted successfully.");
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
        include: [GET_USERS, GET_USER_CHATS],
      });
    },
  });

  useSubscription(CHAT_CREATED_SUBSCRIPTION, {
    onData: ({ client, data }) => {
      const newChat = data?.data?.chatCreated;
      if (!newChat) return;
      console.log("<===== 🟢 SUBSCRIPTION  chatCreated =======>", newChat);
      showModal(`✅ Chat created successfully!`);
      client.cache.updateQuery({ query: GET_USER_CHATS }, (oldData) => {
        if (!oldData || !oldData.userChats) return { userChats: [newChat] };
        const exists = oldData.userChats.some((c: any) => c.id === newChat.id);
        if (exists) return oldData;
        return {
          userChats: [
            {
              ...newChat,
              messages: [],
            },
            ...oldData.userChats,
          ],
        };
      });
    },
  });

  useSubscription(POST_CREATED_SUBSCRIPTION, {
    onData: ({ client, data }) => {
      // исправляем: убираем лишний .data
      const newPost = data?.data?.postCreated;
      console.log("<===== 🟢 SUBSCRIPTION postCreated =======>", newPost);
      if (!newPost) return;

      if (currentPage !== 1) {
        setCurrentPage(1);
      }

      const variables = { skip: 0, take: POSTS_PER_PAGE };

      const existing = client.readQuery({
        query: GET_ALL_POSTS,
        variables,
      });

      if (existing?.posts?.posts) {
        const exists = existing.posts.posts.some((p) => p.id === newPost.id);

        if (!exists) {
          client.refetchQueries({
            include: [GET_ALL_POSTS, GET_ALL_CATEGORIES],
          });
        }
      }
    },
  });
  useSubscription(POST_DELETED_SUBSCRIPTION, {
    onData: ({ client, data }) => {
      const deletedPostId = data?.data?.postDeleted;
      if (!deletedPostId) return;

      // Сбрасываем страницу на первую
      if (currentPage !== 1) {
        setCurrentPage(1);
      }

      // Очищаем кэш текущей страницы
      client.cache.evict({
        fieldName: "posts",
        args: {
          skip: (currentPage - 1) * POSTS_PER_PAGE,
          take: POSTS_PER_PAGE,
        },
      });

      // Обновляем кэш первой страницы и totalCount
      client.cache.updateQuery(
        {
          query: GET_ALL_POSTS,
          variables: { skip: 0, take: POSTS_PER_PAGE },
        },
        (oldData) => {
          if (!oldData || !oldData.posts || !oldData.posts.posts) {
            return { posts: { posts: [], totalCount: 0 } };
          }

          const updatedPosts = oldData.posts.posts.filter(
            (post: any) => post.id !== deletedPostId
          );

          // Устанавливаем totalCount на основе оставшихся постов или уменьшаем, но не ниже 0
          const newTotalCount = Math.max(0, oldData.posts.totalCount - 1);

          return {
            posts: {
              posts: updatedPosts,
              totalCount: newTotalCount,
            },
          };
        }
      );

      client.cache.gc();
    },
  });

  // chatIds.forEach((chatId) => {
  //   useSubscription(MESSAGE_SENT_SUBSCRIPTION, {
  //     variables: { chatId },
  //     onData: ({ client, data }) => {
  //       const newMessage = data?.data?.messageSent;
  //       console.log(
  //         "<==== ✅ 📤 SUBSCRIPTION  messageSent newMessage ====>",
  //         chatId,
  //         newMessage
  //       );
  //       if (!newMessage) return;

  //       // 1. Найти чат в кеше
  //       const chatCacheId = client.cache.identify({
  //         __typename: "Chat",
  //         id: newMessage.chat.id,
  //       });
  //       if (!chatCacheId) return;

  //       // 2. Добавить сообщение в поле messages чата
  //       client.cache.modify({
  //         id: chatCacheId,
  //         fields: {
  //           messages(existingRefs = []) {
  //             const newRef = client.cache.writeFragment({
  //               data: newMessage,
  //               fragment: gql`
  //                 fragment NewMessage on Message {
  //                   id
  //                   content
  //                   createdAt
  //                   sender {
  //                     id
  //                     name
  //                   }
  //                 }
  //               `,
  //             });
  //             return [...existingRefs, newRef];
  //           },
  //         },
  //       });
  //     },
  //   });
  // });

  // const useSingleChatSubscription = (chatId: number) => {
  //   useSubscription(MESSAGE_SENT_SUBSCRIPTION, {
  //     variables: { chatId },
  //     onData: ({ client, data }) => {
  //       const newMessage = data?.data?.messageSent;
  //       if (!newMessage) return;

  //       console.log("📨 Message for chat", chatId, newMessage);

  //       const chatCacheId = client.cache.identify({
  //         __typename: "Chat",
  //         id: newMessage.chat.id,
  //       });

  //       if (!chatCacheId) return;

  //       client.cache.modify({
  //         id: chatCacheId,
  //         fields: {
  //           messages(existingRefs = []) {
  //             const newRef = client.cache.writeFragment({
  //               data: newMessage,
  //               fragment: gql`
  //                 fragment NewMessage on Message {
  //                   id
  //                   content
  //                   createdAt
  //                   sender {
  //                     id
  //                     name
  //                   }
  //                 }
  //               `,
  //             });

  //             return [...existingRefs, newRef];
  //           },
  //         },
  //       });
  //     },
  //   });
  // };

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
