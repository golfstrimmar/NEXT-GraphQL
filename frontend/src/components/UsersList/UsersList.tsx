"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import transformData from "@/app/hooks/useTransformData";
import { useMutation, useApolloClient, useQuery } from "@apollo/client";
import { DELETE_USER, CREATE_CHAT } from "@/apolo/mutations";
import User from "@/types/user";
import { useStateContext } from "@/components/StateProvider";
import { GET_USERS, GET_ALL_CHATS } from "@/apolo/queryes";

import dynamic from "next/dynamic";
import { filter } from "framer-motion/m";
const ModalMessage = dynamic(
  () => import("@/components/ModalMessage/ModalMessage"),
  {
    ssr: false,
  }
);

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

  useEffect(() => {
    if (users) {
      console.log("<==== users====>", users);
    }
  }, [users]);

  useEffect(() => {
    if (allChatsData) {
      console.log("<==== allChatsData====>", allChatsData.chats);
    }
  }, [allChatsData]);

  useEffect(() => {
    if (user) {
      console.log("<==== user====>", user);
    }
  }, [user]);

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
        className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition duration-300 ease-in-out cursor-pointer"
      >
        Создать чат: {user?.name} = {userName}
      </button>
    );
  };

  return (
    <div className="space-y-2 max-w-[500px]">
      {isModalVisible && (
        <ModalMessage message={successMessage} open={openModalMessage} />
      )}
      {users.length === 0 && <p>No users</p>}
      <ul className="flex flex-col">
        {users &&
          users
            ?.slice()
            .sort((a, b) =>
              a.id === user?.id ? -1 : b.id === user?.id ? 1 : 0
            )
            .map((foo) => (
              <li key={foo.id} className={`p-2 border rounded bg-gray-200 `}>
                <div className="flex items-center gap-2">
                  {foo.name && (
                    <h2
                      className={` font-bold text-[16px]   px-2 rounded-2xl ${
                        foo.isLoggedIn
                          ? "bg-green-500 text-white"
                          : "bg-gray-300"
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
                  {renderCreateChatButton({
                    userId: foo.id,
                    // currentUserId: user?.id,
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
                  {foo.email && <p className="">Email: {foo.email}</p>}
                  {foo.createdAt && (
                    <p>
                      🕒 <span>{transformData(foo.createdAt)}</span>
                    </p>
                  )}

                  <p className="">id: {foo.id}</p>
                </div>
              </li>
            ))}
      </ul>
    </div>
  );
};

export default UsersList;
