import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaCaretDown, FaBars, FaTimes } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { logoutEmployer, fetchCurrentEmployer } from '../../../redux/slices/employerSlice';
import logo from '../../../images/logo.jpg';

const EmployerHeader = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    if (dropdownOpen) setDropdownOpen(false);
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

  // Close mobile menu on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  if (isLoading) {
    return (
      <header className="bg-blue-600 shadow">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex items-center">
            <img src={logo} alt="Logo Công ty" className="h-8 w-auto mr-4" />
            <h1 className="text-xl font-bold text-white">Đang tải...</h1>
          </div>
        </div>
      </header>
    );
  }

  const navLinks = [
    { to: "/employer/dashboard", text: "Bảng Điều Khiển" },
    { to: "/employer/jobs", text: "Việc Làm Của Tôi" },
    { to: "/employer/post-job", text: "Đăng Tuyển" },
    { to: "/employer/company", text: "Hồ Sơ Công Ty" },
  ];

  return (
    <header className="bg-blue-600 shadow">
      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center flex-shrink-0">
            <img src={logo} alt="Logo Công ty" className="h-8 w-auto mr-4" />
            <h1 className="text-lg md:text-xl font-bold text-white hidden sm:block">
              Trang Quản lý Nhà Tuyển Dụng
            </h1>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-2"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <ul className="flex space-x-6 items-center">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-white hover:text-gray-200">
                    {link.text}
                  </Link>
                </li>
              ))}
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

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4">
            <ul className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="block text-white hover:text-gray-200 py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.text}
                  </Link>
                </li>
              ))}
              {currentEmployer && (
                <>
                  <li className="border-t border-blue-500 pt-2">
                    <Link
                      to="/employer/profile"
                      className="block text-white hover:text-gray-200 py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Thông Tin Cá Nhân
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/employer/settings"
                      className="block text-white hover:text-gray-200 py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Cài Đặt
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-left text-white hover:text-gray-200 py-2"
                    >
                      Đăng Xuất
                    </button>
                  </li>
                </>
              )}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
};

export default EmployerHeader;