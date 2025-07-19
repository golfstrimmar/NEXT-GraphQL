import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "your_refresh_secret_here";

export function createTokens(user) {
  const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ userId: user.id }, REFRESH_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
}
