import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { CVApi } from '../../services/CVApi';

// Async thunks
export const uploadCV = createAsyncThunk(
    'cvs/upload',
    async ({ file, userId }, { rejectWithValue }) => {
        try {
            return await CVApi.uploadCV(file, userId);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchCVById = createAsyncThunk(
    'cvs/fetchById',
    async (cvId, { rejectWithValue }) => {
        try {
            const cv = await CVApi.getCVById(cvId);
            if (!cv) {
                throw new Error('CV not found');
            }
            return cv;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchUserCVs = createAsyncThunk(
    'cvs/fetchByUser',
    async (userId, { rejectWithValue }) => {
        try {
            return await CVApi.getUserCVs(userId);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteCV = createAsyncThunk(
    'cvs/delete',
    async (cvId, { rejectWithValue }) => {
        try {
            await CVApi.deleteCV(cvId);
            return cvId;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const downloadCV = createAsyncThunk(
    'cvs/download',
    async (cvId, { rejectWithValue }) => {
        try {
            const blob = await CVApi.downloadCV(cvId);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `cv-${cvId}.pdf`); // Default name, can be improved
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            return cvId;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const previewCV = createAsyncThunk(
    'cvs/previewCV',
    async (cvId, { rejectWithValue }) => {
      try {
        return await CVApi.previewCV(cvId);
      } catch (error) {
        return rejectWithValue(error.response.data);
      }
    }
  );

const cvSlice = createSlice({
    name: 'cvs',
    initialState: {
        items: [],
        currentCV: null,
        userCVs: [],
        loading: false,
        error: null,
        success: false,
        downloadProgress: null,
        currentCVPreview: null,
        previewLoading: false,
        previewError: null
    },
    reducers: {
        resetSuccess: (state) => {
            state.success = false;
        },
        resetError: (state) => {
            state.error = null;
        },
        clearCurrentCV: (state) => {
            state.currentCV = null;
            state.previewError = null;
        },
        resetDownloadProgress: (state) => {
            state.downloadProgress = null;
        }
    },
    extraReducers: (builder) => {
        builder
          // Upload CV
          .addCase(uploadCV.pending, (state) => {
            state.loading = true;
            state.error = null;
          })
          .addCase(uploadCV.fulfilled, (state, action) => {
            state.loading = false;
            state.success = true;
            state.userCVs.push(action.payload);
          })
          .addCase(uploadCV.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
          })
          // Fetch User CVs
          .addCase(fetchUserCVs.pending, (state) => {
            state.loading = true;
            state.error = null;
          })
          .addCase(fetchUserCVs.fulfilled, (state, action) => {
            state.loading = false;
            state.userCVs = action.payload;
          })
          .addCase(fetchUserCVs.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
          })
          // Fetch CV by ID
          .addCase(fetchCVById.pending, (state) => {
            state.loading = true;
            state.error = null;
          })
          .addCase(fetchCVById.fulfilled, (state, action) => {
            state.loading = false;
            state.currentCV = action.payload;
          })
          .addCase(fetchCVById.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
          })
          // Delete CV
          .addCase(deleteCV.pending, (state) => {
            state.loading = true;
            state.error = null;
          })
          .addCase(deleteCV.fulfilled, (state, action) => {
            state.loading = false;
            state.success = true;
            state.userCVs = state.userCVs.filter((cv) => cv.cvid !== action.payload);
          })
          .addCase(deleteCV.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
          })
          // Preview CV
          .addCase(previewCV.pending, (state) => {
            state.loading = true;
            state.error = null;
          })
          .addCase(previewCV.fulfilled, (state, action) => {
            state.loading = false;
            state.currentCV = action.payload;
          })
          .addCase(previewCV.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
          })
          // Download CV
          .addCase(downloadCV.pending, (state) => {
            state.loading = true;
            state.error = null;
          })
          .addCase(downloadCV.fulfilled, (state) => {
            state.loading = false;
          })
          .addCase(downloadCV.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
          });
      },
    });

export const { 
    resetSuccess, 
    resetError, 
    clearCurrentCV, 
    resetDownloadProgress 
} = cvSlice.actions;

export default cvSlice.reducer;