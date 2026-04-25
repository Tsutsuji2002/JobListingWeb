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

export const archiveChatRoom = createAsyncThunk(
  'chat/archiveChatRoom',
  async (roomId, { rejectWithValue }) => {
    try {
      await chatApi.archiveChatRoom(roomId);
      return roomId;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to archive chat room');
    }
  }
);

export const deleteChatRoom = createAsyncThunk(
  'chat/deleteChatRoom',
  async (roomId, { rejectWithValue }) => {
    try {
      await chatApi.deleteChatRoom(roomId);
      return roomId;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete chat room');
    }
  }
);

export const deleteMessage = createAsyncThunk(
  'chat/deleteMessage',
  async (messageId, { rejectWithValue }) => {
    try {
      await chatApi.deleteMessage(messageId);
      return messageId;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete message');
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
    },
    archiveRoom: (state, action) => {
      state.rooms = state.rooms.filter(room => room.id !== action.payload);
      if (state.selectedRoom?.id === action.payload) {
        state.selectedRoom = null;
        state.currentRoomMessages = [];
      }
    },
    deleteRoom: (state, action) => {
      state.rooms = state.rooms.filter(room => room.id !== action.payload);
      if (state.selectedRoom?.id === action.payload) {
        state.selectedRoom = null;
        state.currentRoomMessages = [];
      }
    },
    deleteMessage: (state, action) => {
      state.currentRoomMessages = state.currentRoomMessages.filter(msg => msg.id !== action.payload);
    },
    updateReadStatus: (state, action) => {
      const { roomId, readerId } = action.payload;
      state.currentRoomMessages.forEach(msg => {
        if (msg.senderId !== readerId) {
          msg.isRead = true;
        }
      });
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
      })

      // Archive Chat Room
      .addCase(archiveChatRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(archiveChatRoom.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = state.rooms.filter(room => room.id !== action.payload);
        if (state.selectedRoom?.id === action.payload) {
          state.selectedRoom = null;
          state.currentRoomMessages = [];
        }
      })
      .addCase(archiveChatRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Chat Room
      .addCase(deleteChatRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteChatRoom.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = state.rooms.filter(room => room.id !== action.payload);
        if (state.selectedRoom?.id === action.payload) {
          state.selectedRoom = null;
          state.currentRoomMessages = [];
        }
      })
      .addCase(deleteChatRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Message
      .addCase(deleteMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRoomMessages = state.currentRoomMessages.filter(msg => msg.id !== action.payload);
      })
      .addCase(deleteMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  selectRoom,
  addNewMessage,
  updateLastFetch,
  archiveRoom,
  deleteRoom,
  deleteMessage,
  updateReadStatus
} = chatSlice.actions;

export default chatSlice.reducer;
