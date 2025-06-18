"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useQuery, useSubscription } from "@apollo/client";
import { gql } from "@apollo/client";

const GET_USERS = gql`
  query GetUsers {
    allUsers {
      id
      email
      name
      googleId
      createdAt
    }
  }
`;

const USERS_UPDATED_SUBSCRIPTION = gql`
  subscription UsersUpdated {
    usersUpdated {
      id
      email
      name
      googleId
      createdAt
    }
  }
`;

export default function Home() {
  const { data, loading, error } = useQuery(GET_USERS);

  const { data: subscriptionData, error: subscriptionError } = useSubscription(
    USERS_UPDATED_SUBSCRIPTION,
    {
      onSubscriptionData: ({ client, subscriptionData }) => {
        if (subscriptionData?.data?.usersUpdated) {
          console.log("Данные подписки:", subscriptionData.data.usersUpdated);
          client.writeQuery(
            { query: GET_USERS },
            {
              allUsers: subscriptionData.data.usersUpdated,
            }
          );
        } else {
          console.warn("Некорректные данные подписки:", subscriptionData);
        }
      },
      onError: (err) => console.error("Ошибка подписки:", err),
    }
  );

  return (
    <div className="font-[family-name:var(--font-geist-sans)] min-h-screen bg-gray-100">
      <main className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Users:</h1>
        {loading && <p className="text-center">Loading...</p>}
        {error && (
          <p className="text-center text-red-500">Error: {error.message}</p>
        )}
        {data && data.allUsers && (
          <ul className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {data.allUsers.map((user) => (
              <li
                key={user.id}
                className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <p className="text-sm text-gray-500">ID: {user.id}</p>
                {user.name && <p className="text-gray-600">{user.name}</p>}
                <p className="text-gray-600">E-mail: {user.email}</p>
                {user.googleId && (
                  <p className="text-sm text-gray-500">
                    Google ID: {user.googleId}
                  </p>
                )}

                <p className="text-sm text-gray-500">
                  Created At:{" "}
                  {new Date(user.createdAt).toLocaleDateString("de-DE", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </p>
              </li>
            ))}
          </ul>
        )}
        {!loading && data && data.allUsers.length === 0 && (
          <p className="text-center text-gray-500"> Users not found</p>
        )}
      </main>
    </div>
  );
}
