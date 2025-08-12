import jwt from "jsonwebtoken";
import prisma from "../prisma/client.js";

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

export const context = async ({ req }) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "");

  if (!token) {
    return { prisma, currentUser: null };
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });
    return { prisma, currentUser: user };
  } catch (error) {
    return { prisma, currentUser: null };
  }
};
