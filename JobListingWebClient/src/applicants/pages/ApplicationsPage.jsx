import React from 'react';
import Layout from '../components/layout/Layout';
import { 
  FaBriefcase, 
  FaMapMarkerAlt,
  FaClock
} from 'react-icons/fa';
import { UserSideNav } from '../components/user/UserSideNav';

const ApplicationsPage = () => {
    const applications = [
      {
        id: 1,
        job: {
          title: "Senior Frontend Developer",
          company: "Tech Corp",
          location: "San Francisco, CA",
          type: "Full-time"
        },
        status: "Chờ phỏng vấn",
        appliedDate: "2024-03-15",
        lastUpdate: "2024-03-20"
      },
      // Add more applications...
    ];
  
    const getStatusColor = (status) => {
      const colors = {
        "In Review": "text-yellow-600 bg-yellow-50",
        "Accepted": "text-green-600 bg-green-50",
        "Rejected": "text-red-600 bg-red-50",
        "Pending": "text-blue-600 bg-blue-50"
      };
      return colors[status] || "text-gray-600 bg-gray-50";
    };
  
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <UserSideNav activeTab="applications" />
            </div>
            
            <div className="lg:col-span-3">
              <h1 className="text-2xl font-bold text-gray-800 mb-6">Việc làm ứng tuyển</h1>
              <div className="space-y-4">
                {applications.map((application) => (
                  <div key={application.id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">{application.job.title}</h3>
                        <p className="text-gray-600">{application.job.company}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-gray-500">
                            <FaMapMarkerAlt className="inline mr-1" />
                            {application.job.location}
                          </span>
                          <span className="text-gray-500">
                            <FaBriefcase className="inline mr-1" />
                            {application.job.type}
                          </span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(application.status)}`}>
                        {application.status}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>
                        <FaClock className="inline mr-1" />
                        Ứng tuyển lúc: {application.appliedDate}
                      </span>
                      <span>
                        Cập nhật lần cuối: {application.lastUpdate}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  };

  export default ApplicationsPage;