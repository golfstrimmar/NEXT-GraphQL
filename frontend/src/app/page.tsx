"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { client } from "@/apolo/apolloClient";
import Image from "next/image";

import { useSubscription, useQuery, useMutation } from "@apollo/client";
import { GET_USERS, GET_ALL_CHATS } from "@/apolo/queryes";
import { LOGOUT_USER, DELETE_CHAT } from "@/apolo/mutations";
import {
  USER_CREATED_SUBSCRIPTION,
  USER_DELETED_SUBSCRIPTION,
  USER_LOGIN_SUBSCRIPTION,
  USER_LOGGEDOUT_SUBSCRIPTION,
  CHAT_CREATED_SUBSCRIPTION,
  CHAT_DELETED_SUBSCRIPTION,
} from "@/apolo/subscriptions";

import { useStateContext } from "@/components/StateProvider";
import UsersList from "@/components/UsersList/UsersList";
import transformData from "@/app/hooks/useTransformData";
import useIdleLogout from "@/hooks/useIdleLogout";
import isTokenExpired from "@/utils/checkTokenExpiration";

export default function Users() {
  const router = useRouter();
  const { data: queryData, loading } = useQuery(GET_USERS);
  const { user, setUser } = useStateContext();
  const [logoutUser] = useMutation(LOGOUT_USER);
  const { data: allChatsData } = useQuery(GET_ALL_CHATS);
  useIdleLogout();
  const [deleteChat] = useMutation(DELETE_CHAT);
  const handleActivity = async () => {
    try {
      await logoutUser();
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
      console.log("------Failed to log out. Please try again.-------");
    }
  };
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && isTokenExpired(token)) {
      handleActivity();
    }
  }, []);
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
    },
  });

  // ⬇️ Подписка: создание чата
  useSubscription(CHAT_CREATED_SUBSCRIPTION, {
    onData: ({ client, data }) => {
      const newChat = data?.data?.chatCreated;
      console.log("<===== ✅ Subscribed to ChatCreated: =====>", newChat);
      if (!newChat) return;

      client.cache.updateQuery({ query: GET_ALL_CHATS }, (oldData) => {
        if (!oldData) return { chats: [newChat] };
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
        if (!oldData) return { chats: [] };

        return {
          chats: oldData.chats.filter(
            (chat: any) => Number(chat.id) !== Number(deletedChatId)
          ),
        };
      });
    },
  });
  // -------------------------
  const handleDeleteChat = async (id: number) => {
    try {
      const { data } = await deleteChat({ variables: { id } });
      // client.resetStore();
      console.log("<=====🟢 MUTATION deleteChat   =====>", data);
    } catch (err) {
      console.error("Mutation error:", err);
    }
  };

  return (
    <div className="mt-[100px] p-4">
      <h1 className="text-2xl font-bold mb-4">Users:</h1>

      {loading ? (
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-4 border-gray-300 animate-spin"></div>
          <div className="absolute inset-1 rounded-full border-4 border-blue-500 border-t-transparent animate-spin-slower"></div>
        </div>
      ) : (
        <UsersList users={queryData?.users ?? []} />
      )}
      {user && (
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-2">📢 All Chats:</h2>
          {allChatsData?.chats?.length === 0 && <p>No chats found</p>}
          {allChatsData?.chats?.map((chat: any) => (
            <div key={chat.id} className="p-2 mb-2 border rounded bg-white">
              <p>
                🗣 <strong>{chat.creator.name}</strong> ↔{" "}
                <strong>{chat.participant.name}</strong>
              </p>
              <p className="text-sm text-gray-500">
                🕒
                {transformData(chat.createdAt)}
              </p>
              <p>id: {chat.id}</p>
              <button onClick={() => handleDeleteChat(chat.id)}>
                <Image
                  src="/svg/cross.svg"
                  alt="delete"
                  width={20}
                  height={20}
                  className="cursor-pointer bg-white p-1 hover:border hover:border-red-500 rounded-md transition-all duration-200"
                />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
