import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pubsub, USER_LOGGEDIN } from "./../../utils/pubsub.js";

const JWT_SECRET = process.env.JWT_SECRET;
const prisma = new PrismaClient();
export const loginUser = async (_, { email, password }) => {
  console.log("====> mutation login user", email, password);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");
  if (!user.password) {
    throw new Error("GoogleOnlyAccount");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password || "");
  if (!isPasswordValid) throw new Error("Invalid password");

  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: "1h",
  });

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { isLoggedIn: true },
  });

  console.log(" To subscribe login   🟢--> ");
  pubsub.publish(USER_LOGGEDIN, { userLogin: updatedUser });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    isLoggedIn: true,
    token,
  };
};

export default loginUser;
