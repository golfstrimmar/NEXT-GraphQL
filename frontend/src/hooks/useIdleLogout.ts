"use client";
import { useEffect } from "react";
import { useStateContext } from "@/components/StateProvider";
import { LOGOUT_USER } from "@/apolo/mutations";
import { useMutation } from "@apollo/client";

const IDLE_TIMEOUT = 30 * 60 * 1000; // 30 минут
let timer: ReturnType<typeof setTimeout>;

const useIdleLogout = () => {
  const { setUser } = useStateContext();
  const [logoutUser, { loading }] = useMutation(LOGOUT_USER);
  useEffect(() => {
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        console.log("⏳ User idle. Logging out...");
        try {
          await logoutUser();
          setUser(null);
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          window.location.href = "/login";
        } catch (err) {
          console.error("Logout error:", err);
          console.log("------Failed to log out. Please try again.-------");
        }
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
