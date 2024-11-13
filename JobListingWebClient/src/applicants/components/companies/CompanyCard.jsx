import React from 'react';
import { FaMapMarkerAlt, FaUsers, FaGlobe } from 'react-icons/fa';

const CompanyCard = ({ company, onClick }) => {
  return (
    <div
      className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 cursor-pointer"
      onClick={() => onClick(company)}
    >
      <div className="flex items-center mb-4">
        <img
          src={company.logo || "/api/placeholder/64/64"}
          alt={`${company.name} logo`}
          className="w-16 h-16 rounded-full object-cover mr-4"
        />
        <div>
          <h3 className="text-xl font-semibold text-gray-800">{company.name}</h3>
          <p className="text-gray-600">{company.industry}</p>
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-gray-600">
          <FaMapMarkerAlt className="mr-2" />
          <span>{company.location}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <FaUsers className="mr-2" />
          <span>{company.size} employees</span>
        </div>
        <div className="flex items-center text-gray-600">
          <FaGlobe className="mr-2" />
          <span>{company.website}</span>
        </div>
      </div>
      <p className="text-gray-700 mb-4 line-clamp-3">{company.description}</p>
      <div className="flex justify-between items-center">
        <span className="text-blue-500">{company.openPositions} vị trí đang tuyển dụng</span>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          View Details
        </button>
      </div>
    </div>
  );
};

export default CompanyCard;
