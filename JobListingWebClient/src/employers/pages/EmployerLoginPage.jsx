import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginEmployer } from '../../redux/slices/employerSlice';

const EmployerLoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const employerState = useSelector((state) => state.employer);
  const { currentEmployer, error, isLoading } = employerState || {};
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log(currentEmployer?.roles);
    if (!isLoading && token) {
      navigate('/employer/dashboard', { replace: true });
    }
  }, [currentEmployer, navigate, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const resultAction = await dispatch(loginEmployer(formData));
      if (loginEmployer.fulfilled.match(resultAction)) {
        // Success case is handled by useEffect
      }
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // If we're already authenticated as an employer, don't render the form
  if (!isLoading && currentEmployer?.roles?.includes('Employer')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-bold text-gray-900">Đăng nhập Nhà tuyển dụng</h2>
        {error && <p className="text-red-500 text-center mt-2">{error}</p>}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mật khẩu
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>

            <div className="flex items-center">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={formData.rememberMe}
                onChange={handleInputChange}
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
                Ghi nhớ đăng nhập
              </label>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="text-center">
              <Link to="/employer/signup" className="text-blue-600 hover:text-blue-500">
                Chưa có <strong>tài khoản</strong>? <strong>Đăng ký</strong> ngay
              </Link>
            </div>
            <div className="text-center mt-4">
              <Link to="/user/login" className="text-blue-600 hover:text-blue-500">
                Bạn là <strong>ứng viên</strong>? <strong>Đăng nhập</strong> tại đây
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerLoginPage;
