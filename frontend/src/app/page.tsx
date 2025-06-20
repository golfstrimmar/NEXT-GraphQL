"use client";
import { useState } from "react";
import { gql, useSubscription, useQuery } from "@apollo/client";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setUsers, addUser } from "@/app/redux/slices/authSlice";

const GET_USERS = gql`
  query {
    users {
      id
      email
      name
      isLoggedIn
      createdAt
    }
  }
`;

const USER_CREATED_SUBSCRIPTION = gql`
  subscription {
    userCreated {
      id
      email
      name
      createdAt
    }
  }
`;

const USER_LOGGED_IN_SUBSCRIPTION = gql`
  subscription {
    userLoggedIn {
      id
      email
      name
      isLoggedIn
      createdAt
    }
  }
`;

const USER_LOGGED_OUT_SUBSCRIPTION = gql`
  subscription {
    userLoggedOut {
      id
      email
      name
      isLoggedIn
      createdAt
    }
  }
`;

export default function Users() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const users = useSelector(
    (state: { auth: { users: any[] } }) => state.auth.users
  );
  const {
    data: queryData,
    loading: queryLoading,
    error: queryError,
  } = useQuery(GET_USERS);
  const { data: subData, error: subError } = useSubscription(
    USER_CREATED_SUBSCRIPTION
  );

  const { data: loggedInSubData } = useSubscription(
    USER_LOGGED_IN_SUBSCRIPTION
  );

  const { data: loggedOutSubData } = useSubscription(
    USER_LOGGED_OUT_SUBSCRIPTION
  );

  useEffect(() => {
    setIsLoading(true);
    if (queryData?.users) {
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
    console.log("<====user Created ====>", subData?.userCreated);
    if (subData?.userCreated) {
      console.log("<====user Created ====>", subData?.userCreated);
      dispatch(
        addUser({
          ...subData.userCreated,
          id: Number(subData.userCreated.id),
        })
      );
    }
  }, [subData, dispatch]);

  useEffect(() => {
    if (loggedInSubData?.userLoggedIn) {
      const userLogined = loggedInSubData?.userLoggedIn;
      console.log("<====user Logged In====>", userLogined);
      dispatch(
        setUsers(
          users.map((user) =>
            user.id === Number(userLogined.id)
              ? {
                  ...userLogined,
                }
              : user
          )
        )
      );
    }
  }, [loggedInSubData, dispatch]);

  useEffect(() => {
    if (loggedOutSubData) {
      console.log("<====loggedOutSubData====>", loggedOutSubData);
    }
    if (loggedOutSubData?.userLoggedOut) {
      console.log("<====user Logged Out====>", loggedOutSubData?.userLoggedOut);
      const updatedUser = {
        ...loggedOutSubData.userLoggedOut,
        id: Number(loggedOutSubData.userLoggedOut.id),
      };
      dispatch((dispatch, getState) => {
        const currentUsers = getState().auth.users;
        if (
          !currentUsers.some(
            (user) =>
              user.id === updatedUser.id &&
              user.isLoggedIn === updatedUser.isLoggedIn
          )
        ) {
          dispatch(
            setUsers(
              currentUsers.map((user) =>
                user.id === updatedUser.id ? updatedUser : user
              )
            )
          );
        }
      });
    }
  }, [loggedOutSubData, dispatch]);

  useEffect(() => {
    if (queryError) {
      console.error("Error fetching users:", queryError);
    }
    if (subError) {
      console.error("Subscription error:", subError);
    }
  }, [queryError, subError]);

  return (
    <div className="mt-[100px] p-4">
      <h1 className="text-2xl font-bold mb-4">Users</h1>
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
            <p>Email: {user.email}</p>
            <p>Name: {user.name || "No name"}</p>
            <p>Created: {new Date(user.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
