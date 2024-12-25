import React from 'react';
import { Link } from 'react-router-dom';
import {
  HomeIcon, UserIcon, BuildingOfficeIcon, 
  MapPinIcon, Squares2X2Icon, PencilSquareIcon, UserGroupIcon, CheckIcon
} from '@heroicons/react/24/outline';

const SidebarLink = ({ href, icon: Icon, label }) => (
  <Link 
    to={href} 
    className="flex items-center p-2 hover:bg-gray-200 rounded-md transition-colors text-white"
  >
    <Icon className="h-6 w-6 mr-3 text-white" />
    <span className="text-white">{label}</span>
  </Link>
);

const Sidebar = ({ open, setOpen }) => {
    const menuItems = [
      { href: '/admin/dashboard', icon: HomeIcon, label: 'Dashboard' },
      { href: '/admin/profile', icon: UserIcon, label: 'Hồ sơ' },
      { href: '/admin/manage/accounts', icon: UserGroupIcon, label: 'Quản lý tài khoản' },
      { href: '/admin/manage/companies', icon: BuildingOfficeIcon, label: 'Quản lý công ty' },
      { href: '/admin/manage/locations', icon: MapPinIcon, label: 'Quản lý địa điểm' },
      { href: '/admin/manage/industries', icon: Squares2X2Icon, label: 'Quản lý ngành nghề' },
      { href: '/admin/manage/posts', icon: PencilSquareIcon, label: 'Quản lý bài đăng' },
      { href: '/admin/manage/jobs/unapproved', icon: CheckIcon, label: 'Công việc chờ duyệt' },
    ];
  
    return (
      <div className={`${open ? 'block' : 'hidden'} md:block w-64 bg-[#dc2626] shadow-md`}>
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4 text-white">Job Admin</h2>
          <nav className="space-y-2">
            {menuItems.map((item, index) => (
              <SidebarLink key={index} {...item} />
            ))}
          </nav>
        </div>
      </div>
    );
  };
  
  export default Sidebar;