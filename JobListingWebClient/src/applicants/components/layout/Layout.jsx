import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutEmployer } from '../../../redux/slices/employerSlice';
import { Chat as ChatIcon } from '@mui/icons-material';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import Header from './Header';
import Footer from './Footer';
import ChatModal from '../common/ChatModal';
import { fetchCurrentUser } from '../../../redux/slices/authSlice';

const Layout = ({ children, allowedRoles = ['Applicant'] }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.auth);
  const { isLoading: isLoggingOut } = useSelector((state) => state.employer);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token && !currentUser && !hasCheckedAuth.current) {
        hasCheckedAuth.current = true;
        await dispatch(fetchCurrentUser());
      }
    };

    checkAuth();
  }, [dispatch, currentUser]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && currentUser) {
      const isEmployerOrAdmin = currentUser.roles.some(role => 
        ['Employer', 'Admin'].includes(role)
      );
      setShowRoleModal(isEmployerOrAdmin);
    }
  }, [currentUser, dispatch]);

  const handleLogout = async () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      await dispatch(logoutEmployer());
      setShowRoleModal(false);
      window.location.reload();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleCancel = () => {
    setShowRoleModal(false);
    if (currentUser) {
      if (currentUser.roles.includes('Employer')) {
        navigate('/employer/dashboard', { replace: true });
      } else if (currentUser.roles.includes('Admin')) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
    <Dialog
      open={showRoleModal}
      onClose={(_, reason) => {
        if (isLoggingOut || reason === 'backdropClick') return;
        handleCancel();
        }}
        aria-labelledby="role-dialog-title"
        aria-describedby="role-dialog-description"
      >
        <DialogTitle id="role-dialog-title">Access Restricted</DialogTitle>
        <DialogContent>
          <DialogContentText id="role-dialog-description">
            Bạn đã đăng nhập với tư cách là Nhà tuyển dụng. Bạn có muốn đăng xuất để xem nội dung của Người nộp đơn không?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} disabled={isLoggingOut}>
            Cancel
          </Button>
          <Button onClick={handleLogout} disabled={isLoggingOut}>
            {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
          </Button>
        </DialogActions>
      </Dialog>

      <Header currentUser={currentUser}/>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-blue-500 text-white p-3 rounded-full"
      >
        <ChatIcon />
      </button>

      <ChatModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
      <main className="flex-grow bg-gray-100">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;