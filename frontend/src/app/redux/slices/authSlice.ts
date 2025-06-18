import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Интерфейс пользователя
interface User {
  id: number;
  userName: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

// Интерфейс состояния авторизации
interface AuthState {
  user: User | null;
  token: string | null;
  users: User[];
  onlineUsers: number[];
}

// Начальное состояние без обращения к localStorage
const initialState: AuthState = {
  user: null,
  token: null,
  users: [],
  onlineUsers: [],
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      // Проверяем доступность localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(action.payload.user));
        localStorage.setItem("token", action.payload.token);
      }
    },
    clearUser: (state) => {
      state.user = null;
      state.token = null;
      // Проверяем доступность localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    },
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
    },
    setOnlineUsers: (state, action: PayloadAction<number[]>) => {
      state.onlineUsers = action.payload;
    },

    addUser: (state, action: PayloadAction<User>) => {
      state.users.push(action.payload);
    },
  },
});

export const { setUser, clearUser, setUsers, addUser, setOnlineUsers } = authSlice.actions;
export default authSlice.reducer;
