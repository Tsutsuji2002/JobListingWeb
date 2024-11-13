import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import JobCard from '../components/jobs/JobCard';
import { 
  FaTrash
} from 'react-icons/fa';
import { UserSideNav } from '../components/user/UserSideNav';

const SavedJobsPage = () => {
    const savedJobs = [
      {
        id: 1,
        title: "Senior Frontend Developer",
        company: "Tech Corp",
        location: "San Francisco, CA",
        type: "Full-time",
        description: "Looking for an experienced frontend developer...",
        savedDate: "2024-03-15"
      },
      // Add more saved jobs...
    ];
  
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <UserSideNav activeTab="saved jobs" />
            </div>
            
            <div className="lg:col-span-3">
              <h1 className="text-2xl font-bold text-gray-800 mb-6">Công việc đã lưu</h1>
              <div className="space-y-4">
                {savedJobs.map((job) => (
                  <div key={job.id} className="relative">
                    <JobCard job={job} onClick={() => {}} />
                    <button className="absolute top-4 right-4 text-red-500 hover:text-red-600">
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  };

  export default SavedJobsPage;