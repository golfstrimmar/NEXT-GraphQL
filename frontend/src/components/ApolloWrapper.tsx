"use client";

import { ApolloProvider } from "@apollo/client";
import client from "../../lib/apolloClient";
import { Provider } from "react-redux";
import { store } from "@/app/redux/store";

export default function ApolloWrapper({ children }) {
  return (
    <ApolloProvider client={client}>
      <Provider store={store}>{children}</Provider>
    </ApolloProvider>
  );
}
