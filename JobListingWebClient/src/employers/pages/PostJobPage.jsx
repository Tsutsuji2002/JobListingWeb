import React from 'react';
import EmployerLayout from '../components/layout/EmployerLayout';
import JobPostForm from '../components/employers/JobPostForm';

const PostJobPage = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle job submission logic
  };

  return (
    <EmployerLayout>
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Post a New Job</h2>
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
          <JobPostForm onSubmit={handleSubmit} />
        </div>
      </div>
    </EmployerLayout>
  );
};

export default PostJobPage;