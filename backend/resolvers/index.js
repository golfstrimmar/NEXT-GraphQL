import Query from "./queryResolvers.js";
import Mutation from "./mutationResolvers.js";
import Subscription from "./subscriptionResolvers.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const resolvers = {
  Query,
  Mutation,
  Subscription,
};

export default resolvers;
