import React from 'react';
import { FaBuilding, FaMapMarkerAlt, FaClock } from 'react-icons/fa';

const JobModal = ({ job, onClose }) => {
  if (!job) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{job.title}</h2>
        <div className="flex items-center text-gray-600 mb-2">
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
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Yêu cầu:</h3>
          <ul className="list-disc list-inside text-gray-700">
            {job.requirements.map((req, index) => (
              <li key={index}>{req}</li>
            ))}
          </ul>
        </div>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Trách nhiệm:</h3>
          <ul className="list-disc list-inside text-gray-700">
            {job.responsibilities.map((resp, index) => (
              <li key={index}>{resp}</li>
            ))}
          </ul>
        </div>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Đóng
          </button>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            Ứng tuyển ngay
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobModal;