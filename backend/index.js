import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
// 1. GraphQL схема
const typeDefs = `
type Message {
id: Int!
text: String!
createdAt: String!
}
type Query {
messages: [Message!]!
}
type Mutation {
createMessage(text: String!): Message!
}
`;
// 2. Резолверы
const resolvers = {
  Query: {
    messages: async () => {
      return await prisma.message.findMany({ orderBy: { id: "desc" } });
    },
  },
  Mutation: {
    createMessage: async (_, { text }) => {
      return await prisma.message.create({
        data: { text },
      });
    },
  },
};
// 3. Создаём схему
const schema = makeExecutableSchema({ typeDefs, resolvers });
// 4. Запуск сервера
const server = new ApolloServer({ schema });
const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});
console.log(`🚀 Server ready at: ${url}`);
