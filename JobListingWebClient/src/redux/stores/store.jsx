import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import companyReducer from '../slices/companySlice';
import employerReducer from '../slices/employerSlice';
import locationReducer from '../slices/locationSlice';
import industryReducer from '../slices/industrySlice';
import careerReducer from '../slices/careerSlice';
import jobReducer from '../slices/jobSlice';
import cvReducer from '../slices/cvSlice';
// import applicantReducer from '../slices/applicantSlice';
import applicationReducer from '../slices/applicationSlice';
import chatbotReducer from '../slices/chatbotSlice';
import adminReducer from '../slices/adminSlice';
import postReducer from '../slices/postSlice';
import chatReducer from '../slices/chatSlice';
import authReducer from '../slices/authSlice';
import favoriteReducer from '../slices/favoriteSlice';
import sendmailReducer from '../slices/sendmailSlice';
import dashboardReducer from '../slices/dashboardSlice';

// Persist configuration
const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['auth','applicant', 'chat'], // Only persist these slices
};

// Combine all reducers
const rootReducer = combineReducers({
  admin: adminReducer,
  // applicant: applicantReducer,
  applications: applicationReducer,
  companies: companyReducer,
  jobs: jobReducer,
  employer: employerReducer,
  locations: locationReducer,
  industries: industryReducer,
  careers: careerReducer,
  posts: postReducer,
  cvs: cvReducer,
  chatbot: chatbotReducer,
  chat: chatReducer,
  auth: authReducer,
  favorites: favoriteReducer,
  sendmail: sendmailReducer,
  dashboard: dashboardReducer,
});

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);



// import { configureStore } from '@reduxjs/toolkit';
// import companyReducer from '../slices/companySlice';
// import employerReducer from '../slices/employerSlice';
// import locationReducer from '../slices/locationSlice';
// import industryReducer from '../slices/industrySlice';
// import careerReducer from '../slices/careerSlice';
// import jobReducer from '../slices/jobSlice';
// import cvReducer from '../slices/cvSlice';
// import applicantReducer from '../slices/applicantSlice';
// import applicationReducer from '../slices/applicationSlice';
// import chatbotReducer from '../slices/chatbotSlice';
// import adminReducer from '../slices/adminSlice';
// import postReducer from '../slices/postSlice';
// import chatReducer from '../slices/chatSlice';

// export const store = configureStore({
//   reducer: {
//     admin: adminReducer,
//     applicant: applicantReducer,
//     applications: applicationReducer,
//     companies: companyReducer,
//     jobs: jobReducer,
//     employer: employerReducer,  
//     locations: locationReducer, 
//     industries: industryReducer,
//     careers: careerReducer,
//     posts: postReducer,
//     cvs: cvReducer,
//     chatbot: chatbotReducer,
//     chat: chatReducer,
//   },
// });
