import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import MessageType from "@/types/message";

interface UserReaction {
  id: number;
  userId: number;
  userName: string;
  messageId: number;
  reaction: "like" | "dislike";
}

interface MessageState {
  messages: MessageType[];
  usersLikedDisliked: UserReaction[];
}

const initialState: MessageState = {
  messages: [],
  usersLikedDisliked: [],
};

const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    setMessages: (state, action: PayloadAction<MessageType[]>) => {
      state.messages = action.payload;
    },
    addMessage: (state, action: PayloadAction<MessageType>) => {
      state.messages.unshift(action.payload);
    },
    updateMessage: (state, action: PayloadAction<MessageType>) => {
      const index = state.messages.findIndex(
        (msg) => msg.id === action.payload.id
      );
      if (index !== -1) {
        state.messages[index] = action.payload;
      }
    },
    deleteMessage: (state, action: PayloadAction<number>) => {
      state.messages = state.messages.filter(
        (msg) => msg.id !== action.payload
      );
      state.usersLikedDisliked = state.usersLikedDisliked.filter(
        (reaction) => reaction.messageId !== action.payload
      );
    },
    setUsersLikedDisliked: (state, action: PayloadAction<UserReaction[]>) => {
      state.usersLikedDisliked = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
      state.usersLikedDisliked = [];
    },
  },
});

export const {
  setMessages,
  addMessage,
  updateMessage,
  clearMessages,
  deleteMessage,
  setUsersLikedDisliked,
} = messagesSlice.actions;
export default messagesSlice.reducer;
