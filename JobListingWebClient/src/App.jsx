///2024802010496@student.tdmu.edu.vn

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';
import { store, persistor } from './redux/stores/store'
import AdminLayout from './admin/components/common/AdminLayout';
import EmployerLayout from './employers/components/layout/EmployerLayout';

import JobListingPage from './applicants/pages/JobListingPage';
import JobDetailPage from './applicants/pages/JobDetailPage';
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
import CreateCVPage from './applicants/pages/CreateCVPage';
import MyCVPage from './applicants/pages/MyCVPage';
import CVPreviewPage from './applicants/pages/CVPreviewPage';
import ManageApplicationsPage from './employers/pages/ManageApplicationsPage';
import Dashboard from './admin/pages/Dashboard';
import AdminLogin from './admin/pages/AdminLogin';
import AdminProfile from './admin/pages/AdminProfile';
import CompaniesManage from './admin/pages/CompaniesManage';
import CompanyEditPage from './admin/pages/CompanyEditPage';
import JobsByCompany from './admin/pages/JobsByCompany';
import JobEditPage from './admin/pages/JobEditPage';
import AccountsManage from './admin/pages/AccountsManage';
import LocationsManage from './admin/pages/LocationsManage';
import IndustriesManage from './admin/pages/IndustriesManage';
import CVBuilderPage from './applicants/pages/CVBuilderPage';
import PostsManage from './admin/pages/PostManage';
import AddPostPage from './admin/pages/AddPostPage';
import EditPostPage from './admin/pages/EditPostPage';
import BlogbyTypePage from './applicants/pages/BlogbyTypePage';
import BlogDetailPage from './applicants/pages/BlogDetailPage';
import EmployerMessagePage from './employers/pages/EmployerMessagesPage';
import ApplicantMessagesPage from './applicants/pages/ApplicantMessagesPage';
import AuthLayout from './applicants/components/layout/AuthLayout';
import UnapprovedJobsPage from './admin/pages/UnapprovedJobsPage';

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/jobs" element={<JobListingPage />} />
            <Route path="/jobs/:id" element={<JobDetailPage />} />
            <Route path="/companies/:companyId" element={<CompanyDetailPage />} />
            <Route path="/companies" element={<CompaniesPage />} />
            <Route path="/career/blog/:blogTypeId" element={<BlogbyTypePage />} />
            <Route path="/career/blog/details/:blogId" element={<BlogDetailPage />} />          
            <Route path="/about" element={<AboutPage />} />

            {/* User Routes */}
            <Route path="/user/login" element={<LoginPage />} />
            <Route path="/user/signup" element={<SignupPage />} />
            
            <Route path="/user/cv/create" element={<CreateCVPage/>}/>
            <Route path="/user/cv/" element={<MyCVPage/>}/>
            <Route path="/user/cv/preview/:id" element={<CVPreviewPage />}/>
            <Route path="/user/cv/createontemplate" element={<CVBuilderPage />} />

            <Route path="/user" element={<AuthLayout />}>
              <Route path="profile" element={<UserProfilePage />} />
              <Route path="saved-jobs" element={<SavedJobsPage />} />
              <Route path="applications" element={<ApplicationsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="chat" element={<ApplicantMessagesPage />} />

            </Route>
            {/* Employer Public Routes */}
            <Route path="/employer" element={<EmployerIntroPage />} />
            <Route path="/employer/signup" element={<EmployerSignupPage />} />
            <Route path="/employer/login" element={<EmployerLoginPage />} />
            <Route path="/employer/chat" element={<EmployerMessagePage />} />

            {/* Employer Protected Routes */}
            <Route path="/employer" element={<EmployerLayout />}>
              <Route path="dashboard" element={<EmployerDashboard />} />
              <Route path="post-job" element={<PostJobPage />} />
              <Route path="jobs" element={<PostedJobsPage />} />
              <Route path="company" element={<CompanyProfilePage />} />
              <Route path="profile" element={<EmployerProfile />} />
              <Route path="profile/edit" element={<EmployerUpdateProfile />} />
              <Route path="setting" element={<AccountSettingsPage />} />
              <Route path="jobs/edit/:jobId" element={<EditJobPage />} />
              <Route path="company/create" element={<CompanyCreatePage />} />
              <Route path="jobs/manage-applications/:jobId" element={<ManageApplicationsPage />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="profile" element={<AdminProfile />} />
              <Route path="manage/accounts" element={<AccountsManage />} />
              <Route path="manage/companies" element={<CompaniesManage />} />
              <Route path="manage/companies/edit/:id" element={<CompanyEditPage />} />
              <Route path="manage/companies/:companyId/:companyName/jobs" element={<JobsByCompany />} />
              <Route path="manage/jobs/edit/:jobId" element={<JobEditPage />} />
              <Route path="manage/jobs/unapproved" element={<UnapprovedJobsPage />} />
              <Route path="manage/locations" element={<LocationsManage />} />
              <Route path="manage/industries" element={<IndustriesManage />} />
              <Route path="manage/posts" element={<PostsManage />} />
              <Route path="manage/posts/add-post" element={<AddPostPage />} />
              <Route path="manage/posts/edit/:id" element={<EditPostPage />} />
            </Route>
          </Routes>
        </Router>
      </PersistGate>
    </Provider>
  );
};

export default App;