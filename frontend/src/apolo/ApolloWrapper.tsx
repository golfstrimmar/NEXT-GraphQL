"use client";

<<<<<<< HEAD
import { ApolloProvider } from "@apollo/client";
=======
import { ApolloProvider, useApolloClient } from "@apollo/client";
>>>>>>> simple
import { client } from "./apolloClient";
import { Provider } from "react-redux";
import { store } from "@/app/redux/store";
import { GoogleOAuthProvider } from "@react-oauth/google";
<<<<<<< HEAD
=======
import { useEffect } from "react";
import { CHECK_TOKEN } from "@/apolo/queryes";

function TokenValidator() {
  const client = useApolloClient();

  useEffect(() => {
    const validateToken = async () => {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) return;

      try {
        const { data } = await client.query({
          query: CHECK_TOKEN,
          fetchPolicy: "network-only",
        });

        if (!data.checkToken) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/blog";
        }
      } catch (err) {
        console.error("Token validation error:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/blog";
      }
    };

    validateToken();
  }, [client]);

  return null;
}

>>>>>>> simple
export default function ApolloWrapper({ children }) {
  return (
    <ApolloProvider client={client}>
      <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
<<<<<<< HEAD
        <Provider store={store}>{children}</Provider>
=======
        <Provider store={store}>
          <TokenValidator />
          {children}
        </Provider>
>>>>>>> simple
      </GoogleOAuthProvider>
    </ApolloProvider>
  );
}
