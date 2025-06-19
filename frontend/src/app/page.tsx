"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useQuery, useSubscription, gql } from "@apollo/client";

const GET_USERS = gql`
  query GetUsers {
    users {
      id
      email
      name
      createdAt
    }
  }
`;
const USER_CREATED_SUBSCRIPTION = gql`
  subscription OnUserCreated {
    userCreated {
      id
      email
      name
      createdAt
    }
  }
`;
export default function UsersList() {
  const { loading, error, data } = useQuery(GET_USERS);
  const { data: subData } = useSubscription(USER_CREATED_SUBSCRIPTION);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (subData) {
      console.log("🔥 Новый пользователь по подписке:", subData);
    }
  }, [subData]);

  useEffect(() => {
    if (data) {
      console.log("<==== data====>", data.users);
    }
  }, [data]);

  useEffect(() => {
    if (data?.users) {
      setUsers(data.users);
    }
  }, [data]);

  useEffect(() => {
    if (subData?.userCreated) {
      const newUser = subData.userCreated;
      setUsers((prev) => {
        const exists = prev.some((u) => u.id === newUser.id);
        return exists ? prev : [newUser, ...prev];
      });
    }
  }, [subData]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="space-y-4 mt-4">
      <h2 className="text-xl font-bold">Users</h2>
      <ul className="flex flex-col gap-2 p-2 ">
        {users &&
          users.map((user) => (
            <li key={user.id} className="p-2 border border-slate-300">
              <div className="flex items-center space-x-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.name || "No name"}
                  </p>
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
}
