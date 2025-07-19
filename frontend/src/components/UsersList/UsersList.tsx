"use client";
import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import transformData from "@/hooks/useTransformData";
import { useMutation, useApolloClient, useQuery } from "@apollo/client";
import { DELETE_USER, CREATE_CHAT } from "@/apolo/mutations";
import useUserChatSubscriptions from "@/hooks/useUserChatSubscriptions";
import { useStateContext } from "@/components/StateProvider";
<<<<<<< HEAD
import { GET_USERS, GET_ALL_CHATS } from "@/apolo/queryes";

const UsersList = () => {
  const client = useApolloClient();
  const [deleteUser] = useMutation(DELETE_USER);
  const [createChat] = useMutation(CREATE_CHAT);
  const { data: queryData, loading } = useQuery(GET_USERS);
  const { data: allChatsData } = useQuery(GET_ALL_CHATS);
  const { user, setUser, showModal } = useStateContext();
  useUserChatSubscriptions();
  useEffect(() => {
    if (!loading && queryData && Array.isArray(queryData.users)) {
      if (queryData.users.length === 0) {
        console.log("<==== all users =======>", queryData.users);
=======
import { GET_USERS, GET_USER_CHATS } from "@/apolo/queryes";
import Loading from "@/components/Loading";
import { Chat } from "@/types/chat";
const UsersList = () => {
  const client = useApolloClient();
  const { user, setUser, showModal } = useStateContext();
  const [deleteUser] = useMutation(DELETE_USER);
  const [createChat] = useMutation(CREATE_CHAT);
  const {
    data: usersData,
    error: usersError,
    loading: usersLoading,
  } = useQuery(GET_USERS);

  const {
    data: chatsData,
    loading: chatsLoading,
    error: chatsError,
  } = useQuery(GET_USER_CHATS, {
    skip: !user,
  });

  const users = useMemo(() => {
    return usersData?.users ?? [];
  }, [usersData]);

  const chats = useMemo(() => {
    return chatsData?.userChats ?? [];
  }, [chatsData]);

  useEffect(() => {
    if (users) {
      console.log("<==== users====>", users);
    }
  }, [users]);

  useUserChatSubscriptions(null);

  useEffect(() => {
    if (!usersLoading && Array.isArray(users)) {
      if (users.length === 0) {
        console.log("<==== all users =======>", users);
>>>>>>> simple
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
<<<<<<< HEAD
  }, [queryData, loading, setUser]);

  const handleDelete = async (id: number) => {
    try {
      const { data } = await deleteUser({
        variables: { id },
      });

      const deletedUser = data?.deleteUser;
      if (deletedUser?.id) {
        console.log("❌❌❌ Mutation to delete user:", deletedUser);
        showModal(`User deleted successfully!`);
        client.cache.updateQuery({ query: GET_USERS }, (oldData: any) => {
          if (!oldData) return { users: [] };

          return {
            users: oldData.users.filter((u: any) => u.id !== deletedUser.id),
          };
        });
      }
=======
  }, [users, usersLoading, setUser]);

  const handleDelete = async (id: number) => {
    try {
      await deleteUser({
        variables: { id },
      });
>>>>>>> simple
    } catch (error) {
      console.error("❌ Error deleting user:", error);
    }
  };
  const handleCreateChat = async (participantId: number) => {
    try {
      const { data } = await createChat({
        variables: { participantId },
      });
<<<<<<< HEAD
      console.log("🟢  Mutation to createChat:", data.createChat);

      showModal(`💬 Chat created successfully!`);
=======
>>>>>>> simple
    } catch (error: any) {
      showModal(error.message);
      console.error("❌ Error creating chat:", error);
    }
  };

<<<<<<< HEAD
  const hasChatWithUser = (userId, chats) => {
=======
  const hasChatWithUser = (userId, chats: Chat[]) => {
>>>>>>> simple
    return chats?.some(
      (c) =>
        (c.creator.id === user?.id && c.participant.id === userId) ||
        (c.creator.id === userId && c.participant.id === user?.id)
    );
  };

  const renderCreateChatButton = ({ userId, handleCreateChat, userName }) => {
<<<<<<< HEAD
    const chats = allChatsData?.chats;
=======
>>>>>>> simple
    const hasChat = hasChatWithUser(userId, chats);
    if (userId === user?.id || hasChat || !user?.id) return null;

    return (
      <button
        onClick={() => handleCreateChat(userId)}
        className="text-[12px] bg-blue-500 text-white px-3  rounded hover:bg-blue-600 transition duration-300 ease-in-out cursor-pointer"
      >
        Creat chat with
        <span className="font-bold text-[16px]"> {userName}</span>
      </button>
    );
  };

  // --------------------------
  const userList = useMemo(() => {
<<<<<<< HEAD
    if (!queryData?.users) return null;

    return queryData.users
=======
    if (!users) return null;

    return users
>>>>>>> simple
      .slice()
      .sort((a, b) => (a.id === user?.id ? -1 : b.id === user?.id ? 1 : 0))
      .map((foo) => (
        <li key={foo.id} className={`p-2 border rounded bg-gray-200`}>
<<<<<<< HEAD
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 font-bold text-[16px] px-2 rounded-2xl 
=======
          <div className="flex items-center  gap-2">
            <div
              className={`flex items-center flex-wrap gap-2 font-bold text-[16px] p-2  rounded-2xl 
>>>>>>> simple
                ${
                  user?.id === foo.id && foo.isLoggedIn
                    ? "bg-green-600 "
                    : "bg-gray-300 "
                }
                ${
                  user?.id !== foo.id && foo.isLoggedIn
                    ? "bg-green-400 "
                    : "bg-gray-400 "
                }
                `}
            >
<<<<<<< HEAD
=======
              {foo.picture && (
                <Image
                  src={foo.picture}
                  alt="user"
                  width={30}
                  height={30}
                  className="rounded-full my-1"
                />
              )}
>>>>>>> simple
              {foo.name && (
                <h2
                  className={`
                    ${
                      user?.id === foo.id && foo.isLoggedIn
<<<<<<< HEAD
                        ? "text-green-900"
=======
                        ? "text-green-200"
>>>>>>> simple
                        : "text-gray-500"
                    }
                    ${
                      user?.id !== foo.id && foo.isLoggedIn
                        ? "text-white"
                        : "text-gray-500"
                    }
                  `}
                >
                  {foo.name}
                </h2>
              )}
              {foo.isLoggedIn ? (
                <p className="text-green-500 text-[10px] bg-green-100 inline-block rounded-2xl px-2 ml-2">
                  Online
                </p>
              ) : (
                <p className="text-gray-400  text-[10px] bg-gray-100  inline-block rounded-2xl px-2 ml-2">
                  Offline
                </p>
              )}
            </div>
<<<<<<< HEAD
=======

            {user?.name === "Victor Yushin" && (
              <button onClick={() => handleDelete(foo.id)}>
                <Image
                  src="/svg/cross.svg"
                  alt="delete"
                  width={20}
                  height={20}
                  className="cursor-pointer bg-white p-1 hover:border hover:border-red-500 rounded-md transition-all duration-200"
                />
              </button>
            )}
          </div>
          <div className="mt-2">
>>>>>>> simple
            {renderCreateChatButton({
              userId: foo.id,
              handleCreateChat,
              userName: foo.name,
            })}
<<<<<<< HEAD
            <button onClick={() => handleDelete(foo.id)}>
              <Image
                src="/svg/cross.svg"
                alt="delete"
                width={20}
                height={20}
                className="cursor-pointer bg-white p-1 hover:border hover:border-red-500 rounded-md transition-all duration-200"
              />
            </button>
          </div>

=======
          </div>
>>>>>>> simple
          <div className="flex flex-col p-2 rounded-2xl mt-3 text-[12px] bg-white text-gray-500">
            {foo.email && <p>Email: {foo.email}</p>}
            {foo.createdAt && (
              <p>
                🕒 <span>{transformData(foo.createdAt)}</span>
              </p>
            )}
<<<<<<< HEAD
            <p>id: {foo.id}</p>
          </div>
        </li>
      ));
  }, [queryData?.users, user?.id, allChatsData?.chats]);
=======
          </div>
        </li>
      ));
  }, [users, user, chats]);
>>>>>>> simple
  // --------------------------

  return (
    <div className="space-y-2 ">
<<<<<<< HEAD
      {queryData?.users.length === 0 && <p>No users</p>}
      <h2 className=" mb-4">Users:</h2>
      {loading ? (
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-4 border-gray-300 animate-spin"></div>
          <div className="absolute inset-1 rounded-full border-4 border-blue-500 border-t-transparent animate-spin-slower"></div>
        </div>
=======
      {users.length === 0 && <p>No users</p>}

      <h2 className="!text-3xl font-bold mb-4">🧑‍🤝‍🧑 Users:</h2>
      {usersLoading ? (
        <Loading />
>>>>>>> simple
      ) : (
        <ul className="flex flex-col gap-2">{userList}</ul>
      )}
    </div>
  );
};

export default UsersList;
