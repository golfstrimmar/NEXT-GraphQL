import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { del } from "framer-motion/m";

// Интерфейс пользователя
interface User {
  id: number;
  email: string;
  name: string | null;
  avatar?: string;
  createdAt: string;
  isLoggedIn?: boolean;
}

// Интерфейс для AuthPayload из мутации loginUser
interface AuthPayload {
  id: string;
  email: string;
  name: string | null;
  token: string;
  isLoggedIn: boolean;
  createdAt: string;
}

// Интерфейс состояния авторизации
interface AuthState {
  user: User | null;
  token: string | null;
  users: User[];
  onlineUsers: number[];
}

// Начальное состояние с загрузкой из localStorage
const initialState: AuthState = {
  user:
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "null")
      : null,
  token:
    typeof window !== "undefined"
      ? localStorage.getItem("token") || null
      : null,
  users: [],
  onlineUsers: [],
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<AuthPayload>) => {
      state.user = {
        id: Number(action.payload.id),
        email: action.payload.email,
        name: action.payload.name,
        createdAt: action.payload.createdAt,
        isLoggedIn: action.payload.isLoggedIn,
      };
      state.token = action.payload.token;
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(state.user));
        localStorage.setItem("token", action.payload.token);
      }
    },
    clearUser: (state) => {
      state.user = null;
      state.token = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    },
    setUsers: (state, action: PayloadAction<User[]>) => {
      console.log("<=== REDUX Users from server =====>", action.payload);
      state.users = action.payload;
    },
    setOnlineUsers: (state, action: PayloadAction<number[]>) => {
      state.onlineUsers = action.payload;
    },
    addUser: (state, action) => {
      const exists = state.users.some((user) => user.id === action.payload.id);
      if (!exists) {
        state.users.push(action.payload);
      } else {
        state.users = state.users.map((user) =>
          user.id === action.payload.id ? { ...user, isLoggedIn: true } : user
        );
      }
    },
    deleteUserFromRedux: (state, action: PayloadAction<number>) => {
      state.users = state.users.filter((user) => user.id !== action.payload);
    },

    updateUserStatus: (
      state,
      action: PayloadAction<{ id: number; status: boolean }>
    ) => {
      console.log("<=== REDUX update user status =====>", action.payload);

      state.users = state.users.map((user) =>
        user.id === action.payload.id
          ? { ...user, isLoggedIn: action.payload.status }
          : user
      );
      console.log("<====REDUX state.users====>", state.users);
    },
  },
});

export const {
  setUser,
  clearUser,
  setUsers,
  addUser,
  setOnlineUsers,
  deleteUserFromRedux,
  updateUserStatus,
} = authSlice.actions;
export default authSlice.reducer;
