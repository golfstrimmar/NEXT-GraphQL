"use client";

import { useEffect } from "react";
import Navbar from "@/components/Navbar/Navbar";
import { StateProvider } from "@/providers/StateProvider";
import { ApolloProv } from "@/providers/ApoloProvider";
import { GoogleOAuthProvider } from "@react-oauth/google";
import ColorsButton from "@/components/ColorsButton/ColorsButton";
export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const TIMEOUT = 30 * 60 * 1000;

    // Проверка на момент загрузки
    const last = localStorage.getItem("lastActivity");
    if (last && Date.now() - parseInt(last) > TIMEOUT) {
      clearStorage();
      return;
    }

    // Обновление lastActivity при активности пользователя
    const events = ["mousemove", "click", "keydown", "scroll"];
    const updateActivity = () => {
      localStorage.setItem("lastActivity", Date.now().toString());
    };
    events.forEach((event) => window.addEventListener(event, updateActivity));

    // Проверка на неактивность каждую минуту
    const interval = setInterval(() => {
      const last = localStorage.getItem("lastActivity");
      if (last && Date.now() - parseInt(last) > TIMEOUT) {
        clearStorage();
      }
    }, 60 * 1000);

    // Очистка при размонтировании
    return () => {
      clearInterval(interval);
      events.forEach((event) =>
        window.removeEventListener(event, updateActivity)
      );
    };
  }, []);

  const clearStorage = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("lastActivity");
    window.location.href = "/login";
  };

  return (
    <GoogleOAuthProvider
      clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}
    >
      <ApolloProv>
        <StateProvider>
          <Navbar />
          {/* <ColorsButton></ColorsButton> */}
          {children}
        </StateProvider>
      </ApolloProv>
    </GoogleOAuthProvider>
  );
}
