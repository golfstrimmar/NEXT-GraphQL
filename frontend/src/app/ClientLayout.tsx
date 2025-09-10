// app/ClientLayout.tsx — клиентский
"use client";

import { useEffect } from "react";
import Navbar from "@/components/Navbar/Navbar";
import { StateProvider } from "@/providers/StateProvider";
import { ApolloProv } from "@/providers/ApoloProvider";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { trackUserActivity, clearStorageOnExit } from "@/utils/lastActivity";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    trackUserActivity();
    clearStorageOnExit();
    checkInactivity();
    const interval = setInterval(checkInactivity, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <GoogleOAuthProvider
      clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}
    >
      <ApolloProv>
        <StateProvider>
          <Navbar />
          {children}
        </StateProvider>
      </ApolloProv>
    </GoogleOAuthProvider>
  );
}

function checkInactivity(timeout = 30 * 60 * 1000) {
  const last = localStorage.getItem("lastActivity");
  if (!last) return;

  if (Date.now() - parseInt(last) > timeout) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("lastActivity");
    window.location.href = "/login";
  }
}
