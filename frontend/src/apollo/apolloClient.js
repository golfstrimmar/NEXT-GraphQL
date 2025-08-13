import { ApolloClient, InMemoryCache, split, HttpLink } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";

// HTTP-соединение для обычных запросов
const httpLink = new HttpLink({
  uri: "http://localhost:4000/graphql",
});

// WebSocket-соединение для подписок
const wsLink =
  typeof window !== "undefined"
    ? new GraphQLWsLink(
        createClient({
          url: "ws://localhost:4000/graphql",
          connectionParams: {
            // Можно передать токен авторизации, если нужно
            // authorization: localStorage.getItem("token"),
          },
        })
      )
    : null;

// Разделяем HTTP и WebSocket в зависимости от типа операции
const splitLink = wsLink
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

// Создаём Apollo Client
const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

export default client;
