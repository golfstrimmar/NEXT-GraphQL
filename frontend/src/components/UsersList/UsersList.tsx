"use client";
import React, { useEffect } from "react";
import Image from "next/image";
import transformData from "@/app/hooks/useTransformData";
import { useSelector, useDispatch } from "react-redux";
import { useMutation } from "@apollo/client";
import { DELETE_USER } from "@/apolo/mutations";
import { deleteUserFromRedux } from "@/app/redux/slices/authSlice";
const UsersList = () => {
  const dispatch = useDispatch();
  const [deleteUser] = useMutation(DELETE_USER);
  const users = useSelector(
    (state: { auth: { users: any[] } }) => state.auth.users
  );

  useEffect(() => {
    if (users) {
      console.log("<==== PAGE users====>", users);
    }
  }, [users]);
  const handleDelete = async (id: number) => {
    try {
      const { data } = await deleteUser({ variables: { id } });

      if (data?.deleteUser?.id) {
        console.log("❌✅❌ Удалён пользователь:", data.deleteUser);
        dispatch(deleteUserFromRedux(data.deleteUser.id));
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
            <p className="text-green-500">Online</p>
          ) : (
            <p className="text-gray-400 text-sm">Offline</p>
          )}
          <strong>ID: {user.id}</strong>
          {user.email && <p>Email: {user.email}</p>}
          {user.name && <p>Name: {user.name}</p>}
          {user.createdAt && <p>Created: {transformData(user.createdAt)}</p>}
          <button onClick={() => handleDelete(user.id)}>
            <Image
              src="/svg/cross.svg"
              alt="delete"
              width={20}
              height={20}
              className="cursor-pointer p-1 hover:border hover:border-red-500 hover:rounded-md   transition-all duration-200"
            />
          </button>
        </div>
      ))}
    </div>
  );
};

export default UsersList;
