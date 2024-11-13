import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { industryApi } from '../../services/IndustryApi';

export const fetchIndustries = createAsyncThunk(
  'industries/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const industries = await industryApi.getAllIndustries();
      return industries;
    } catch (error) {
      return rejectWithValue(error.toString() || 'Failed to fetch industries');
    }
  }
);

const industrySlice = createSlice({
  name: 'industries',
  initialState: {
    industries: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchIndustries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIndustries.fulfilled, (state, action) => {
        state.loading = false;
        state.industries = action.payload;
      })
      .addCase(fetchIndustries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default industrySlice.reducer;