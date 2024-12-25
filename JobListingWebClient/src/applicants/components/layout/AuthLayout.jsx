import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Outlet } from 'react-router-dom';
import { fetchCurrentUser } from '../../../redux/slices/authSlice';

const AuthLayout = ({ allowedRoles = ['Applicant'] }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser, isLoading, isAuthenticated } = useSelector((state) => state.auth);
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/user/login', { replace: true });
        return;
      }

      if (!hasCheckedAuth.current) {
        hasCheckedAuth.current = true;
        await dispatch(fetchCurrentUser());
      }
    };

    checkAuth();
  }, [dispatch, navigate]);

  useEffect(() => {
    if (!isLoading && currentUser && hasCheckedAuth.current) {
      const hasAllowedRole = allowedRoles.some(role => 
        currentUser.roles.includes(role)
      );
      
      if (!hasAllowedRole) {
        navigate('/employer/dashboard', { replace: true });
      }
    }
  }, [currentUser, allowedRoles, isLoading, navigate]);

  if (isLoading || !hasCheckedAuth.current) {
    return <div>Loading...</div>; // Add proper loading component
  }

  return <Outlet />;
};

export default AuthLayout;