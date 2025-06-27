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
    } catch (err) {
      console.error("Ошибка верификации токена:", err);
    }
  }

  const pubsub = {
    events: {},
    publish(event, data) {
      console.log(`Публикация события ${event}:`, data);
      if (this.events[event]) {
        try {
          this.events[event].forEach((callback) => callback(data));
        } catch (err) {
          console.error(`Ошибка при публикации ${event}:`, err);
        }
      } else {
        console.warn(`Нет подписчиков для события ${event}`);
      }
    },
    subscribe(event, callback) {
      console.log(`Подписка на событие ${event}`);
      if (!this.events[event]) {
        this.events[event] = [];
      }
      this.events[event].push(callback);
      return () => {
        console.log(`Отписка от события ${event}`);
        this.events[event] = this.events[event].filter((cb) => cb !== callback);
      };
    },
    asyncIterator(events) {
      console.log(`Создание итератора для событий:`, events);
      return {
        async next() {
          return new Promise((resolve, reject) => {
            const unsubscribe = this.subscribe(events[0], (value) => {
              resolve({ value, done: false });
            });
            return () => {
              unsubscribe();
              reject(new Error("Итератор закрыт"));
            };
          });
        },
        async return() {
          console.log(`Закрытие итератора для событий:`, events);
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
