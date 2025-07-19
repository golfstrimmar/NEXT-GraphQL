<<<<<<< HEAD
import { useEffect } from "react";
import { useSubscription, useQuery, useMutation } from "@apollo/client";
import { gql } from "@apollo/client";
import { GET_USERS, GET_ALL_CHATS, GET_MESSAGES } from "@/apolo/queryes";
=======
import { useSubscription } from "@apollo/client";
import { useState, useEffect } from "react";
import { GET_USERS, GET_USER_CHATS } from "@/apolo/queryes";
>>>>>>> simple
import {
  USER_CREATED_SUBSCRIPTION,
  USER_DELETED_SUBSCRIPTION,
  USER_LOGIN_SUBSCRIPTION,
  USER_LOGGEDOUT_SUBSCRIPTION,
  CHAT_CREATED_SUBSCRIPTION,
<<<<<<< HEAD
  CHAT_DELETED_SUBSCRIPTION,
  MESSAGE_SENT_SUBSCRIPTION,
} from "@/apolo/subscriptions";

import { useStateContext } from "@/components/StateProvider";
export default function useUserChatSubscriptions(chatIds?: number[]) {
  const { user, setUser } = useStateContext();

  // ⬇️ Подписка: добавление пользователя
=======
} from "@/apolo/subscriptions";
import { useStateContext } from "@/components/StateProvider";

export default function useUserChatSubscriptions() {
  const { user, setUser, showModal } = useStateContext();

  // Пользователи: добавление
>>>>>>> simple
  useSubscription(USER_CREATED_SUBSCRIPTION, {
    onData: ({ client, data }) => {
      const newUser = data?.data?.userCreated;
      if (!newUser) return;
<<<<<<< HEAD
      console.log("<===== ✅ Subscribed to CREATE_USER: =====>", newUser);
=======
>>>>>>> simple
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

<<<<<<< HEAD
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
=======
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
>>>>>>> simple
      });
    },
  });

<<<<<<< HEAD
  // ⬇️ Подписка: выход пользователя
=======
>>>>>>> simple
  useSubscription(USER_LOGGEDOUT_SUBSCRIPTION, {
    onData: ({ client, data }) => {
      const userLoggedOut = data?.data?.userLoggedOut;
      if (!userLoggedOut) return;
<<<<<<< HEAD
      console.log(
        "<===== ❌✅ Subscribed to LOGGEDOUT_USER: =====>",
        userLoggedOut
      );
=======
>>>>>>> simple
      if (userLoggedOut?.id === user?.id) {
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
<<<<<<< HEAD

      client.cache.updateQuery({ query: GET_USERS }, (oldData) => {
        if (!oldData) return null;

=======
      client.cache.updateQuery({ query: GET_USERS }, (oldData) => {
        if (!oldData) return null;
>>>>>>> simple
        return {
          users: oldData.users.map((u: any) =>
            u.id === userLoggedOut.id ? { ...u, isLoggedIn: false } : u
          ),
        };
      });
    },
  });

<<<<<<< HEAD
  // ⬇️ Подписка: удаление пользователя
=======
>>>>>>> simple
  useSubscription(USER_DELETED_SUBSCRIPTION, {
    onData: ({ client, data }) => {
      const deletedUserId = data?.data?.userDeleted?.id;
      if (!deletedUserId) return;
<<<<<<< HEAD
      console.log(
        "<===== ❌❌❌ Subscribed to USER_DELETED:  =====>",
        data?.data?.userDeleted
      );
=======
      showModal("🗑️ User deleted successfully.");
      // Если текущий пользователь — удаленный, логаутим
>>>>>>> simple
      const currentUserLoggedIn = localStorage.getItem("user");
      if (currentUserLoggedIn) {
        const currentUser = JSON.parse(currentUserLoggedIn);
        if (currentUser.id === deletedUserId) {
          setUser(null);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
<<<<<<< HEAD
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
=======

      // Принудительно сбросить кеш
      // client.resetStore();

      // Или можно вручную обновить кеш через refetch нужных запросов
      client.refetchQueries({
        include: [GET_USERS, GET_USER_CHATS],
>>>>>>> simple
      });
    },
  });

<<<<<<< HEAD
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
=======
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
>>>>>>> simple
        };
      });
    },
  });
<<<<<<< HEAD
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
=======
>>>>>>> simple
}
