"use client";
import React, { useEffect, useState } from "react";
import { useQuery, useSubscription } from "@apollo/client";
import { GET_USERS } from "@/apollo/queries";
import { USER_CREATED } from "@/apollo/subscriptions";
export default function Users() {
  const { data, loading, error } = useQuery(GET_USERS);
  const { data: subData } = useSubscription(USER_CREATED);
  const [users, setUsers] = useState([]);
  useEffect(() => {
    if (data?.users) {
      setUsers(data.users);
    }
  }, [data]);
  useEffect(() => {
    if (subData?.userCreated) {
      console.log("<====subData?.userCreated====>", subData?.userCreated);
      setUsers((prev) => [...prev, subData.userCreated]);
    }
  }, [subData]);
  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>Ошибка: {error.message}</p>;
  return (
    <div className="container ">
      <div className="mt-[80px] w-full">All users</div>

      <ul>
        {users.map((u) => (
          <li key={u.id}>
            {u.name} ({u.email})
          </li>
        ))}
      </ul>
    </div>
  );
}
