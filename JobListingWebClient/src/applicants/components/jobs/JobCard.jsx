import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBuilding, FaMapMarkerAlt, FaClock } from 'react-icons/fa';

const JobCard = ({ job }) => {
  const navigate = useNavigate();

  return (
    <div
      className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 cursor-pointer"
    >
      <h3 className="text-xl font-semibold text-gray-800 mb-2" onClick={() => navigate(`/jobs/${job.id}`)}>{job.title}</h3>
      <div className="flex items-center text-gray-600 mb-2" onClick={() => navigate(`/companies`)}>
        <FaBuilding className="mr-2" />
        <span>{job.company}</span>
      </div>
      <div className="flex items-center text-gray-600 mb-2">
        <FaMapMarkerAlt className="mr-2" />
        <span>{job.location}</span>
      </div>
      <div className="flex items-center text-gray-600 mb-4">
        <FaClock className="mr-2" />
        <span>{job.type}</span>
      </div>
      <p className="text-gray-700 mb-4">{job.description}</p>
      <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
      Xem chi tiết
      </button>
    </div>
  );
};

export default JobCard;