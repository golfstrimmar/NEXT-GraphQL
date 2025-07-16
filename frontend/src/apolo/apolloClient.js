// Импорты
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

// Константы
const GRAPHQL_URI = "http://localhost:4000/graphql";
const WS_URI = "ws://localhost:4000/graphql";

// 🛡️ Список операций, требующих токена
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
];

// ✅ HTTP link
const httpLink = new HttpLink({ uri: GRAPHQL_URI });

// ✅ Авторизационный линк для HTTP
const authLink = setContext((operation, { headers }) => {
  const operationName = operation.operationName;
  const isProtected = protectedOperations.includes(operationName);

  if (!isProtected) {
    return { headers };
  }

  const token = localStorage.getItem("token");
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
});

// ✅ Обработка ошибок
const errorLink = onError(({ graphQLErrors, networkError }) => {
  graphQLErrors?.forEach(({ message }) => {
    if (message === "TokenExpired") {
      console.log("❗ Token expired, logging out user...");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/blog";
    }
  });

  if (networkError) {
    console.error("Network error:", networkError);
  }
});

// ✅ WebSocket client (graphql-ws)
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

// ✅ GraphQLWsLink для подписок
const wsLink = new GraphQLWsLink(wsClient);

// ✅ Логгер (по желанию)
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

// ✅ Разделение: HTTP ↔️ WebSocket
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

// ✅ Apollo Client
const client = new ApolloClient({
  link: ApolloLink.from([errorLink, loggerLink, splitLink]),
  cache: new InMemoryCache(),
});

export { client, wsClient };
