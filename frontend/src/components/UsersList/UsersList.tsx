"use client";
import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import transformData from "@/hooks/useTransformData";
import { useMutation, useApolloClient, useQuery } from "@apollo/client";
import { DELETE_USER, CREATE_CHAT } from "@/apolo/mutations";
import useUserChatSubscriptions from "@/hooks/useUserChatSubscriptions";
import { useStateContext } from "@/components/StateProvider";
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
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
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
    } catch (error) {
      console.error("❌ Error deleting user:", error);
    }
  };
  const handleCreateChat = async (participantId: number) => {
    try {
      const { data } = await createChat({
        variables: { participantId },
      });
      console.log("🟢  Mutation to createChat:", data.createChat);

      showModal(`💬 Chat created successfully!`);
    } catch (error: any) {
      showModal(error.message);
      console.error("❌ Error creating chat:", error);
    }
  };

  const hasChatWithUser = (userId, chats) => {
    return chats?.some(
      (c) =>
        (c.creator.id === user?.id && c.participant.id === userId) ||
        (c.creator.id === userId && c.participant.id === user?.id)
    );
  };

  const renderCreateChatButton = ({ userId, handleCreateChat, userName }) => {
    const chats = allChatsData?.chats;
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
    if (!queryData?.users) return null;

    return queryData.users
      .slice()
      .sort((a, b) => (a.id === user?.id ? -1 : b.id === user?.id ? 1 : 0))
      .map((foo) => (
        <li key={foo.id} className={`p-2 border rounded bg-gray-200`}>
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 font-bold text-[16px] px-2 rounded-2xl 
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
              {foo.name && (
                <h2
                  className={`
                    ${
                      user?.id === foo.id && foo.isLoggedIn
                        ? "text-green-900"
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
            {renderCreateChatButton({
              userId: foo.id,
              handleCreateChat,
              userName: foo.name,
            })}
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
  }, [queryData?.users, user?.id, allChatsData?.chats]);
  // --------------------------

  return (
    <div className="space-y-2 ">
      {queryData?.users.length === 0 && <p>No users</p>}
      <h2 className=" mb-4">Users:</h2>
      {loading ? (
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-4 border-gray-300 animate-spin"></div>
          <div className="absolute inset-1 rounded-full border-4 border-blue-500 border-t-transparent animate-spin-slower"></div>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">{userList}</ul>
      )}
    </div>
  );
};

export default UsersList;
