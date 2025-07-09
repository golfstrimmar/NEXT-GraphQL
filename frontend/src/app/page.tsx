"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useMutation } from "@apollo/client";
import { LOGOUT_USER } from "@/apolo/mutations";
import useUserChatSubscriptions from "@/hooks/useUserChatSubscriptions";

import { useStateContext } from "@/components/StateProvider";
import useIdleLogout from "@/hooks/useIdleLogout";
import isTokenExpired from "@/utils/checkTokenExpiration";
export default function Users() {
  const router = useRouter();
  const { user, setUser } = useStateContext();

  useIdleLogout();
  const [logoutUser] = useMutation(LOGOUT_USER);

  // ===============================
  useUserChatSubscriptions(null);

  // ===============================
  const handleActivity = async () => {
    try {
      await logoutUser();
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      router.push("/login");
    } catch (err) {
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      console.error("Logout error:", err);
      console.log("------Failed to log out. Please try again.-------");
    }
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      const token = localStorage.getItem("token");
      if (token && isTokenExpired(token)) {
        handleActivity();
      }
    }, 600 * 1000);

    return () => clearInterval(intervalId);
  }, []);
  // ===============================

  return (
    <div className="container ">
      <div className="mt-[80px] w-full">Home</div>
    </div>
  );
}
