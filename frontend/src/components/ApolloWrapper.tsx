"use client";

import { ApolloProvider } from "@apollo/client";
import client from "../../lib/apolloClient";
import { Provider } from "react-redux";
import { store } from "@/app/redux/store";
import { GoogleOAuthProvider } from "@react-oauth/google";
export default function ApolloWrapper({ children }) {
  return (
    <ApolloProvider client={client}>
      <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
        <Provider store={store}>{children}</Provider>
      </GoogleOAuthProvider>
    </ApolloProvider>
  );
}
