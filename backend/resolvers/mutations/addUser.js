import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { pubsub, USER_CREATED } from "./../../utils/pubsub.js";

const SALT_ROUNDS = 10;
const prisma = new PrismaClient();
export const addUser = async (_, { email, name, password, googleId }) => {
  let hashedPassword = null;
  if (password) {
    hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  }

  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      googleId,
    },
  });

  console.log("User created 🟢 --> ", user);
  pubsub.publish(USER_CREATED, { userCreated: user });

  return user;
};
