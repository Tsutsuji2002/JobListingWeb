import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaUser, 
  FaRegBookmark, 
  FaBriefcase, 
  FaCog, 
  FaCaretDown, 
  FaSignOutAlt
} from 'react-icons/fa';

export const UserAreaDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const userMenu = [
    { icon: FaUser, text: 'Profile', path: '/user/profile' },
    { icon: FaRegBookmark, text: 'Saved Jobs', path: '/user/saved-jobs' },
    { icon: FaBriefcase, text: 'Applications', path: '/user/applications' },
    { icon: FaCog, text: 'Settings', path: '/user/settings' },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 focus:outline-none"
      >
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
          <FaUser className="w-4 h-4" />
        </div>
        <span>John Doe</span>
        <FaCaretDown className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
          {userMenu.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.text}
                to={item.path}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
              >
                <Icon className="w-4 h-4" />
                <span>{item.text}</span>
              </Link>
            );
          })}
          <hr className="my-2" />
          <button
            className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-gray-50 w-full"
            onClick={() => {/* Handle logout */}}
          >
            <FaSignOutAlt className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      )}
    </div>
  );
};