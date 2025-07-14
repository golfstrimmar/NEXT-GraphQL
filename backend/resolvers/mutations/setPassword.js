import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

export const setPassword = async (_, { email, newPassword }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");
  if (user.password) throw new Error("Password already set");

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

  return await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });
};

export default setPassword;
