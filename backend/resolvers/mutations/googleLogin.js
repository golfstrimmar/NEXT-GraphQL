import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { PrismaClient } from "@prisma/client";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
const prisma = new PrismaClient();
import { pubsub, USER_LOGGEDIN, USER_CREATED } from "./../../utils/pubsub.js";
export const googleLogin = async (_, { idToken }) => {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error("Invalid Google token");
    }

    const { email, name, sub: googleId, picture } = payload;
    console.log("<========>", picture);
    if (!email) {
      throw new Error("Email not provided by Google");
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          password: "",
          googleId,
          isLoggedIn: true,
          picture: picture || "",
        },
      });
      pubsub.publish(USER_CREATED, { userCreated: user });
      pubsub.publish(USER_LOGGEDIN, { userLogin: user });
      console.log("<==== user created via Google ====>", user);
    } else {
      user = await prisma.user.update({
        where: { email },
        data: {
          name: name || user.name,
          isLoggedIn: true,
          googleId: user.googleId || googleId,
          picture: picture || "",
        },
      });

      console.log("<==== 🟢 user logged in via Google update ====>", user);
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "1h",
    });

    console.log("To subscribe userLogin  🟢-->");
    pubsub.publish(USER_LOGGEDIN, { userLogin: user });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      isLoggedIn: true,
      picture: picture || "",
      token,
    };
  } catch (err) {
    console.error("Google login error:", err);
    throw new Error("Failed to authenticate with Google");
  }
};

export default googleLogin;
