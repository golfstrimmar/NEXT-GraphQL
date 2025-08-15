"use client";
import React, { useEffect } from "react";
import transformData from "@/hooks/useTransformData";
import Image from "next/image";
import { useStateContext } from "@/providers/StateProvider";
export default function Login() {
  const { user } = useStateContext();

  return (
    <div>
      {user && (
        <div className="mt-[150px]">
          <div className="container ">
            <div className="flex flex-col gap-4 items-center">
              {user.picture ? (
                <Image
                  src={user.picture}
                  alt={user.name}
                  width={200}
                  height={200}
                  className="rounded-full"
                />
              ) : (
                <Image
                  src="./svg/avatar.svg"
                  alt={user.name}
                  width={300}
                  height={300}
                  className="rounded-full"
                />
              )}

              <h2 className="!text-2xl">{user.name}</h2>
              <p>
                <small>Email:</small> <strong>{user.email}</strong>
              </p>
              <p>
                <small>Joined:</small>
                <strong> {transformData(user.createdAt)}</strong>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
