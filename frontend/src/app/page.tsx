"use client";
import { useState } from "react";
import { useSubscription, useQuery } from "@apollo/client";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setUsers, deleteUserFromRedux } from "@/app/redux/slices/authSlice";

// import Chats from "@/components/Chats/Chats";

import { GET_USERS } from "@/apolo/queryes";

import { USER_DELETED_SUBSCRIPTION } from "@/apolo/subscriptions";

import useSubLogin from "@/hooks/useSubLogin";
import useCreateUser from "@/hooks/useCreateUser";
import UsersList from "@/components/UsersList/UsersList";

export default function Users() {
  useSubLogin();
  useCreateUser();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    data: queryData,
    loading: queryLoading,
    error: queryError,
  } = useQuery(GET_USERS);

  const { data: subDataDelete, error: subErrorDelete } = useSubscription(
    USER_DELETED_SUBSCRIPTION
  );

  // -------------------------

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
      <UsersList />
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
