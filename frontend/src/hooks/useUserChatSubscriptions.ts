import { useSubscription } from "@apollo/client";
import { useState, useEffect } from "react";
import { GET_USERS, GET_USER_CHATS } from "@/apolo/queryes";
import {
  USER_CREATED_SUBSCRIPTION,
  USER_DELETED_SUBSCRIPTION,
  USER_LOGIN_SUBSCRIPTION,
  USER_LOGGEDOUT_SUBSCRIPTION,
  CHAT_CREATED_SUBSCRIPTION,
} from "@/apolo/subscriptions";
import { useStateContext } from "@/components/StateProvider";

export default function useUserChatSubscriptions() {
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
}
