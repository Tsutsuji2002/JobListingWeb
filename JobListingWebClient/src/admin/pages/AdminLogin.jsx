import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginAdmin } from '../../redux/slices/adminSlice';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Assuming you have an auth state in Redux
  const { isAuthenticated, status } = useSelector((state) => state.admin);
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/profile');
    }
    switch(status)
    {
      case 'loading': setLoading(true); break;
      default: setLoading(false);
    }
  }, [isAuthenticated, navigate, status]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(loginAdmin({ email, password })).unwrap();
      // Successful login will update isAuthenticated state, triggering the useEffect above
      navigate('/admin/dashboard');
    } catch (error) {
      // Handle login error here if needed
      console.error('Login failed:', error);
    }
  };

  // Prevent showing login form briefly if already authenticated
  if (loading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    return null; // or a loading spinner if you prefer
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block mb-2">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;