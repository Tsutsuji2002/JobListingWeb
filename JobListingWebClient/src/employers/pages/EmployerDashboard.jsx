import React from 'react';
import EmployerLayout from '../components/layout/EmployerLayout';
import { FaBriefcase, FaUsers, FaEye, FaChartLine } from 'react-icons/fa';

const EmployerDashboard = () => {
  return (
    <EmployerLayout>
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xl font-semibold text-gray-800">Active Jobs</div>
              <FaBriefcase className="text-blue-500 text-2xl" />
            </div>
            <div className="text-3xl font-bold text-gray-900">12</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xl font-semibold text-gray-800">Total Applications</div>
              <FaUsers className="text-green-500 text-2xl" />
            </div>
            <div className="text-3xl font-bold text-gray-900">48</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xl font-semibold text-gray-800">Job Views</div>
              <FaEye className="text-purple-500 text-2xl" />
            </div>
            <div className="text-3xl font-bold text-gray-900">1,234</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xl font-semibold text-gray-800">Conversion Rate</div>
              <FaChartLine className="text-orange-500 text-2xl" />
            </div>
            <div className="text-3xl font-bold text-gray-900">3.9%</div>
          </div>
        </div>
      </div>
    </EmployerLayout>
  );
};

export default EmployerDashboard;