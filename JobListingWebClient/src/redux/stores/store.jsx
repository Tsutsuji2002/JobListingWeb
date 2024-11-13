import { configureStore } from '@reduxjs/toolkit';
import companyReducer from '../slices/companySlice';
import employerReducer from '../slices/employerSlice';
import locationReducer from '../slices/locationSlice';
import industryReducer from '../slices/industrySlice';

export const store = configureStore({
  reducer: {
    companies: companyReducer,
    employer: employerReducer,  
    locations: locationReducer, 
    industries: industryReducer
  },
});
