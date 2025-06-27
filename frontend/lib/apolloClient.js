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

// Константы
const GRAPHQL_URI = "http://localhost:4000/graphql";
const WS_URI = "ws://localhost:4000/graphql";

// HTTP link
const httpLink = new HttpLink({ uri: GRAPHQL_URI });

// WebSocket client (graphql-ws)
const wsClient = createClient({
  url: WS_URI,
  connectionParams: {},
  on: {
    connected: () => console.log("✅ [WebSocket] Connected successfully"),
    closed: (event) =>
      console.log(`⚠️ [WebSocket] Disconnected (${event.code})`),
  },
});

// GraphQLWsLink
const wsLink = new GraphQLWsLink(wsClient);

// Логгер
const loggerLink = new ApolloLink((operation, forward) => {
  console.log(`🔍 [Apollo] Operation: ${operation.operationName || "unnamed"}`);
  return forward(operation).map((response) => {
    if (operation.operationName === "OnUserCreated") {
      console.log(
        `📡 [Subscription] Data for ${operation.operationName}:`,
        response
      );
    }
    return response;
  });
});

// Разделение HTTP / WS
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);

// Apollo Client
const client = new ApolloClient({
  link: ApolloLink.from([loggerLink, splitLink]),
  cache: new InMemoryCache(),
});

export { client, wsClient };
