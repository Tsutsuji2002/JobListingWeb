import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { chatbotAPI } from '../../services/ChatbotApi';

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (message, { rejectWithValue }) => {
    try {
      const response = await chatbotAPI.sendMessage(message);
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const chatbotSlice = createSlice({
  name: 'chat',
  initialState: {
    messages: [],
    isModalOpen: false,
    loading: false,
    error: null
  },
  reducers: {
    toggleModal: (state) => {
      state.isModalOpen = !state.isModalOpen;
    },
    addUserMessage: (state, action) => {
      state.messages.push({ 
        text: action.payload, 
        sender: 'user' 
      });
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push({ 
          text: action.payload, 
          sender: 'bot' 
        });
        state.loading = false;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
  }
});

export const { toggleModal, addUserMessage } = chatbotSlice.actions;
export default chatbotSlice.reducer;