"use client";
import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import transformData from "@/hooks/useTransformData";
import { useMutation, useApolloClient, useQuery } from "@apollo/client";
import { DELETE_USER, CREATE_CHAT } from "@/apolo/mutations";
import useUserChatSubscriptions from "@/hooks/useUserChatSubscriptions";
import { useStateContext } from "@/components/StateProvider";
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
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  }, [users, usersLoading, setUser]);

  const handleDelete = async (id: number) => {
    try {
      await deleteUser({
        variables: { id },
      });
    } catch (error) {
      console.error("❌ Error deleting user:", error);
    }
  };
  const handleCreateChat = async (participantId: number) => {
    try {
      const { data } = await createChat({
        variables: { participantId },
      });
    } catch (error: any) {
      showModal(error.message);
      console.error("❌ Error creating chat:", error);
    }
  };

  const hasChatWithUser = (userId, chats: Chat[]) => {
    return chats?.some(
      (c) =>
        (c.creator.id === user?.id && c.participant.id === userId) ||
        (c.creator.id === userId && c.participant.id === user?.id)
    );
  };

  const renderCreateChatButton = ({ userId, handleCreateChat, userName }) => {
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
    if (!users) return null;

    return users
      .slice()
      .sort((a, b) => (a.id === user?.id ? -1 : b.id === user?.id ? 1 : 0))
      .map((foo) => (
        <li key={foo.id} className={`p-2 border rounded bg-gray-200`}>
          <div className="flex items-center  gap-2">
            <div
              className={`flex items-center flex-wrap gap-2 font-bold text-[16px] px-2 rounded-2xl 
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
              {foo.picture && (
                <Image
                  src={foo.picture}
                  alt="user"
                  width={30}
                  height={30}
                  className="rounded-full my-1"
                />
              )}
              {foo.name && (
                <h2
                  className={`
                    ${
                      user?.id === foo.id && foo.isLoggedIn
                        ? "text-green-200"
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
            {renderCreateChatButton({
              userId: foo.id,
              handleCreateChat,
              userName: foo.name,
            })}
          </div>
          <div className="flex flex-col p-2 rounded-2xl mt-3 text-[12px] bg-white text-gray-500">
            {foo.email && <p>Email: {foo.email}</p>}
            {foo.createdAt && (
              <p>
                🕒 <span>{transformData(foo.createdAt)}</span>
              </p>
            )}
            <p>id: {foo.id}</p>
          </div>
        </li>
      ));
  }, [users, user, chats]);
  // --------------------------

  return (
    <div className="space-y-2 ">
      {users.length === 0 && <p>No users</p>}

      <h2 className="!text-3xl font-bold mb-4">🧑‍🤝‍🧑 Users:</h2>
      {usersLoading ? (
        <Loading />
      ) : (
        <ul className="flex flex-col gap-2">{userList}</ul>
      )}
    </div>
  );
};

export default UsersList;
