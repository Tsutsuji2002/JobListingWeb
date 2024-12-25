import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FaUser, FaRegBookmark, FaBriefcase, FaCog } from 'react-icons/fa';
import { logoutUser } from '../../../redux/slices/authSlice';

export const UserAreaDropdown = ({ user }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const userMenu = [
    { icon: FaUser, text: 'Hồ sơ cá nhân', path: '/user/profile' },
    { icon: FaRegBookmark, text: 'Việc làm đã lưu', path: '/user/saved-jobs' },
    { icon: FaBriefcase, text: 'Đơn ứng tuyển', path: '/user/applications' },
    { icon: FaCog, text: 'Cài đặt', path: '/user/settings' },
  ];

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      navigate('/user/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
      >
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
          {user.avatar ? (
            <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full" />
          ) : (
            <FaUser className="text-gray-500-bold" />
          )}
        </div>
        <span>{user.firstName + " " + user.lastName || 'User'}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
          <div className="py-1">
            {userMenu.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  navigate(item.path);
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <item.icon className="mr-2" />
                {item.text}
              </button>
            ))}
            <hr className="my-1" />
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
