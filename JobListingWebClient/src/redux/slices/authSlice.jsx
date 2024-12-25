import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AuthApi } from '../../services/AuthApi';
import { ApplicantApi } from '../../services/ApplicantApi';

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrent',
  async (_, { rejectWithValue }) => {
    try {
      const response = await AuthApi.getCurrentUser();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAllUsersByType = createAsyncThunk(
  'auth/fetchAllUsersByType',
  async ({ userType, includeSoftDeleted }, { rejectWithValue }) => {
    try {
      const response = await AuthApi.getAllUsersByType(userType, includeSoftDeleted);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const softDeleteUser = createAsyncThunk(
  'auth/softDeleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await AuthApi.softDeleteUser(userId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const permanentDeleteUser = createAsyncThunk(
  'auth/permanentDeleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await AuthApi.permanentDeleteUser(userId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const restoreSoftDeletedUser = createAsyncThunk(
  'auth/restoreSoftDeletedUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await AuthApi.restoreSoftDeletedUser(userId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const registerApplicant = createAsyncThunk(
  'applicant/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await ApplicantApi.register(userData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const loginApplicant = createAsyncThunk(
  'applicant/login',
  async (loginData, { rejectWithValue }) => {
    try {
      const response = await ApplicantApi.login(loginData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await AuthApi.logout();
      return null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCurrentApplicant = createAsyncThunk(
  'applicant/fetchCurrent',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ApplicantApi.getCurrentApplicant();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateApplicantProfile = createAsyncThunk(
  'applicant/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await ApplicantApi.updateProfile(profileData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    currentUser: null,
    isLoading: false,
    error: null,
    isAuthenticated: !!localStorage.getItem('token'),
    updateSuccess: false,
    users: []
  },
  reducers: {
    clearUpdateStatus: (state) => {
      state.updateSuccess = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerApplicant.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerApplicant.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload.user;
      })
      .addCase(registerApplicant.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(loginApplicant.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginApplicant.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.currentUser = action.payload.user;
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(loginApplicant.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.currentUser = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.currentUser = null;
        state.isAuthenticated = false;
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchAllUsersByType.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllUsersByType.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchAllUsersByType.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(softDeleteUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(softDeleteUser.fulfilled, (state) => {
        state.isLoading = false;
        state.updateSuccess = true;
      })
      .addCase(softDeleteUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(permanentDeleteUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(permanentDeleteUser.fulfilled, (state) => {
        state.isLoading = false;
        state.updateSuccess = true;
      })
      .addCase(permanentDeleteUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(restoreSoftDeletedUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(restoreSoftDeletedUser.fulfilled, (state) => {
        state.isLoading = false;
        state.updateSuccess = true;
      })
      .addCase(restoreSoftDeletedUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchCurrentApplicant.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCurrentApplicant.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentApplicant.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateApplicantProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateApplicantProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.updateSuccess = true;
        state.currentUser = { ...state.currentUser, ...action.payload };
      })
      .addCase(updateApplicantProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.updateSuccess = false;
      });
  },
});

export const { clearUpdateStatus } = authSlice.actions;
export default authSlice.reducer;
