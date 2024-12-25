import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AdminApi from '../../services/AdminApi';

// Async thunks for admin actions
export const loginAdmin = createAsyncThunk(
  'admin/loginAdmin',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await AdminApi.loginAdmin(credentials);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutAdmin = createAsyncThunk(
  'admin/logout',
  async (_, { rejectWithValue }) => {
    try {
      const response = await AdminApi.logout();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getAdminProfile = createAsyncThunk(
  'admin/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await AdminApi.getProfile();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateAdminProfile = createAsyncThunk(
  'admin/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await AdminApi.updateProfile(profileData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  profile: null,
  isAuthenticated: false,
  loading : false,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    resetStatus: (state) => {
      state.status = 'idle';
      state.error = null;
    },
    clearAdminState: (state) => {
      state.user = null;
      state.token = null;
      state.status = 'idle';
      state.error = null;
      state.profile = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginAdmin.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.token = action.payload.token;
        state.error = null;
        state.isAuthenticated = true;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Logout cases
      .addCase(logoutAdmin.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(logoutAdmin.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.profile = null;
        state.status = 'succeeded';
        state.error = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutAdmin.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Get Profile cases
      .addCase(getAdminProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getAdminProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.profile = action.payload;
      })
      .addCase(getAdminProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Update Profile cases
      .addCase(updateAdminProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateAdminProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.profile = action.payload;
      })
      .addCase(updateAdminProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { resetStatus, clearAdminState } = adminSlice.actions;

// Selectors
export const selectAdmin = (state) => state.admin;
export const selectAdminUser = (state) => state.admin.user;
export const selectAdminToken = (state) => state.admin.token;
export const selectAdminStatus = (state) => state.admin.status;
export const selectAdminError = (state) => state.admin.error;
export const selectAdminProfile = (state) => state.admin.profile;

export default adminSlice.reducer;