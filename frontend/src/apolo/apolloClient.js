import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
  split,
} from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";

// const GRAPHQL_URI = "http://localhost:4000/graphql";
// const WS_URI = "ws://localhost:4000/graphql";
const GRAPHQL_URI = process.env.NEXT_PUBLIC_GRAPHQL_URL;
const WS_URI = process.env.NEXT_PUBLIC_GRAPHQL_WS_URL;

const protectedOperations = [
  "logoutUser",
  "deleteUser",
  "GetUserChats",
  "createChat",
  "sendMessage",
  "deleteMessage",
  "deleteChat",
  "createPost",
  "deletePost",
  "likePost",
  "disLikePost",
  "addComment",
  "deleteComment",
  "likeComment",
  "dislikeComment",
  "updatePost",
  "checkToken",
];

const httpLink = new HttpLink({ uri: GRAPHQL_URI });

const authLink = setContext((operation, { headers }) => {
  const operationName = operation.operationName;
  const isProtected = protectedOperations.includes(operationName);

  if (!isProtected) {
    return { headers };
  }

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  graphQLErrors?.forEach(({ message }) => {
    if (message === "TokenExpired" || message === "UserLoggedOut") {
      console.log("❗ Token invalid or user logged out, logging out...");
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/blog";
      }
    }
  });

  if (networkError) {
    console.error("Network error:", networkError);
  }
});

const wsClient = createClient({
  url: WS_URI,
  connectionParams: () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      return {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      };
    }
    return {};
  },
  on: {
    connected: () => console.log("✅ [WebSocket] Connected successfully"),
    closed: (event) =>
      console.log(`⚠️ [WebSocket] Disconnected (${event.code})`),
    error: (error) => {
      console.error("🔥 [WebSocket] Error:", error);
    },
  },
});

const wsLink = new GraphQLWsLink(wsClient);

const loggerLink = new ApolloLink((operation, forward) => {
  console.log("🔍 [Apollo] Operation:", {
    name: operation.operationName,
  });
  return forward(operation).map((response) => {
    if (operation.operationName?.startsWith("user")) {
      console.log(
        `📡 [Subscription] Data for ${operation.operationName}:`,
        response
      );
    }
    return response;
  });
});

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  authLink.concat(httpLink)
);

const client = new ApolloClient({
  link: ApolloLink.from([errorLink, loggerLink, splitLink]),
  cache: new InMemoryCache(),
});

export { client, wsClient };
