import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { employerApi } from '../../services/EmployerApi';

export const registerEmployer = createAsyncThunk(
  'employer/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await employerApi.register(userData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const loginEmployer = createAsyncThunk(
  'employer/login',
  async (loginData, { rejectWithValue }) => {
    try {
      const response = await employerApi.login(loginData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutEmployer = createAsyncThunk(
  'employer/logout',
  async (_, { rejectWithValue }) => {
    try {
      const response = await employerApi.logout();
      
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      
      return response.data;
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      
      return rejectWithValue(error.response?.data?.message || 'Logout failed');
    }
  }
);

export const fetchCurrentEmployer = createAsyncThunk(
  'employer/fetchCurrent',
  async (_, { rejectWithValue }) => {
    try {
      const response = await employerApi.getCurrentEmployer();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateEmployerProfile = createAsyncThunk(
  'employer/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await employerApi.updateProfile(profileData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const employerSlice = createSlice({
  name: 'employer',
  initialState: {
    currentEmployer: null,
    isLoading: false,
    error: null,
    isAuthenticated: !!localStorage.getItem('token'),
    updateSuccess: false
  },
  reducers: {
    clearUpdateStatus: (state) => {
      state.updateSuccess = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerEmployer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerEmployer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentEmployer = action.payload.user;
      })
      .addCase(registerEmployer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(loginEmployer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginEmployer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.currentEmployer = action.payload.user;
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(loginEmployer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(logoutEmployer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logoutEmployer.fulfilled, (state) => {
        state.isLoading = false;
        state.currentEmployer = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutEmployer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.currentEmployer = null;
        state.isAuthenticated = false;
      })
      .addCase(fetchCurrentEmployer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCurrentEmployer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentEmployer = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentEmployer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateEmployerProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateEmployerProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.updateSuccess = true;
        state.currentEmployer = { ...state.currentEmployer, ...action.payload };
      })
      .addCase(updateEmployerProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.updateSuccess = false;
      });
  },
});

export const { clearUpdateStatus } = employerSlice.actions;
export default employerSlice.reducer;