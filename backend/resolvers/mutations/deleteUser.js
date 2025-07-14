import { pubsub, USER_DELETED } from "./../../utils/pubsub.js";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const deleteUser = async (_, { id }) => {
  console.log("====> delete user", id);
  const user = await prisma.user.delete({ where: { id } });
  console.log(" To subscribe  userDeleted  🟢--> ", user);
  pubsub.publish(USER_DELETED, { userDeleted: user });
  return user;
};

export default deleteUser;
