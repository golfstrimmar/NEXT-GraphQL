"use client";
import React from "react";
import Image from "next/image";
import transformData from "@/app/hooks/useTransformData";
import { useMutation, useApolloClient } from "@apollo/client";
import { DELETE_USER } from "@/apolo/mutations";
import { GET_USERS } from "@/apolo/queryes"; // обязательно!
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

  return (
    <div className="space-y-2 max-w-[500px]">
      {users.length === 0 && <p>No users</p>}
      {users.map((user) => (
        <div key={user.id} className="p-2 border rounded bg-gray-200 ">
          <div className="flex items-center gap-2">
            {user.name && (
              <h2
                className={` font-bold text-[16px]   px-2 rounded-2xl ${
                  user.isLoggedIn ? "bg-green-500 text-white" : "bg-gray-300"
                }`}
              >
                {user.name}
              </h2>
            )}
            {user.isLoggedIn ? (
              <p className="text-green-500 bg-green-100 inline-block rounded-2xl px-2">
                Online
              </p>
            ) : (
              <p className="text-gray-400 bg-gray-100 text-sm inline-block  rounded-2xl px-2">
                Offline
              </p>
            )}
            <button onClick={() => handleDelete(user.id)}>
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
            {user.email && <p>Email: {user.email}</p>}
            {user.createdAt && <p>Created: {transformData(user.createdAt)}</p>}
            <p className="text-sm text-neutral-500">id: {user.id}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UsersList;
