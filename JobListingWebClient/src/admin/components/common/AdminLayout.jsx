import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAdminProfile } from '../../../redux/slices/adminSlice';
import Sidebar from './Sidebar';
import AdminHeader from './AdminHeader';
import { Outlet } from 'react-router-dom';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCheckingRole, setIsCheckingRole] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user, status } = useSelector((state) => state.admin);
  const isLoading = status === 'loading';

  useEffect(() => {
    // Redirect from /admin/login to /admin/dashboard if already logged in
    const storedToken = localStorage.getItem('token');
    if (location.pathname === '/admin/login' && user && storedToken) {
      navigate('/admin/dashboard');
    }

    // Fetch profile if token exists and user data isn't loaded
    if (storedToken && !user) {
      dispatch(getAdminProfile());
    } else if (!storedToken) {
      navigate('/admin/login');
    }
  }, [dispatch, user, navigate, location.pathname]);

  useEffect(() => {
    const checkAdminRole = () => {
      if (!isLoading && user && !isCheckingRole) {
        setIsCheckingRole(true);

        // Check if user has admin role
        if (!user.roles?.includes('Admin')) {
          alert('You do not have permission to access the admin area');
          navigate('/admin/login');
        }
      }
    };

    checkAdminRole();
  }, [user, navigate, isLoading, isCheckingRole]);


  // Show loading state while checking authentication
  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600">Đang tải....</div>
      </div>
    );
  }

  // If authenticated and has admin role, show admin layout
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;