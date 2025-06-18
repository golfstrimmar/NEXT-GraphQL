import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Socket } from "socket.io-client";

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
}

const initialState: SocketState = {
  socket: null,
  isConnected: false,
};

const socketSlice = createSlice({
  name: "socket",
  initialState,
  reducers: {
    setSocket(state, action: PayloadAction<Socket>) {
      state.socket = action.payload;
      state.isConnected = true;
    },
    disconnectSocket(state) {
      if (state.socket) {
        state.socket.disconnect();
        state.isConnected = false;
        state.socket = null;
      }
    },
  },
});

export const { setSocket, disconnectSocket } = socketSlice.actions;
export default socketSlice.reducer;
