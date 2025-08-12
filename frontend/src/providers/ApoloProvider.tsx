"use client";

import { ApolloProvider } from "@apollo/client";
import client from "@/apolo/apolloClient";

export function ApolloProv({ children }) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
