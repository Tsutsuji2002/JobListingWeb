import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { careerApi } from '../../services/CareerApi';

export const fetchCareers = createAsyncThunk(
  'careers/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const careers = await careerApi.getAllCareers();
      return careers;
    } catch (error) {
      return rejectWithValue(error.toString());
    }
  }
);

export const fetchCareerById = createAsyncThunk(
  'careers/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const career = await careerApi.getCareerById(id);
      return career;
    } catch (error) {
      return rejectWithValue(error.toString());
    }
  }
);

export const addCareer = createAsyncThunk(
  'careers/add',
  async (careerData, { rejectWithValue }) => {
    try {
      const career = await careerApi.addCareer(careerData);
      return career;
    } catch (error) {
      return rejectWithValue(error.toString());
    }
  }
);

export const updateCareer = createAsyncThunk(
  'careers/update',
  async ({ id, careerData }, { rejectWithValue }) => {
    try {
      await careerApi.updateCareer(id, careerData);
      return { id, ...careerData };
    } catch (error) {
      return rejectWithValue(error.toString());
    }
  }
);

export const deleteCareer = createAsyncThunk(
  'careers/delete',
  async (id, { rejectWithValue }) => {
    try {
      await careerApi.deleteCareer(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.toString());
    }
  }
);

// Slice
const careerSlice = createSlice({
  name: 'careers',
  initialState: {
    careers: [],
    selectedCareer: null,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    lastUpdated: null
  },
  reducers: {
    clearSelectedCareer: (state) => {
      state.selectedCareer = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCareers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCareers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.careers = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchCareers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      .addCase(fetchCareerById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCareerById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.selectedCareer = action.payload;
      })
      .addCase(fetchCareerById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      .addCase(addCareer.fulfilled, (state, action) => {
        state.careers.push(action.payload);
        state.lastUpdated = new Date().toISOString();
      })

      .addCase(updateCareer.fulfilled, (state, action) => {
        const index = state.careers.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.careers[index] = action.payload;
        }
        state.lastUpdated = new Date().toISOString();
      })

      .addCase(deleteCareer.fulfilled, (state, action) => {
        state.careers = state.careers.filter((c) => c.id !== action.payload);
        state.lastUpdated = new Date().toISOString();
      });
  }
});

// Actions
export const { clearSelectedCareer, clearError } = careerSlice.actions;

// Selectors
export const selectAllCareers = (state) => state.careers.careers;
export const selectSelectedCareer = (state) => state.careers.selectedCareer;
export const selectCareerStatus = (state) => state.careers.status;
export const selectCareerError = (state) => state.careers.error;

export default careerSlice.reducer;
