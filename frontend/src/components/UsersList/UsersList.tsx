"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import transformData from "@/app/hooks/useTransformData";
import { useMutation, useApolloClient, useQuery } from "@apollo/client";
import { DELETE_USER, CREATE_CHAT } from "@/apolo/mutations";

import { useStateContext } from "@/components/StateProvider";
import { GET_USERS, GET_ALL_CHATS } from "@/apolo/queryes";

import dynamic from "next/dynamic";
const ModalMessage = dynamic(
  () => import("@/components/ModalMessage/ModalMessage"),
  {
    ssr: false,
  }
);

type User = {
  id: number;
  name: string;
  email: string;
  avatar: string;
  createdAt: string;
  isLoggedIn: boolean;
};

type Props = {
  users: User[];
};

const UsersList = ({ users }: Props) => {
  const client = useApolloClient(); // получаем доступ к кэшу
  const [deleteUser] = useMutation(DELETE_USER);
  const [createChat] = useMutation(CREATE_CHAT);
  const { data: allChatsData } = useQuery(GET_ALL_CHATS);
  const { user } = useStateContext();
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [openModalMessage, setOpenModalMessage] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const showModal = (message: string) => {
    setSuccessMessage(message);
    setOpenModalMessage(true);
    setIsModalVisible(true);
    setTimeout(() => {
      setOpenModalMessage(false);
      setSuccessMessage("");
      return;
    }, 2000);
  };

  const handleDelete = async (id: number) => {
    try {
      const { data } = await deleteUser({
        variables: { id },
      });

      const deletedUser = data?.deleteUser;
      if (deletedUser?.id) {
        console.log("❌❌❌ Mutation to delete user:", deletedUser);
        // Обновляем кэш вручную
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
      client.resetStore();
      showModal(`💬 Chat created successfully!`);
    } catch (error: any) {
      showModal(error.message);
      console.error("❌ Error creating chat:", error);
    }
  };

  const renderCreateChatButton = (
    userId: number,
    currentUserId: number | undefined,
    chats: any[],
    handleCreateChat: (id: number) => void,
    userName: string
  ) => {
    console.log(
      "<====userId, currentUserId, chats,userName====>",
      userId,
      currentUserId,
      chats,
      userName
    );
    console.log("<====allChatsData?.allChats====>", allChatsData?.allChats);
    const hasChat = chats?.some(
      (c) =>
        Number(c.creator.id) === userId || Number(c.participant.id) === userId
    );
    if (userId === currentUserId || hasChat || !currentUserId) return null;

    return (
      <button
        onClick={() => handleCreateChat(userId)}
        className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition duration-300 ease-in-out cursor-pointer"
      >
        Create chat with {userName}
      </button>
    );
  };

  return (
    <div className="space-y-2 max-w-[500px]">
      {isModalVisible && (
        <ModalMessage message={successMessage} open={openModalMessage} />
      )}
      {users.length === 0 && <p>No users</p>}
      {users.map((foo) => (
        <div key={foo.id} className="p-2 border rounded bg-gray-200 ">
          <div className="flex items-center gap-2">
            {foo.name && (
              <h2
                className={` font-bold text-[16px]   px-2 rounded-2xl ${
                  foo.isLoggedIn ? "bg-green-500 text-white" : "bg-gray-300"
                }`}
              >
                {foo.name}
              </h2>
            )}
            {foo.isLoggedIn ? (
              <p className="text-green-500 bg-green-100 inline-block rounded-2xl px-2">
                Online
              </p>
            ) : (
              <p className="text-gray-400 bg-gray-100 text-sm inline-block  rounded-2xl px-2">
                Offline
              </p>
            )}
            {renderCreateChatButton(
              foo.id,
              user?.id,
              allChatsData?.chats,
              handleCreateChat,
              foo.name
            )}
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
          <div className="flex flex-col p-4 rounded-2xl mt-3 bg-white ">
            {foo.email && <p>Email: {foo.email}</p>}
            {foo.createdAt && (
              <p className="text-sm text-gray-500">
                🕒
                {transformData(foo.createdAt)}
              </p>
            )}

            <p className="text-sm text-neutral-500">id: {foo.id}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UsersList;
