import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaCaretDown } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { logoutEmployer, fetchCurrentEmployer } from '../../../redux/slices/employerSlice';
import logo from '../../../images/logo.jpg';

const EmployerHeader = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentEmployer, isAuthenticated, isLoading } = useSelector((state) => state.employer);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !currentEmployer) {
      dispatch(fetchCurrentEmployer());
    } else if (!token) {
      navigate('/employer/login');
    }
  }, [dispatch, navigate, currentEmployer]);

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      navigate('/employer/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutEmployer()).unwrap();
      navigate('/employer/login');
    } catch (error) {
      console.error('Đăng xuất thất bại:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest('.dropdown-container')) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  if (isLoading) {
    return (
      <header className="bg-blue-600 shadow">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center">
            <img src={logo} alt="Logo Công ty" className="h-8 w-auto mr-4" />
            <h1 className="text-xl font-bold text-white">Đang tải...</h1>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-blue-600 shadow">
      <div className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center">
          <img src={logo} alt="Logo Công ty" className="h-8 w-auto mr-4" />
          <h1 className="text-xl font-bold text-white">Trang Quản lý Nhà Tuyển Dụng</h1>
        </div>
        <nav>
          <ul className="flex space-x-6 items-center">
            <li><Link to="/employer/dashboard" className="text-white hover:text-gray-200">Bảng Điều Khiển</Link></li>
            <li><Link to="/employer/jobs" className="text-white hover:text-gray-200">Việc Làm Của Tôi</Link></li>
            <li><Link to="/employer/post-job" className="text-white hover:text-gray-200">Đăng Tuyển</Link></li>
            <li><Link to="/employer/company" className="text-white hover:text-gray-200">Hồ Sơ Công Ty</Link></li>
            {currentEmployer && (
              <li className="relative dropdown-container">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center text-white hover:text-gray-200 focus:outline-none"
                >
                  {currentEmployer.userName || currentEmployer.email || 'Tài khoản'} <FaCaretDown className="ml-2" />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                    <Link 
                      to="/employer/profile" 
                      className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Thông Tin Cá Nhân
                    </Link>
                    <Link 
                      to="/employer/settings" 
                      className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Cài Đặt
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left block px-4 py-2 text-gray-800 hover:bg-gray-100"
                    >
                      Đăng Xuất
                    </button>
                  </div>
                )}
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default EmployerHeader;
