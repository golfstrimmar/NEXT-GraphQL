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
      <div className="mt-[80px] w-full">All users</div>

      <ul>
        {users &&
          users.map((u) => (
            <li key={u.id}>
              {u.name} ({u.email}) ({transformData(u.createdAt)}){u.projects}
            </li>
          ))}
      </ul>
    </div>
  );
}
