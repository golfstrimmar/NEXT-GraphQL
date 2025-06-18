import { PrismaClient } from "@prisma/client";
import pkg from "jsonwebtoken";
import "dotenv/config";

const { verify } = pkg;
const prisma = new PrismaClient();

export async function createContext({ req, connection }) {
  const token = (
    req?.headers.authorization ||
    connection?.context.authorization ||
    ""
  ).replace("Bearer ", "");
  let user = null;

  if (token) {
    try {
      const { userId } = verify(token, process.env.JWT_SECRET);
      user = await prisma.user.findUnique({ where: { id: userId } });
    } catch {}
  }

  const pubsub = {
    events: {},
    publish(event, data) {
      if (this.events[event]) {
        this.events[event].forEach((callback) => callback(data));
      }
    },
    subscribe(event, callback) {
      if (!this.events[event]) this.events[event] = [];
      this.events[event].push(callback);
      return () => {
        this.events[event] = this.events[event].filter((cb) => cb !== callback);
      };
    },
    asyncIterator(events) {
      return {
        async next() {
          return new Promise((resolve) => {
            const unsubscribe = this.subscribe(events[0], (value) =>
              resolve({ value, done: false })
            );
            return () => unsubscribe();
          });
        },
        async return() {
          return { done: true };
        },
        [Symbol.asyncIterator]() {
          return this;
        },
      };
    },
  };

  return { user, pubsub };
}
