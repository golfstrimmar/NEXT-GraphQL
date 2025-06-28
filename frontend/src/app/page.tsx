"use client";
import { useState } from "react";
import { gql, useMutation, useSubscription, useQuery } from "@apollo/client";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setUsers,
  addUser,
  deleteUserFromRedux,
} from "@/app/redux/slices/authSlice";
import transformData from "@/app/hooks/useTransformData";
// import Chats from "@/components/Chats/Chats";

import { GET_USERS } from "@/apolo/queryes";
import { DELETE_USER } from "@/apolo/mutations";
import {
  USER_CREATED_SUBSCRIPTION,
  USER_DELETED_SUBSCRIPTION,
} from "@/apolo/subscriptions";

import Image from "next/image";

export default function Users() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const user = useSelector((state: { auth: { user: any } }) => state.auth.user);

  const users = useSelector(
    (state: { auth: { users: any[] } }) => state.auth.users
  );

  const {
    data: queryData,
    loading: queryLoading,
    error: queryError,
  } = useQuery(GET_USERS);

  const [deleteUser] = useMutation(DELETE_USER);

  const { data: subDataCreated, error: subErrorCreated } = useSubscription(
    USER_CREATED_SUBSCRIPTION
  );
  const { data: subDataDelete, error: subErrorDelete } = useSubscription(
    USER_DELETED_SUBSCRIPTION
  );

  // const { data: loggedOutSubData } = useSubscription(
  //   USER_LOGGED_OUT_SUBSCRIPTION
  // );
  // -------------------------

  useEffect(() => {
    if (users) {
      console.log("<==== PAGE users====>", users);
    }
  }, [users]);

  useEffect(() => {
    setIsLoading(true);
    if (queryData?.users) {
      console.log("<====PAGE Users from server====>", queryData.users);
      dispatch(
        setUsers(
          queryData.users.map((user: any) => ({
            ...user,
            id: Number(user.id),
          }))
        )
      );
      setIsLoading(false);
    }
  }, [queryData, dispatch]);

  useEffect(() => {
    if (subDataCreated?.userCreated) {
      console.log(
        "<====userCreated subscription====>",
        subDataCreated.userCreated
      );
      dispatch(
        addUser({
          ...subDataCreated.userCreated,
          id: Number(subDataCreated.userCreated.id),
        })
      );
    }
  }, [subDataCreated, dispatch]);

  useEffect(() => {
    if (subDataDelete?.userDeleted) {
      console.log(
        "<====userDeleted subscription====>",
        subDataDelete.userDeleted
      );
      dispatch(deleteUserFromRedux(subDataDelete.userDeleted.id));
    }
  }, [subDataDelete, dispatch]);

  // useEffect(() => {
  //   if (queryError) {
  //     console.error("Error fetching users:", queryError);
  //   }
  //   if (subError) {
  //     console.error("Subscription error:", subError);
  //   }
  // }, [queryError, subError]);

  // -------------------------
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

  // -------------------------

  return (
    <div className="mt-[100px] p-4">
      <h1 className="text-2xl font-bold mb-4">Users:</h1>
      {isLoading && (
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-4 border-gray-300 animate-spin"></div>
          <div className="absolute inset-1 rounded-full border-4 border-blue-500 border-t-transparent animate-spin-slower"></div>
        </div>
      )}
      <div className="space-y-2">
        {users.length === 0 && !queryLoading && <p>No users</p>}
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
      {/* {user ? (
        <Chats />
      ) : (
        <p className="text-red-500 text-l mt-4">
          For get chats you need to be logged in.
        </p>
      )} */}
    </div>
  );
}
