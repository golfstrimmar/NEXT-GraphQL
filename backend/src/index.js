import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { typeDefs, resolvers } from "./schema.js";

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

async function start() {
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
    context: async ({ req }) => ({
      headers: req.headers,
    }),
    cors: {
      origin: ["http://localhost:3001"],
      credentials: true,
    },
  });

  console.log(`🚀 Server ready at ${url}`);
}

start();
