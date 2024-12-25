import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const subscribe = createAsyncThunk(
  'sendmail/subscribe',
  async (subscriptionRequest, { rejectWithValue }) => {
    try {
      const response = await api.post('/sendmail/subscribe', subscriptionRequest);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const unsubscribe = createAsyncThunk(
  'sendmail/unsubscribe',
  async (email, { rejectWithValue }) => {
    try {
      const response = await api.post('/sendmail/unsubscribe', { email });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updatePreferences = createAsyncThunk(
  'sendmail/updatePreferences',
  async (preferences, { rejectWithValue }) => {
    try {
      const response = await api.put('/sendmail/update-preferences', preferences);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchSubscriptions = createAsyncThunk(
  'sendmail/fetchSubscriptions',
  async (email, { rejectWithValue }) => {
    try {
      const response = await api.get(`/sendmail/subscriptions/${email}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteSubscription = createAsyncThunk(
  'sendmail/deleteSubscription',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/sendmail/subscription/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const sendmailSlice = createSlice({
  name: 'sendmail',
  initialState: {
    subscriptions: [],
    loading: false,
    error: null,
    success: false
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(subscribe.pending, (state) => {
        state.loading = true;
      })
      .addCase(subscribe.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.error = null;
      })
      .addCase(subscribe.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      })
      .addCase(unsubscribe.pending, (state) => {
        state.loading = true;
      })
      .addCase(unsubscribe.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.error = null;
      })
      .addCase(unsubscribe.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      })
      .addCase(updatePreferences.pending, (state) => {
        state.loading = true;
      })
      .addCase(updatePreferences.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.error = null;
      })
      .addCase(updatePreferences.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      })
      .addCase(fetchSubscriptions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSubscriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.subscriptions = action.payload;
        state.error = null;
      })
      .addCase(fetchSubscriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteSubscription.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.subscriptions = state.subscriptions.filter(
          sub => sub.id !== action.payload
        );
        state.success = true;
      })
      .addCase(deleteSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default sendmailSlice.reducer;