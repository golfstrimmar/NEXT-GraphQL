"use client";

import { useState, useEffect } from "react";
import transformData from "@/hooks/useTransformData";
import { useStateContext } from "@/providers/StateProvider";
type Project = {
  id: string;
  name: string;
};

type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  projects?: Project[];
};

export default function UsersList({ initialUsers }: { initialUsers: User[] }) {
  const { users } = useStateContext();
  const [usersToShow, setUsersToShow] = useState<User[]>(initialUsers);

  useEffect(() => {
    setUsersToShow(users);
  }, [users]);
  return (
    <div className="container">
      <ul className="mt-[150px]">
        {usersToShow &&
          usersToShow?.map((u) => (
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
                {u.projects?.map((p) => (
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
