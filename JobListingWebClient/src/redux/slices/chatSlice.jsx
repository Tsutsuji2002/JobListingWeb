import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { chatApi } from '../../services/ChatApi';

export const createChatRoom = createAsyncThunk(
  'chat/createChatRoom',
  async (employerId, { rejectWithValue }) => {
    try {
      const response = await chatApi.createChatRoom(employerId);
      if (!response || !response.id) {
        return rejectWithValue('Invalid response from server');
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create chat room');
    }
  }
);

export const fetchChatRooms = createAsyncThunk(
  'chat/fetchChatRooms',
  async (_, { rejectWithValue }) => {
    try {
      return await chatApi.fetchChatRooms();
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch chat rooms');
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async ({ roomId, lastFetch }, { rejectWithValue }) => {
    try {
      return await chatApi.fetchMessages(roomId, lastFetch);
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch messages');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ chatRoomId, content, type = 'Text' }, { rejectWithValue }) => {
    try {
      console.log("chatRoomId", chatRoomId);
    console.log("content", content);
    console.log("type", type);
      return await chatApi.sendMessage(chatRoomId, content, type);
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to send message');
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    rooms: [],
    currentRoomMessages: [],
    selectedRoom: null,
    loading: false,
    error: null,
    lastFetch: null
  },
  reducers: {
    selectRoom: (state, action) => {
      state.selectedRoom = action.payload;
    },
    addNewMessage: (state, action) => {
      if (state.currentRoomMessages) {
        state.currentRoomMessages.push(action.payload);
      }
    },
    updateLastFetch: (state, action) => {
      state.lastFetch = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Chat Room
      .addCase(createChatRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createChatRoom.fulfilled, (state, action) => {
        state.loading = false;
        // Check if rooms array exists and if the room isn't already there
        if (Array.isArray(state.rooms) && !state.rooms.some(room => room.id === action.payload.id)) {
          state.rooms.push(action.payload);
        }
        state.selectedRoom = action.payload;
      })
      .addCase(createChatRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Chat Rooms
      .addCase(fetchChatRooms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChatRooms.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = action.payload;
      })
      .addCase(fetchChatRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Messages
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRoomMessages = action.payload;
        state.lastFetch = new Date().toISOString();
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Send Message
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentRoomMessages) {
          state.currentRoomMessages.push(action.payload);
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  selectRoom,
  addNewMessage,
  updateLastFetch
} = chatSlice.actions;

export default chatSlice.reducer;
