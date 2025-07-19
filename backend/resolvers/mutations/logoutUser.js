import { PrismaClient } from "@prisma/client";
import { pubsub, USER_LOGGEDOUT } from "./../../utils/pubsub.js";
const prisma = new PrismaClient();

export const logoutUser = async (_, __, { userId }) => {
  if (!userId) throw new Error("Not authenticated");

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { isLoggedIn: false },
  });
  console.log("To subscribe logout  🟢-->");
  pubsub.publish(USER_LOGGEDOUT, {
    userLoggedOut: updatedUser,
  });

  return true;
};

export default logoutUser;
