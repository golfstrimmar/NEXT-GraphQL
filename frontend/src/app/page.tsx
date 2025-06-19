"use client";
import { gql, useSubscription, useMutation, useQuery } from "@apollo/client";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "@/app/redux/slices/authSlice";

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
  const { data: queryData, loading: queryLoading } = useQuery(GET_USERS);
  const { data: subData, error: subError } = useSubscription(
    USER_CREATED_SUBSCRIPTION
  );
  const { data: loggedInSubData } = useSubscription(
    USER_LOGGED_IN_SUBSCRIPTION
  );
  const { data: loggedOutSubData } = useSubscription(
    USER_LOGGED_OUT_SUBSCRIPTION
  );

  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (queryData?.users) setUsers(queryData.users);
  }, [queryData]);

  useEffect(() => {
    if (subData?.userCreated) {
      console.log("<====userCreated====>", subData?.userCreated);
      setUsers((prev) => {
        const newUser = subData.userCreated;
        const exists = prev.some((u) => u.id === newUser.id);
        return exists ? prev : [...prev, newUser];
      });
    }
  }, [subData]);

  useEffect(() => {
    if (loggedInSubData?.userLoggedIn) {
      console.log("<====userLoggedIn====>", loggedInSubData?.userLoggedIn);
      localStorage.setItem(
        "user",
        JSON.stringify(loggedInSubData.userLoggedIn)
      );
      // localStorage.setItem("token", data.token);
      dispatch(setUser(loggedInSubData.userLoggedIn));

      setUsers((prev) => {
        const newUser = loggedInSubData.userLoggedIn;
        return prev.map((user) =>
          user.id === newUser.id ? { ...user, isLoggedIn: true } : user
        );
      });
    }
  }, [loggedInSubData]);

  useEffect(() => {
    if (loggedOutSubData?.userLoggedOut) {
      console.log("<====userLoggedOut====>", loggedOutSubData?.userLoggedOut);
      setUsers((prev) => {
        const updatedUser = loggedOutSubData.userLoggedOut;
        return prev.map((user) =>
          user.id === updatedUser.id ? { ...user, isLoggedIn: false } : user
        );
      });
    }
  }, [loggedOutSubData]);

  return (
    <div className="mt-[100px] p-4">
      <h1 className="text-2xl font-bold mb-4">Users</h1>
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
