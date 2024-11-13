import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaEye, FaPause, FaPlay } from 'react-icons/fa';
import EmployerLayout from '../components/layout/EmployerLayout';

const PostedJobsPage = () => {
  const navigate = useNavigate();
  // Sample data - replace with actual data from your backend
  const jobs = [
    {
      id: 1,
      title: "Senior Software Engineer",
      jobCategory: "Technology",
      postedDate: "2024-03-15",
      closingDate: "2024-04-15",
      status: "active",
      applications: 12,
      views: 245
    },
    {
      id: 2,
      title: "Product Manager",
      jobCategory: "Management",
      postedDate: "2024-03-10",
      closingDate: "2024-04-10",
      status: "paused",
      applications: 8,
      views: 180
    }
  ];

  const handleEditJob = (jobId) => {
    navigate(`/employer/jobs/edit/${jobId}`);
  };

  return (
    <EmployerLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Posted Jobs</h2>
          <Link
            to="/employer/post-job"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Post New Job
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex flex-wrap gap-4">
            <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Categories</option>
              <option value="technology">Technology</option>
              <option value="management">Management</option>
              <option value="design">Design</option>
            </select>

            <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="closed">Closed</option>
            </select>

            <input
              type="text"
              placeholder="Search jobs..."
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Jobs List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posted Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Closing Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applications</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {jobs.map((job) => (
                  <tr key={job.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{job.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{job.jobCategory}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{job.postedDate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{job.closingDate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        job.status === 'active' ? 'bg-green-100 text-green-800' :
                        job.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {job.applications}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {job.views}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button 
                            onClick={() => handleEditJob(job.id)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit Job"
                            >
                          <FaEdit size={16} />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <FaTrash size={16} />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <FaEye size={16} />
                        </button>
                        {job.status === 'active' ? (
                          <button className="text-yellow-600 hover:text-yellow-900">
                            <FaPause size={16} />
                          </button>
                        ) : (
                          <button className="text-green-600 hover:text-green-900">
                            <FaPlay size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </EmployerLayout>
  );
};

export default PostedJobsPage;