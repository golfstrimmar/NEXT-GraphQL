import { ApolloClient, InMemoryCache, split } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { setContext } from "@apollo/client/link/context";
import { createUploadLink } from "apollo-upload-client";

// UploadLink вместо HttpLink для поддержки файлов
const uploadLink = createUploadLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
  credentials: "include", // для кук и авторизации
});

// Динамическое добавление токена и специальных заголовков для CSRF-защиты
const authLink = setContext((_, { headers }) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : "";
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : "",
      "x-apollo-operation-name": "general", // чтобы предотвратить CSRF блокировки
    },
  };
});

// WebSocket-соединение для подписок
const wsLink =
  typeof window !== "undefined"
    ? new GraphQLWsLink(
        createClient({
          url: process.env.NEXT_PUBLIC_GRAPHQL_WS_URL,
          connectionParams: () => {
            const token = localStorage.getItem("token");
            return {
              Authorization: token ? `Bearer ${token}` : "",
            };
          },
        })
      )
    : null;

// Разделяем HTTP(S)/Upload и WS ссылки
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
      authLink.concat(uploadLink)
    )
  : authLink.concat(uploadLink);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

export default client;
