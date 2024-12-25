import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { industryApi } from '../../services/IndustryApi';

// Async Thunks
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

export const fetchAdminIndustries = createAsyncThunk(
  'industries/fetchAdminAll',
  async (_, { rejectWithValue }) => {
    try {
      const industries = await industryApi.admin_getAllIndustries();
      return industries;
    } catch (error) {
      return rejectWithValue(error.toString() || 'Failed to fetch industries');
    }
  }
);

export const getIndustryById = createAsyncThunk(
  'industries/getIndustryById',
  async (id, { rejectWithValue }) => {
    try {
      const industry = await industryApi.getIndustryById(id);
      return industry;
    } catch (error) {
      return rejectWithValue(error.toString() || 'Failed to fetch industry');
    }
  }
);

export const createIndustry = createAsyncThunk(
  'industries/create',
  async (industryData, { rejectWithValue }) => {
    try {
      const industry = await industryApi.createIndustry(industryData);
      return industry;
    } catch (error) {
      return rejectWithValue(error.toString() || 'Failed to create industry');
    }
  }
);

export const updateIndustry = createAsyncThunk(
  'industries/update',
  async ({ id, industryData }, { rejectWithValue }) => {
    try {
      await industryApi.updateIndustry(id, industryData);
      return { id, ...industryData };
    } catch (error) {
      return rejectWithValue(error.toString() || 'Failed to update industry');
    }
  }
);

export const restoreIndustry = createAsyncThunk(
  'industries/restore',
  async (id, { rejectWithValue }) => {
    try {
      await industryApi.restoreIndustry(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.toString() || 'Failed to restore industry');
    }
  }
);

export const deleteIndustry = createAsyncThunk(
  'industries/delete',
  async (id, { rejectWithValue }) => {
    try {
      await industryApi.deleteIndustry(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.toString() || 'Failed to delete industry');
    }
  }
);

export const deleteIndustryPermanently = createAsyncThunk(
  'industries/permanent/delete',
  async (id, { rejectWithValue }) => {
    try {
      await industryApi.deleteIndustryPermanently(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.toString() || 'Failed to delete industry');
    }
  }
);

export const searchIndustries = createAsyncThunk(
  'industries/search',
  async (searchTerm, { rejectWithValue }) => {
    try {
      const industries = await industryApi.searchIndustries(searchTerm);
      return industries;
    } catch (error) {
      return rejectWithValue(error.toString() || 'Failed to search industries');
    }
  }
);

// Slice
const industrySlice = createSlice({
  name: 'industries',
  initialState: {
    industrybyID: null,
    industries: [],
    searchResults: [],
    loading: false,
    error: null,
    lastUpdated: null
  },
  reducers: {
    clearSelectedIndustry: (state) => {
      state.industrybyID = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all industries
      .addCase(fetchIndustries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIndustries.fulfilled, (state, action) => {
        state.loading = false;
        state.industries = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchIndustries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAdminIndustries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminIndustries.fulfilled, (state, action) => {
        state.loading = false;
        state.industries = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchAdminIndustries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch industry by id
      .addCase(getIndustryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getIndustryById.fulfilled, (state, action) => {
        state.loading = false;
        state.industrybyID = action.payload;
      })
      .addCase(getIndustryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create industry
      .addCase(createIndustry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createIndustry.fulfilled, (state, action) => {
        state.loading = false;
        state.industries.push(action.payload);
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(createIndustry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update industry
      .addCase(updateIndustry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateIndustry.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.industries.findIndex(industry => industry.industryID === action.payload.id);
        if (index !== -1) {
          state.industries[index] = action.payload;
        }
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updateIndustry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Restore industry
      .addCase(restoreIndustry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(restoreIndustry.fulfilled, (state, action) => {
        state.loading = false;
        state.industries = state.industries.filter(industry => industry.industryID !== action.payload);
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(restoreIndustry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete industry
      .addCase(deleteIndustry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteIndustry.fulfilled, (state, action) => {
        state.loading = false;
        state.industries = state.industries.filter(industry => industry.industryID !== action.payload);
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(deleteIndustry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteIndustryPermanently.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteIndustryPermanently.fulfilled, (state, action) => {
        state.loading = false;
        state.industries = state.industries.filter(industry => industry.industryID !== action.payload);
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(deleteIndustryPermanently.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Search industries
      .addCase(searchIndustries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchIndustries.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchIndustries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

// Actions
export const { clearSelectedIndustry, clearSearchResults, clearError } = industrySlice.actions;

// Selectors
export const selectAllIndustries = (state) => state.industries.industries;
export const selectSelectedIndustry = (state) => state.industries.industrybyID;
export const selectSearchResults = (state) => state.industries.searchResults;
export const selectIndustryStatus = (state) => state.industries.loading;
export const selectIndustryError = (state) => state.industries.error;
export const selectLastUpdated = (state) => state.industries.lastUpdated;

export default industrySlice.reducer;
