import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import FavoriteApi from '../../services/FavoriteApi';

export const addFavoriteJob = createAsyncThunk(
    'favorites/addFavoriteJob',
    async (jobId, { rejectWithValue, dispatch }) => {
        try {
            await FavoriteApi.addFavoriteJob(jobId);
            // Fetch updated list after adding
            dispatch(fetchFavoriteJobs());
            return jobId;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Không thể thêm công việc vào danh sách yêu thích');
        }
    }
);

export const removeFavoriteJob = createAsyncThunk(
    'favorites/removeFavoriteJob',
    async (jobId, { rejectWithValue, dispatch }) => {
        try {
            await FavoriteApi.removeFavoriteJob(jobId);
            // Fetch updated list after removing
            dispatch(fetchFavoriteJobs());
            return jobId;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Không thể xóa công việc khỏi danh sách yêu thích');
        }
    }
);

export const fetchFavoriteJobs = createAsyncThunk(
    'favorites/fetchFavoriteJobs',
    async (_, { rejectWithValue }) => {
        try {
            const response = await FavoriteApi.getFavoriteJobs();
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Không thể tải danh sách công việc yêu thích');
        }
    }
);

const favoriteSlice = createSlice({
    name: 'favorites',
    initialState: {
        favoriteJobIds: [],
        favoriteJobs: [],
        loading: false,
        error: null
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Add favorite job
            .addCase(addFavoriteJob.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addFavoriteJob.fulfilled, (state, action) => {
                state.loading = false;
                if (!state.favoriteJobIds.includes(action.payload)) {
                    state.favoriteJobIds.push(action.payload);
                }
            })
            .addCase(addFavoriteJob.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Remove favorite job
            .addCase(removeFavoriteJob.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(removeFavoriteJob.fulfilled, (state, action) => {
                state.loading = false;
                state.favoriteJobIds = state.favoriteJobIds.filter(id => id !== action.payload);
                state.favoriteJobs = state.favoriteJobs.filter(job => job.jobID !== action.payload);
            })
            .addCase(removeFavoriteJob.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch favorite jobs
            .addCase(fetchFavoriteJobs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchFavoriteJobs.fulfilled, (state, action) => {
                state.loading = false;
                state.favoriteJobs = action.payload;
                state.favoriteJobIds = action.payload.map(job => job.jobID);
            })
            .addCase(fetchFavoriteJobs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearError } = favoriteSlice.actions;
export default favoriteSlice.reducer;