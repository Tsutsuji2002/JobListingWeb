import React from 'react';
import { FaBriefcase, FaMapMarkerAlt, FaClock, FaBuilding, FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const SavedJobCard = ({ job, onRemoveFavorite }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex items-start">
      <div className="flex-shrink-0 mr-4">
        <Link to={`/companies/${job.company.companyID}`}>
          {job.company.logo ? (
            <img
              src={job.company.logo.startsWith('data:') ? job.company.logo : `/api/Image${job.company.logo}`}
              alt={`Logo ${job.company.name}`}
              className="w-32 h-32 object-contain rounded-lg"
            />
          ) : (
            <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded-lg">
              <FaBuilding className="text-gray-500 text-4xl" />
            </div>
          )}
        </Link>
      </div>
      <div className="flex-grow">
        <div className="flex justify-between items-start mb-4">
          <div>
            <Link to={`/jobs/${job.jobID}`}>
              <h3 className="text-xl font-semibold text-gray-800 hover:underline">{job.title}</h3>
            </Link>
            <Link to={`/companies/${job.company.companyID}`}>
              <p className="text-gray-600 hover:underline">{job.company.name}</p>
            </Link>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-gray-500">
                <FaMapMarkerAlt className="inline mr-1" />
                {job.location.name}
              </span>
              <span className="text-gray-500">
                <FaBriefcase className="inline mr-1" />
                {job.jobLevel.description}
              </span>
            </div>
          </div>
          <button
            onClick={() => onRemoveFavorite(job.jobID)}
            className="text-red-500 hover:text-red-700"
          >
            <FaTrash className="text-2xl" />
          </button>
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <span>
            <FaClock className="inline mr-1" />
            Đăng vào: {new Date(job.postedDate).toLocaleString()}
          </span>
          <span>
            Cập nhật vào: {new Date(job.updatedDate).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SavedJobCard;
