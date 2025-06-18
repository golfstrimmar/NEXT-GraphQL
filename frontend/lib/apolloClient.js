import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { split } from "@apollo/client";
import { createClient } from "graphql-ws";

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:4000/graphql",
  headers: {
    "Content-Type": "application/json",
  },
});

const wsLink =
  typeof window !== "undefined"
    ? new GraphQLWsLink(
        createClient({
          url:
            process.env.NEXT_PUBLIC_GRAPHQL_WS_URL ||
            "ws://localhost:4000/graphql",
          shouldRetry: () => true,
          retryAttempts: 10,
          retryWait: async () =>
            new Promise((resolve) => setTimeout(resolve, 1000)),
        })
      )
    : null;

const splitLink =
  typeof window !== "undefined" && wsLink
    ? split(
        ({ query }) => {
          const definition = getMainDefinition(query);
          return (
            definition.kind === "OperationDefinition" &&
            definition.operation === "subscription"
          );
        },
        wsLink,
        httpLink
      )
    : httpLink;

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

export default client;
