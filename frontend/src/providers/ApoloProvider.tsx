"use client";

import { ApolloProvider } from "@apollo/client";
import client from "@/apollo/apolloClient";

export function ApolloProv({ children }) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
