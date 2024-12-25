import { createSlice } from '@reduxjs/toolkit';

const sharedAuthStateSlice = createSlice({
  name: 'sharedAuthState',
  initialState: {
    isAuthenticated: !!localStorage.getItem('token'),
  },
  reducers: {
    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
      if (!action.payload) {
        localStorage.removeItem('token');
      }
    },
  },
});

export const { setAuthenticated } = sharedAuthStateSlice.actions;
export default sharedAuthStateSlice.reducer;
