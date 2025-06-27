"use client";

import React from "react";
import { useSubscription, gql } from "@apollo/client";

const USER_CREATED_SUBSCRIPTION = gql`
  subscription OnUserCreated {
    userCreated {
      id
      email
      name
    }
  }
`;

export default function UserSubscription() {
  const { data, loading, error } = useSubscription(USER_CREATED_SUBSCRIPTION);
  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>Ошибка: {error.message}</p>;
  return (
    <div>
      <h2>Новые пользователи</h2>
      {data?.userCreated ? (
        <p>Новый пользователь: {data.userCreated.email}</p>
      ) : (
        <p>Ожидание новых пользователей...</p>
      )}
    </div>
  );
}
