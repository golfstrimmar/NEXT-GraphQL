"use client";
import React from "react";
import Image from "next/image";
import transformData from "@/app/hooks/useTransformData";
import { useMutation, useApolloClient, useQuery } from "@apollo/client";
import { DELETE_USER, CREATE_CHAT } from "@/apolo/mutations";

import { useStateContext } from "@/components/StateProvider";
import { GET_USERS, GET_ALL_CHATS } from "@/apolo/queryes";
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

  const handleDelete = async (id: number) => {
    try {
      const { data } = await deleteUser({
        variables: { id },
      });

      const deletedUser = data?.deleteUser;
      if (deletedUser?.id) {
        console.log("❌✅❌ Удалён пользователь:", deletedUser);
        // Обновляем кэш вручную
        client.cache.updateQuery({ query: GET_USERS }, (oldData: any) => {
          if (!oldData) return { users: [] };

          return {
            users: oldData.users.filter((u: any) => u.id !== deletedUser.id),
          };
        });
      }
    } catch (error) {
      console.error("❌ Ошибка при удалении пользователя:", error);
    }
  };
  const handleCreateChat = async (participantId: number) => {
    try {
      const { data } = await createChat({
        variables: { participantId },
      });
      console.log("💬 Чат создан:", data.createChat);
      alert(`Чат создан с пользователем ID ${participantId}`);
    } catch (error: any) {
      alert(error.message);
      console.error("❌ Ошибка создания чата:", error);
    }
  };

  return (
    <div className="space-y-2 max-w-[500px]">
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

            {Number(foo.id) !== Number(user?.id) && // 👈 Не сам пользователь
              allChatsData?.chats?.some(
                (c: any) => Number(c.creator.id) === Number(foo.id)
              ) === false && // 👈 Не является уже создателем
              allChatsData?.chats?.some(
                (c: any) => Number(c.participant.id) === Number(foo.id)
              ) === false && // 👈 Не является участником
              user && ( // 👈 Авторизация проверена
                <button
                  onClick={() => handleCreateChat(foo.id)}
                  className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                >
                  Create chat with {foo.name}
                </button>
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
