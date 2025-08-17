"use client";
import React, { useEffect, useState } from "react";
// import { useQuery, useSubscription } from "@apollo/client";
// import { GET_USERS } from "@/apollo/queries";
// import { USER_CREATED } from "@/apollo/subscriptions";
import transformData from "@/hooks/useTransformData";
import { useStateContext } from "@/providers/StateProvider";
export default function Users() {
  const { users } = useStateContext();
  return (
    <div className="container ">
      <ul className="mt-[150px] ">
        {users &&
          users.map((u) => (
            <li
              key={u.id}
              className="mt-2 flex flex-col gap-1 border rounded p-2"
            >
              <span>id: {u.id}</span>
              <h3>Name: {u.name}</h3>
              <p>Email: {u.email}</p>
              <p>CreatedAt: {transformData(u.createdAt)}</p>
              <h4>Projects:</h4>
              <ul className="pl-4">
                {u.projects.map((p) => (
                  <li key={p.id}>
                    {p.id}: {p.name}
                  </li>
                ))}
              </ul>
            </li>
          ))}
      </ul>
    </div>
  );
}
