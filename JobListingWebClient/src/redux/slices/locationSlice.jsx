import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { locationApi } from '../../services/LocationApi';

// Async Thunks
export const fetchLocations = createAsyncThunk(
  'locations/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const locations = await locationApi.getAllLocations();
      return locations;
    } catch (error) {
      return rejectWithValue(error.toString());
    }
  }
);

export const fetchAdminLocations = createAsyncThunk(
  'locations/fetchAdminAll',
  async (_, { rejectWithValue }) => {
    try {
      const locations = await locationApi.admin_getAllLocations();
      return locations;
    } catch (error) {
      return rejectWithValue(error.toString());
    }
  }
);

export const fetchLocationById = createAsyncThunk(
  'locations/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const location = await locationApi.getLocationById(id);
      return location;
    } catch (error) {
      return rejectWithValue(error.toString());
    }
  }
);

export const createLocation = createAsyncThunk(
  'locations/create',
  async (locationData, { rejectWithValue }) => {
    try {
      const location = await locationApi.createLocation(locationData);
      return location;
    } catch (error) {
      return rejectWithValue(error.toString());
    }
  }
);

export const updateLocation = createAsyncThunk(
  'locations/update',
  async ({ id, locationData }, { rejectWithValue }) => {
    try {
      await locationApi.updateLocation(id, locationData);
      return { id, ...locationData };
    } catch (error) {
      return rejectWithValue(error.toString());
    }
  }
);

export const restoreLocation = createAsyncThunk(
  'locations/restore',
  async (id, { rejectWithValue }) => {
    try {
      await locationApi.restoreLocation(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.toString());
    }
  }
);

export const deleteLocation = createAsyncThunk(
  'locations/delete',
  async (id, { rejectWithValue }) => {
    try {
      await locationApi.deleteLocation(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.toString());
    }
  }
);

export const deleteLocationPermanently = createAsyncThunk(
  'locations/permanent/delete',
  async (id, { rejectWithValue }) => {
    try {
      await locationApi.deleteLocationPermanently(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.toString());
    }
  }
);

export const searchLocations = createAsyncThunk(
  'locations/search',
  async (searchTerm, { rejectWithValue }) => {
    try {
      const locations = await locationApi.searchLocations(searchTerm);
      return locations;
    } catch (error) {
      return rejectWithValue(error.toString());
    }
  }
);

// Slice
const locationSlice = createSlice({
  name: 'locations',
  initialState: {
    locations: [],
    selectedLocation: null,
    searchResults: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    lastUpdated: null
  },
  reducers: {
    clearSelectedLocation: (state) => {
      state.selectedLocation = null;
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
      // Fetch all locations
      .addCase(fetchLocations.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchLocations.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.locations = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchLocations.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchAdminLocations.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAdminLocations.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.locations = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchAdminLocations.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Fetch location by id
      .addCase(fetchLocationById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchLocationById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.selectedLocation = action.payload;
      })
      .addCase(fetchLocationById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Create location
      .addCase(createLocation.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createLocation.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.locations.push(action.payload);
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(createLocation.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Update location
      .addCase(updateLocation.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateLocation.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.locations.findIndex(location => location.locationID === action.payload.id);
        if (index !== -1) {
          state.locations[index] = action.payload;
        }
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updateLocation.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Restore location
      .addCase(restoreLocation.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(restoreLocation.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.locations = state.locations.filter(location => location.locationID !== action.payload);
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(restoreLocation.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Delete location
      .addCase(deleteLocation.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteLocation.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.locations = state.locations.filter(location => location.locationID !== action.payload);
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(deleteLocation.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

       // Permanently delete location
       .addCase(deleteLocationPermanently.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteLocationPermanently.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.locations = state.locations.filter(location => location.locationID !== action.payload);
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(deleteLocationPermanently.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })


      // Search locations
      .addCase(searchLocations.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(searchLocations.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.searchResults = action.payload;
      })
      .addCase(searchLocations.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

// Actions
export const { clearSelectedLocation, clearSearchResults, clearError } = locationSlice.actions;

// Selectors
export const selectAllLocations = (state) => state.locations.locations;
export const selectSelectedLocation = (state) => state.locations.selectedLocation;
export const selectSearchResults = (state) => state.locations.searchResults;
export const selectLocationStatus = (state) => state.locations.status;
export const selectLocationError = (state) => state.locations.error;
export const selectLastUpdated = (state) => state.locations.lastUpdated;

export default locationSlice.reducer;
