import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Existing thunk to fetch general dashboard data
export const fetchDashboardData = createAsyncThunk(
    'dashboard/fetchDashboardData',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/Dashboard');
            return response.data; // Resolve with the dashboard data
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Error fetching dashboard data');
        }
    }
);

// New thunk to fetch employer-specific dashboard data
export const fetchEmployerDashboardData = createAsyncThunk(
    'dashboard/fetchEmployerDashboardData',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/Dashboard/EmployerDashboard/${userId}`, {
                params: { userId },
            });
            return response.data; // Resolve with the employer dashboard data
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Error fetching employer dashboard data');
        }
    }
);

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState: {
        generalData: null,
        employerData: null,
        loadingGeneral: false,
        loadingEmployer: false,
        errorGeneral: null,
        errorEmployer: null,
    },
    reducers: {
        // Clear errors
        clearDashboardErrors: (state) => {
            state.errorGeneral = null;
            state.errorEmployer = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // General dashboard data
            .addCase(fetchDashboardData.pending, (state) => {
                state.loadingGeneral = true;
                state.errorGeneral = null;
            })
            .addCase(fetchDashboardData.fulfilled, (state, action) => {
                state.loadingGeneral = false;
                state.generalData = action.payload;
            })
            .addCase(fetchDashboardData.rejected, (state, action) => {
                state.loadingGeneral = false;
                state.errorGeneral = action.payload;
            })
            // Employer-specific dashboard data
            .addCase(fetchEmployerDashboardData.pending, (state) => {
                state.loadingEmployer = true;
                state.errorEmployer = null;
            })
            .addCase(fetchEmployerDashboardData.fulfilled, (state, action) => {
                state.loadingEmployer = false;
                state.employerData = action.payload;
            })
            .addCase(fetchEmployerDashboardData.rejected, (state, action) => {
                state.loadingEmployer = false;
                state.errorEmployer = action.payload;
            });
    },
});

export const { clearDashboardErrors } = dashboardSlice.actions;

export default dashboardSlice.reducer;
