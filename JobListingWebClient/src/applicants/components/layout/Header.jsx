import React from 'react';
import { Link } from 'react-router-dom';
import { UserAreaDropdown } from '../user/UserAreaDropdown';
import logo from '../../../images/logo.jpg';

const Header = () => {
  const isLoggedIn = false;

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center">
          <img src={logo} alt="Company Logo" className="h-8 w-auto mr-4" />
          <h1 className="text-xl font-bold text-gray-800">Job Board</h1>
        </div>
        <nav>
          <ul className="flex space-x-4">
            <li><Link to="/" className="text-gray-600 hover:text-gray-800">Trang chủ</Link></li>
            <li><Link to="/jobs" className="text-gray-600 hover:text-gray-800">Công việc</Link></li>
            <li><Link to="/companies" className="text-gray-600 hover:text-gray-800">Công ty</Link></li>
            <li><Link to="/about" className="text-gray-600 hover:text-gray-800">Về chúng tôi</Link></li>
            <li>
              <Link 
                to="/employer" 
                className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
              >
                Nhà tuyển dụng
                <span className="ml-1 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                  Mới
                </span>
              </Link>
            </li>
          </ul>
        </nav>
        <div className="flex items-center space-x-6">
          {isLoggedIn ? (
            <UserAreaDropdown />
          ) : (
            <>
              <Link to="/user/login" className="text-gray-600 hover:text-gray-800">Đăng nhập</Link>
              <Link to="/user/signup" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;