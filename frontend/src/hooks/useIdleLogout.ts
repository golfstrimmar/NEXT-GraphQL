"use client";
import { useEffect } from "react";
import { useStateContext } from "@/components/StateProvider";

const IDLE_TIMEOUT = 30 * 60 * 1000; // 30 минут
let timer: ReturnType<typeof setTimeout>;

const useIdleLogout = () => {
  const { setUser } = useStateContext();

  useEffect(() => {
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        console.log("⏳ User idle. Logging out...");
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        window.location.href = "/login";
      }, IDLE_TIMEOUT);
    };

    // Обёртка, которую можно удалить
    const handleActivity = (event: Event) => {
      // console.log("<==== event ====>", event.type);
      resetTimer();
    };

    const activityEvents = [
      "mousemove",
      "keydown",
      "scroll",
      "click",
      "touchstart",
    ];

    activityEvents.forEach((event) =>
      window.addEventListener(event, handleActivity)
    );

    resetTimer();

    return () => {
      activityEvents.forEach((event) =>
        window.removeEventListener(event, handleActivity)
      );
      clearTimeout(timer);
    };
  }, []);
};

export default useIdleLogout;
