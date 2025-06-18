import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Chat from "@/types/chats";

interface ChatsState {
  chats: Chat[];
}

const initialState: ChatsState = {
  chats: [],
};

const chatsSlice = createSlice({
  name: "chats",
  initialState,
  reducers: {
    setChats: (state, action: PayloadAction<Chat[]>) => {
      state.chats = action.payload;
    },
    addChat: (state, action: PayloadAction<Chat>) => {
      state.chats.unshift(action.payload);
    },
    deleteChat: (state, action: PayloadAction<number>) => {
      state.chats = state.chats.filter(
        (chat: Chat) => chat.id !== action.payload
      );
    },
    clearChats: (state) => {
      state.chats = [];
    },
  },
});

export const { setChats, addChat, deleteChat, clearChats } = chatsSlice.actions;
export default chatsSlice.reducer;
