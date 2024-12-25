import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ApplicationApi from '../../services/ApplicationApi';

// Async thunks
export const fetchAllApplications = createAsyncThunk(
    'applications/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            return await ApplicationApi.getAllApplications();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchApplicationById = createAsyncThunk(
    'applications/fetchById',
    async (id, { rejectWithValue }) => {
        try {
            const application = await ApplicationApi.getApplicationById(id);
            if (!application) {
                throw new Error('Application not found');
            }
            return application;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchUserApplications = createAsyncThunk(
    'applications/fetchByUser',
    async (_,{ rejectWithValue }) => {
        try {
            return await ApplicationApi.getUserApplications();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchJobApplications = createAsyncThunk(
    'applications/fetchByJob',
    async (jobId, { rejectWithValue }) => {
        try {
            return await ApplicationApi.getJobApplications(jobId);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const createApplication = createAsyncThunk(
    'applications/create',
    async (applicationData, { rejectWithValue }) => {
        try {
            return await ApplicationApi.createApplication(applicationData);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const updateApplication = createAsyncThunk(
    'applications/update',
    async ({ id, applicationData }, { rejectWithValue }) => {
        try {
            return await ApplicationApi.updateApplication(id, applicationData);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteApplication = createAsyncThunk(
    'applications/delete',
    async (id, { rejectWithValue }) => {
        try {
            await ApplicationApi.deleteApplication(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const applicationSlice = createSlice({
    name: 'applications',
    initialState: {
        items: [],
        currentApplication: null,
        userApplications: [],
        jobApplications: [],
        loading: false,
        error: null,
        success: false
    },
    reducers: {
        resetSuccess: (state) => {
            state.success = false;
        },
        resetError: (state) => {
            state.error = null;
        },
        clearCurrentApplication: (state) => {
            state.currentApplication = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch all applications
            .addCase(fetchAllApplications.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllApplications.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchAllApplications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // Fetch application by ID
            .addCase(fetchApplicationById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchApplicationById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentApplication = action.payload;
            })
            .addCase(fetchApplicationById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.currentApplication = null;
            })
            
            // Fetch user applications
            .addCase(fetchUserApplications.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserApplications.fulfilled, (state, action) => {
                state.loading = false;
                state.userApplications = action.payload;
            })
            .addCase(fetchUserApplications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // Fetch job applications
            .addCase(fetchJobApplications.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchJobApplications.fulfilled, (state, action) => {
                state.loading = false;
                state.jobApplications = action.payload;
            })
            .addCase(fetchJobApplications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // Create application
            .addCase(createApplication.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(createApplication.fulfilled, (state, action) => {
                state.loading = false;
                state.items.push(action.payload);
                state.success = true;
            })
            .addCase(createApplication.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.success = false;
            })
            
            // Update application
            .addCase(updateApplication.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(updateApplication.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.items.findIndex(item => item.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
                state.success = true;
            })
            .addCase(updateApplication.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.success = false;
            })
            
            // Delete application
            .addCase(deleteApplication.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(deleteApplication.fulfilled, (state, action) => {
                state.loading = false;
                state.items = state.items.filter(item => item.id !== action.payload);
                state.success = true;
            })
            .addCase(deleteApplication.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.success = false;
            });
    }
});

export const { resetSuccess, resetError, clearCurrentApplication } = applicationSlice.actions;
export default applicationSlice.reducer;