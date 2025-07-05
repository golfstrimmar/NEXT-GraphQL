import { use, useEffect } from "react";
import { useSubscription, useQuery, useMutation } from "@apollo/client";
import { gql } from "@apollo/client";
import { GET_USERS, GET_ALL_CHATS, GET_ALL_POSTS } from "@/apolo/queryes";
import {
  USER_CREATED_SUBSCRIPTION,
  USER_DELETED_SUBSCRIPTION,
  USER_LOGIN_SUBSCRIPTION,
  USER_LOGGEDOUT_SUBSCRIPTION,
  CHAT_CREATED_SUBSCRIPTION,
  CHAT_DELETED_SUBSCRIPTION,
  MESSAGE_SENT_SUBSCRIPTION,
  POST_CREATED_SUBSCRIPTION,
  REACTION_CHANGED_SUBSCRIPTION,
  COMMENT_CREATED_SUBSCRIPTION,
  POST_DELETED_SUBSCRIPTION,
} from "@/apolo/subscriptions";

import { useStateContext } from "@/components/StateProvider";
export default function useUserChatSubscriptions(chatIds?: number[]) {
  const { user, setUser } = useStateContext();

  // ⬇️ Подписка: добавление пользователя
  useSubscription(USER_CREATED_SUBSCRIPTION, {
    onData: ({ client, data }) => {
      const newUser = data?.data?.userCreated;
      if (!newUser) return;
      console.log("<===== ✅ Subscribed to CREATE_USER: =====>", newUser);
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

  // ⬇️ Подписка: вход пользователя
  useSubscription(USER_LOGIN_SUBSCRIPTION, {
    onData: ({ client, data }) => {
      const user = data?.data?.userLogin;
      if (!user) return;
      console.log("<===== ✅ Subscribed to LOGIN_USER: =====>", user);
      client.cache.updateQuery({ query: GET_USERS }, (oldData) => {
        if (!oldData) return null;

        return {
          users: oldData.users.map((u: any) =>
            u.id === user.id ? { ...u, isLoggedIn: true } : u
          ),
        };
      });
    },
  });

  // ⬇️ Подписка: выход пользователя
  useSubscription(USER_LOGGEDOUT_SUBSCRIPTION, {
    onData: ({ client, data }) => {
      const userLoggedOut = data?.data?.userLoggedOut;
      if (!userLoggedOut) return;
      console.log(
        "<===== ❌✅ Subscribed to LOGGEDOUT_USER: =====>",
        userLoggedOut
      );
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

  // ⬇️ Подписка: удаление пользователя
  useSubscription(USER_DELETED_SUBSCRIPTION, {
    onData: ({ client, data }) => {
      const deletedUserId = data?.data?.userDeleted?.id;
      if (!deletedUserId) return;
      console.log(
        "<===== ❌❌❌ Subscribed to USER_DELETED:  =====>",
        data?.data?.userDeleted
      );
      const currentUserLoggedIn = localStorage.getItem("user");
      if (currentUserLoggedIn) {
        const currentUser = JSON.parse(currentUserLoggedIn);
        if (currentUser.id === deletedUserId) {
          setUser(null);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
      client.cache.updateQuery({ query: GET_USERS }, (oldData) => {
        if (!oldData) return { users: [] };
        return {
          users: oldData.users.filter((u: any) => u.id !== deletedUserId),
        };
      });
      client.cache.updateQuery({ query: GET_ALL_CHATS }, (oldData) => {
        if (!oldData) return { chats: [] };
        return {
          chats: oldData.chats.filter(
            (chat: any) =>
              chat.creator.id !== deletedUserId &&
              chat.participant.id !== deletedUserId
          ),
        };
      });
    },
  });

  // ⬇️ Подписка: создание чата
  useSubscription(CHAT_CREATED_SUBSCRIPTION, {
    onData: ({ client, data }) => {
      const newChat = data?.data?.chatCreated;
      console.log("<===== ✅ Subscribed to ChatCreated: =====>", newChat);
      if (!newChat) return;

      client.cache.updateQuery({ query: GET_ALL_CHATS }, (oldData) => {
        console.log("oldData in cache update:", oldData);
        if (!oldData || !oldData.chats) return { chats: [newChat] };
        const exists = oldData.chats.some((c: any) => c.id === newChat.id);
        if (exists) return oldData;
        return {
          chats: [newChat, ...oldData.chats],
        };
      });
    },
  });
  // ⬇️ Подписка: удаление чата
  useSubscription(CHAT_DELETED_SUBSCRIPTION, {
    onData: ({ client, data }) => {
      console.log(
        "<===== 🗑️  Subscribed to  Chat deleted:   =====>",
        data?.data?.chatDeleted
      );
      const deletedChatId = data?.data?.chatDeleted;
      if (!deletedChatId) return;

      client.cache.updateQuery({ query: GET_ALL_CHATS }, (oldData) => {
        console.log("oldData in deleteChat update:", oldData);
        if (!oldData) return { chats: [] };

        return {
          chats: oldData.chats.filter(
            (chat: any) => Number(chat.id) !== Number(deletedChatId)
          ),
        };
      });
    },
  });
  // ⬇️ Подписка: отправка сообщения в чат
  useSubscription(MESSAGE_SENT_SUBSCRIPTION, {
    onData: ({ client, data }) => {
      const newMessage = data?.data?.messageSent;
      console.log("<===== ✅ Subscribed to MESSAGE_SENT : =====>", newMessage);
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
          messages(existingMessages = [], { readField }) {
            const alreadyExists = existingMessages.some(
              (ref: any) => readField("id", ref) === newMessage.id
            );
            if (alreadyExists) return existingMessages;

            const newMessageRef = client.cache.writeFragment({
              data: newMessage,
              fragment: gql`
                fragment NewMessage on Message {
                  id
                  text
                  createdAt
                  sender {
                    id
                    name
                  }
                }
              `,
            });

            return [...existingMessages, newMessageRef];
          },
        },
      });
    },
  });
  useSubscription(POST_CREATED_SUBSCRIPTION, {
    onData: ({ client, data }) => {
      const newPost = data?.data?.postCreated;
      if (!newPost) return;
      console.log("<===== 📝 Subscribed to POST_CREATED: =====>", newPost);

      client.cache.updateQuery({ query: GET_ALL_POSTS }, (oldData) => {
        if (!oldData || !oldData.posts) {
          return { posts: [newPost] };
        }

        const exists = oldData.posts.some((p: any) => p.id === newPost.id);
        if (exists) return oldData;

        return {
          posts: [newPost, ...oldData.posts],
        };
      });
    },
  });

  useSubscription(REACTION_CHANGED_SUBSCRIPTION, {
    onData: ({ client, data }) => {
      const reactedPost = data?.data?.reactionChanged;
      if (!reactedPost) return;
      console.log("<===== ✅ Subscribed to POST_REACTED: =====>", reactedPost);

      client.cache.updateQuery({ query: GET_ALL_POSTS }, (oldData) => {
        if (!oldData || !oldData.posts) return { posts: [reactedPost] };

        const updatedPosts = oldData.posts.map((post: any) =>
          post.id === reactedPost.postId
            ? {
                ...post,
                likes: reactedPost.likes,
                dislikes: reactedPost.dislikes,
                currentUserReaction: reactedPost.currentUserReaction,
              }
            : post
        );

        return { posts: updatedPosts };
      });
    },
  });

  useSubscription(COMMENT_CREATED_SUBSCRIPTION, {
    onData: ({ client, data }) => {
      const newComment = data?.data?.commentCreated;
      if (!newComment) return;
      console.log(
        "<===== 📝 Subscribed to COMMENT_CREATED: =====>",
        newComment
      );

      client.cache.updateQuery({ query: GET_ALL_POSTS }, (oldData) => {
        if (!oldData || !oldData.posts) return oldData;

        const updatedPosts = oldData.posts.map((post: any) =>
          post.id === newComment.post.id
            ? {
                ...post,
                comments: [...post.comments, newComment],
              }
            : post
        );

        return { posts: updatedPosts };
      });
    },
  });

  useSubscription(POST_DELETED_SUBSCRIPTION, {
    onData: ({ client, data }) => {
      const deletedPostId = data?.data?.postDeleted;
      if (!deletedPostId) return;
      console.log(
        "<===== 📝 Subscribed to POST_DELETED: =====>",
        deletedPostId
      );
      client.cache.modify({
        fields: {
          posts(existingPosts = [], { readField }) {
            return existingPosts.filter(
              (postRef: any) => readField("id", postRef) !== deletedPostId
            );
          },
        },
      });
    },
  });
}
