import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as companyApi from '../../services/CompanyApi';

// Async thunks
export const fetchCompanies = createAsyncThunk(
  'companies/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await companyApi.getAllCompanies();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCompanyById = createAsyncThunk(
  'companies/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      return await companyApi.getCompanyById(id);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createCompany = createAsyncThunk(
  'companies/create',
  async (companyData, { rejectWithValue }) => {
    try {
      return await companyApi.createCompany(companyData);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createCompanyWithLocationsAndIndustries = createAsyncThunk(
  'companies/createCompanyWithLocationsAndIndustries',
  async (companyData, { rejectWithValue }) => {
    try {
      const response = await companyApi.createCompanyWithLocationsAndIndustries(companyData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateCompany = createAsyncThunk(
  'companies/update',
  async ({ id, companyData }, { rejectWithValue }) => {
    try {
      return await companyApi.updateCompany(id, companyData);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteCompany = createAsyncThunk(
  'companies/delete',
  async (id, { rejectWithValue }) => {
    try {
      await companyApi.deleteCompany(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const searchCompanies = createAsyncThunk(
  'companies/search',
  async (searchTerm, { rejectWithValue }) => {
    try {
      return await companyApi.searchCompanies(searchTerm);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCompanyByUserId = createAsyncThunk(
  'companies/fetchByUserId',
  async (userId, { rejectWithValue }) => {
    try {
      return await companyApi.getCompanyByUserId(userId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  companies: [],
  selectedCompany: null,
  searchResults: [],
  status: 'idle', // idle | loading | succeeded | failed
  error: null,
};

// Slice
const companySlice = createSlice({
  name: 'companies',
  initialState,
  reducers: {
    clearSelectedCompany: (state) => {
      state.selectedCompany = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all companies
      .addCase(fetchCompanies.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.companies = action.payload;
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Fetch company by id
      .addCase(fetchCompanyById.fulfilled, (state, action) => {
        state.selectedCompany = action.payload;
      })
      // Create company
      .addCase(createCompany.fulfilled, (state, action) => {
        state.companies.push(action.payload);
        state.error = action.payload;
      })
      // Update company
      .addCase(updateCompany.fulfilled, (state, action) => {
        const index = state.companies.findIndex(
          (company) => company.CompanyID === action.payload.CompanyID
        );
        if (index !== -1) {
          state.companies[index] = action.payload;
        }
        if (state.selectedCompany?.CompanyID === action.payload.CompanyID) {
          state.selectedCompany = action.payload;
        }
      })
      // Delete company
      .addCase(deleteCompany.fulfilled, (state, action) => {
        state.companies = state.companies.filter(
          (company) => company.CompanyID !== action.payload
        );
        if (state.selectedCompany?.CompanyID === action.payload) {
          state.selectedCompany = null;
        }
      })
      .addCase(searchCompanies.fulfilled, (state, action) => {
        state.searchResults = action.payload;
      })
      .addCase(fetchCompanyByUserId.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCompanyByUserId.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.selectedCompany = action.payload;
      })
      .addCase(fetchCompanyByUserId.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createCompanyWithLocationsAndIndustries.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createCompanyWithLocationsAndIndustries.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.companies.push(action.payload);
        state.selectedCompany = action.payload;
      })
      .addCase(createCompanyWithLocationsAndIndustries.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

// Actions
export const { clearSelectedCompany, clearSearchResults } = companySlice.actions;

// Selectors
export const selectAllCompanies = (state) => state.companies.companies;
export const selectSelectedCompany = (state) => state.companies.selectedCompany;
export const selectCompanyStatus = (state) => state.companies.status;
export const selectCompanyError = (state) => state.companies.error;
export const selectSearchResults = (state) => state.companies.searchResults;

export default companySlice.reducer;