import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaUser, 
  FaRegBookmark, 
  FaBriefcase, 
  FaCog
} from 'react-icons/fa';

export const UserSideNav = ({ activeTab }) => {
  const navItems = [
    { icon: FaUser, text: 'Hồ sơ', path: '/user/profile' },
    { icon: FaRegBookmark, text: 'Công việc đã lưu', path: '/user/saved-jobs' },
    { icon: FaBriefcase, text: 'Danh sách ứng tuyển', path: '/user/applications' },
    { icon: FaCog, text: 'Cài đặt', path: '/user/settings' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sticky top-4">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.text}
            to={item.path}
            className={`flex items-center space-x-2 p-3 rounded-md transition-colors ${
              activeTab === item.text.toLowerCase()
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{item.text}</span>
          </Link>
        );
      })}
    </div>
  );
};