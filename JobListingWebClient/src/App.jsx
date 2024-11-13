import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/stores/store'

import JobListingPage from './applicants/pages/JobListingPage';
import JobDetailsPage from './applicants/pages/JobDetailsPage';
import AboutPage from './applicants/pages/AboutPage';
import CompanyDetailPage from './applicants/pages/CompanyDetailPage';
import HomePage from './applicants/pages/HomePage';
import UserProfilePage from './applicants/pages/UserProfilePage';
import SavedJobsPage from './applicants/pages/SavedJobsPage';
import ApplicationsPage from './applicants/pages/ApplicationsPage';
import SettingsPage from './applicants/pages/SettingsPage';
import LoginPage from './applicants/pages/LoginPage';
import SignupPage from './applicants/pages/SignupPage';
import CompaniesPage from './applicants/pages/CompaniesPage';
import EmployerDashboard from './employers/pages/EmployerDashboard';
import PostJobPage from './employers/pages/PostJobPage';
import CompanyProfilePage from './employers/pages/CompanyProfilePage';
import EmployerIntroPage from './employers/pages/EmployerIntroPage';
import EmployerLoginPage from './employers/pages/EmployerLoginPage';
import EmployerSignupPage from './employers/pages/EmployerSignupPage';
import AccountSettingsPage from './employers/pages/AccountSettingsPage';
import PostedJobsPage from './employers/pages/PostedJobsPage';
import EditJobPage from './employers/pages/EditJobPage';
import EmployerProfile from './employers/pages/EmployerProfile';
import EmployerUpdateProfile from './employers/pages/EmployerUpdateProfile';
import CompanyCreatePage from './employers/pages/CompanyCreatePage';

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/jobs" element={<JobListingPage />} />
          <Route path="/jobs/:id" element={<JobDetailsPage />} />
          <Route path="/companies/id" element={<CompanyDetailPage />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/user/profile" element={<UserProfilePage />} />
          <Route path="/user/saved-jobs" element={<SavedJobsPage />} />
          <Route path="/user/applications" element={<ApplicationsPage />} />
          <Route path="/user/settings" element={<SettingsPage />} />
          <Route path="/user/login" element={<LoginPage />} />
          <Route path="/user/signup" element={<SignupPage />} />

          <Route path="/employer/dashboard" element={<EmployerDashboard />} />
          <Route path="/employer/post-job" element={<PostJobPage />} />
          <Route path="/employer/jobs" element={<PostedJobsPage />} />
          <Route path="/employer/company" element={<CompanyProfilePage />} />
          <Route path="/employer/profile" element={<EmployerProfile />} />
          <Route path="/employer/profile/edit" element={<EmployerUpdateProfile />} />
          <Route path="/employer/login" element={<EmployerLoginPage />} />
          <Route path="/employer/signup" element={<EmployerSignupPage />} />
          <Route path="/employer" element={<EmployerIntroPage />} />
          <Route path="/employer/setting" element={<AccountSettingsPage />} />
          <Route path="/employer/jobs/edit/:jobId" element={<EditJobPage />} />
          <Route path="/employer/company/create" element={<CompanyCreatePage />} />
        </Routes>
      </Router>
    </Provider>
  );
};

export default App;