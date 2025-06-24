import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
  split,
} from "@apollo/client";
import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { onError } from "@apollo/client/link/error";

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:4000/graphql",
});

const authLink = new ApolloLink((operation, forward) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  operation.setContext({
    headers: {
      authorization: token ? `Bearer ${token}` : "",
    },
  });
  return forward(operation);
});

const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${JSON.stringify(
          locations
        )}, Path: ${path}`
      );

      // Обработка ошибки аутентификации
      if (
        message.includes("Authentication") ||
        message.includes("Invalid token")
      ) {
        console.error("Authentication error detected");
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          // Перенаправляем на страницу входа только если это не SSR
          if (typeof window !== "undefined") {
            window.location.href = "/login?error=auth";
          }
        }
      }
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);

    // Обработка ошибок сети, связанных с аутентификацией
    if (
      networkError.message.includes("Authentication") ||
      networkError.message.includes("401")
    ) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        window.location.href = "/login?error=network";
      }
    }
  }
});

const wsLink =
  typeof window !== "undefined"
    ? new WebSocketLink({
        uri:
          process.env.NEXT_PUBLIC_GRAPHQL_WS_URL ||
          "ws://localhost:4000/graphql",
        options: {
          reconnect: true,
          connectionParams: () => {
            const token = localStorage.getItem("token");
            return token ? { authorization: `Bearer ${token}` } : {};
          },
          connectionCallback: (error) => {
            if (error) {
              console.error("WebSocket connection error:", error);
              // Обработка ошибки аутентификации при подключении
              if (
                error.message.includes("Authentication") ||
                error.message.includes("Invalid token")
              ) {
                localStorage.removeItem("token");
                window.location.href = "/login?error=ws";
              }
            } else {
              console.log("✅ WebSocket connected");
            }
          },
          onError: (error) => {
            console.error("WebSocket error:", error);
            // Обработка ошибок во время работы WebSocket
            if (
              error.message.includes("Authentication") ||
              error.message.includes("Invalid token")
            ) {
              localStorage.removeItem("token");
              window.location.href = "/login?error=ws";
            }
          },
        },
      })
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
        authLink.concat(httpLink)
      )
    : authLink.concat(httpLink);

const client = new ApolloClient({
  link: ApolloLink.from([authLink, splitLink, errorLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          chats: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network",
      errorPolicy: "all",
    },
    query: {
      fetchPolicy: "network-only",
      errorPolicy: "all",
    },
    mutate: {
      errorPolicy: "all",
    },
  },
});

export default client;
