import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedAdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.admin);
  const location = useLocation();

  // If trying to access login page while authenticated, redirect to dashboard
  if (location.pathname === '/admin/login' && isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // If trying to access protected pages while not authenticated, redirect to login
  if (!isAuthenticated && location.pathname !== '/admin/login') {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // If authenticated but not admin, redirect to login
  if (isAuthenticated && !user?.roles?.includes('Admin')) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default ProtectedAdminRoute;