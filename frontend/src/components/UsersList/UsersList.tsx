"use client";
import React from "react";
import Image from "next/image";
import transformData from "@/app/hooks/useTransformData";
import { useMutation, useApolloClient } from "@apollo/client";
import { DELETE_USER } from "@/apolo/mutations";
import { GET_USERS } from "@/apolo/queryes"; // обязательно!
import { useStateContext } from "@/components/StateProvider";
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
  const { user, setUser } = useStateContext();
  const handleDelete = async (id: number) => {
    try {
      const { data } = await deleteUser({
        variables: { id },
      });

      const deletedUser = data?.deleteUser;
      if (deletedUser?.id) {
        console.log("❌✅❌ Удалён пользователь:", deletedUser);

        // if (user && deletedUser?.id === user.id) {
        // setUser(null);
        // localStorage.removeItem("token");
        // localStorage.removeItem("user");
        // }
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
    <div className="space-y-2">
      {users.length === 0 && <p>No users</p>}
      {users.map((user) => (
        <div key={user.id} className="p-2 border rounded">
          {user.isLoggedIn ? (
            <p className="text-green-500 bg-green-100 inline-block rounded-2xl px-2">
              Online
            </p>
          ) : (
            <p className="text-gray-400 bg-gray-100 text-sm inline-block  rounded-2xl px-2">
              Offline
            </p>
          )}

          <p>ID: {user.id}</p>
          {user.email && <p>Email: {user.email}</p>}
          {user.name && <p>Name: {user.name}</p>}
          {user.createdAt && <p>Created: {transformData(user.createdAt)}</p>}
          <button onClick={() => handleDelete(user.id)}>
            <Image
              src="/svg/cross.svg"
              alt="delete"
              width={20}
              height={20}
              className="cursor-pointer p-1 hover:border hover:border-red-500 hover:rounded-md transition-all duration-200"
            />
          </button>
        </div>
      ))}
    </div>
  );
};

export default UsersList;
