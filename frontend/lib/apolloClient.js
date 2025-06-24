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

// Конфигурация
const GRAPHQL_URI =
  process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:4000/graphql";
const WS_URI =
  process.env.NEXT_PUBLIC_GRAPHQL_WS_URL || "ws://localhost:4000/graphql";

// Операции, требующие авторизации
const AUTH_REQUIRED_OPERATIONS = [
  "chats",
  "chat",
  "createChat",
  "sendMessage",
  "chatCreated",
  "messageSent",
];

// 1. HTTP линк
const httpLink = new HttpLink({ uri: GRAPHQL_URI });

// 2. Middleware для авторизации
const authLink = new ApolloLink((operation, forward) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  console.log(
    `🔍 [Apollo] Operation: ${operation.operationName || "unnamed"}, Token: ${
      token ? "present" : "missing"
    }`
  );

  // Прерываем только операции, требующие авторизации, если нет токена
  if (AUTH_REQUIRED_OPERATIONS.includes(operation.operationName) && !token) {
    console.warn(
      "⚠️ [Apollo] Skipping operation due to missing token:",
      operation.operationName
    );
    return null; // Прерываем запрос
  }

  operation.setContext({
    headers: {
      authorization: token ? `Bearer ${token}` : "",
    },
  });

  return forward(operation);
});

// 3. Обработчик ошибок
const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  console.log(
    `🔥 [Apollo] Error in operation: ${operation.operationName || "unnamed"}`
  );
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, extensions }) => {
      console.error(`[GraphQL error]: ${message}, Code: ${extensions?.code}`);
      if (extensions?.code === "UNAUTHENTICATED") {
        console.warn("🚨 [Apollo] Unauthenticated, redirecting to login...");
        handleAuthError();
      }
    });
  }
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
    if ("statusCode" in networkError && networkError.statusCode === 401) {
      console.warn("🚨 [Apollo] 401 Network error, redirecting to login...");
      handleAuthError();
    }
  }
});

// 4. Функция создания WebSocketLink
const createWsLink = () => {
  // Не создаём WebSocketLink, если нет токена или это серверный рендеринг
  if (typeof window === "undefined" || !localStorage.getItem("token")) {
    console.log(
      "🔒 [WebSocket] Skipping WebSocketLink creation: No token or server-side"
    );
    return null;
  }

  console.log("🌐 [WebSocket] Creating WebSocketLink");
  return new WebSocketLink({
    uri: WS_URI,
    options: {
      reconnect: true,
      reconnectionAttempts: 5, // Ограничиваем попытки переподключения
      reconnectionDelay: 10000, // Задержка 10 секунд
      connectionParams: () => {
        const token = localStorage.getItem("token");
        console.log(
          `🌐 [WebSocket] Attempting connection, Token: ${
            token ? "present" : "missing"
          }`
        );
        return { authorization: token ? `Bearer ${token}` : "" };
      },
      connectionCallback: (error, result) => {
        if (error) {
          console.error("🚨 [WebSocket] Connection error:", error.message);
        } else {
          console.log("✅ [WebSocket] Connected successfully!");
        }
        if (result) {
          console.log("📡 [WebSocket] Connection result:", result);
        }
      },
      lazy: true, // Подключаемся только при первой подписке
    },
    on: {
      connected: () => {
        console.log("🌐 [WebSocket] Socket connected");
      },
      closed: (event) => {
        console.warn(
          "🔌 [WebSocket] Socket closed:",
          event.reason || event.code
        );
      },
      error: (error) => {
        console.error("🚨 [WebSocket] Socket error:", error.message || error);
      },
      message: (message) => {
        console.log("📥 [WebSocket] Message received:", message);
        if (message.type === "connection_error") {
          console.error("🚨 [WebSocket] Connection error:", message.payload);
        }
      },
    },
  });
};

// 5. Функция обработки ошибок аутентификации
const handleAuthError = () => {
  if (typeof window !== "undefined") {
    console.log("🔒 [Apollo] Clearing token and redirecting to login");
    localStorage.removeItem("token");
    window.location.href = "/login?session_expired=1";
  }
};

// 6. Разделение линков
const getSplitLink = () => {
  const wsLink = createWsLink();
  return wsLink
    ? split(
        ({ query }) => {
          const definition = getMainDefinition(query);
          const isSubscription =
            definition.kind === "OperationDefinition" &&
            definition.operation === "subscription";
          console.log(
            `🔀 [Apollo] Operation type: ${definition.operation}, Using ${
              isSubscription ? "WebSocket" : "HTTP"
            }`
          );
          return isSubscription;
        },
        wsLink,
        authLink.concat(httpLink)
      )
    : authLink.concat(httpLink);
};

// 7. Создаем клиент
const client = new ApolloClient({
  link: ApolloLink.from([errorLink, authLink, getSplitLink()]),
  cache: new InMemoryCache(),
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
