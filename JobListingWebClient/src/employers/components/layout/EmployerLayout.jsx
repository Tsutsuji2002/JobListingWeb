import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Outlet } from 'react-router-dom';
import { logoutUser } from '../../../redux/slices/authSlice';
import EmployerHeader from './EmployerHeader';
import Footer from '../../../applicants/components/layout/Footer';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
} from '@mui/material';

const EmployerLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentEmployer, loading } = useSelector((state) => state.employer);
  const { isLoading: isLoggingOut } = useSelector((state) => state.auth);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!loading) {
      if (!token) {
        navigate('/employer/login', { replace: true });
      } else if (currentEmployer && !currentEmployer.roles.includes('Employer')) {
        // Only show modal if user exists but doesn't have Employer role
        setShowModal(true);
      }
    }
  }, [currentEmployer, loading, navigate]);

  const handleLogout = async () => {
    try {
      localStorage.removeItem('token');
      await dispatch(logoutUser());
      setShowModal(false);
      navigate('/employer/login', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    if (currentEmployer) {
      if (currentEmployer.roles.includes('Admin')) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  };

  // Show nothing while loading or if no employer data
  if (loading) {
    return null;
  }

  return (
    <>
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          minHeight: '100vh'
        }}
      >
        <EmployerHeader />
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            bgcolor: 'grey.100'
          }}
        >
          <Outlet />
        </Box>
        <Footer />
      </Box>

      <Dialog
        open={showModal}
        disableEscapeKeyDown
        onClose={(event, reason) => {
          if (isLoggingOut || reason === 'backdropClick') return;
          handleCancel();
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Access Restricted
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {currentEmployer?.roles.includes('Admin')
              ? "Bạn cần đăng nhập với tư cách là Nhà tuyển dụng để truy cập trang này. Bạn có muốn đăng xuất và tiếp tục không?"
              : "Bạn cần đăng nhập với tư cách là Nhà tuyển dụng để truy cập trang này. Bạn có muốn tiếp tục không?"}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCancel}
            disabled={isLoggingOut}
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleLogout}
            disabled={isLoggingOut}
            variant="contained"
            autoFocus
          >
            {isLoggingOut ? 'Đang đăng xuất...' : 'Tiếp tục'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EmployerLayout;