import React from 'react';
import { FaMapMarkerAlt, FaUsers, FaGlobe, FaLinkedin, FaTwitter } from 'react-icons/fa';

const CompanyModal = ({ company, onClose }) => {
  if (!company) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center mb-6">
          <img
            src={company.logo || "/api/placeholder/96/96"}
            alt={`${company.name} logo`}
            className="w-24 h-24 rounded-full object-cover mr-6"
          />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{company.name}</h2>
            <p className="text-gray-600">{company.industry}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center text-gray-600">
            <FaMapMarkerAlt className="mr-2" />
            <span>{company.location}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <FaUsers className="mr-2" />
            <span>{company.size} nhân viên</span>
          </div>
          <div className="flex items-center text-gray-600">
            <FaGlobe className="mr-2" />
            <span>{company.website}</span>
          </div>
          <div className="flex items-center space-x-4">
            <a href={company.linkedin} className="text-gray-600 hover:text-blue-600">
              <FaLinkedin size={20} />
            </a>
            <a href={company.twitter} className="text-gray-600 hover:text-blue-400">
              <FaTwitter size={20} />
            </a>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Về chúng tôi</h3>
          <p className="text-gray-700">{company.description}</p>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Quyền lợi</h3>
          <ul className="grid grid-cols-2 gap-2">
            {company.benefits.map((benefit, index) => (
              <li key={index} className="flex items-center text-gray-700">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Vị trí tuyển dụng</h3>
          <div className="grid grid-cols-1 gap-2">
            {company.jobs.map((job) => (
              <div key={job.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                <div>
                  <h4 className="font-medium text-gray-800">{job.title}</h4>
                  <p className="text-sm text-gray-600">{job.location}</p>
                </div>
                <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  Ứng tuyển
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Close
          </button>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            Theo dõi công ty 
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyModal;