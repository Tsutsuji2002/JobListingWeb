import React from 'react';
import { useParams } from 'react-router-dom';
import EmployerLayout from '../components/layout/EmployerLayout';

const EditJobPage = () => {
  const { jobId } = useParams();

  const job = {
    id: 1,
    title: "Senior Software Engineer",
    description: "We are looking for a senior software engineer...",
    jobCategory: "Technology",
    salary: "$120,000 - $150,000",
    industry: "Information Technology",
    education: "Bachelor's degree in Computer Science",
    minimumQualifications: "5+ years of experience in software development",
    locationId: "NYC-001",
    preferredLanguage: "English",
    jobDuties: "- Lead development of new features\n- Mentor junior developers\n- Participate in code reviews",
    postedDate: "2024-03-15",
    closingDate: "2024-04-15"
  };

  return (
    <EmployerLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Edit Job Posting</h2>
          <span className="text-sm text-gray-500">Job ID: {jobId}</span>
        </div>
        
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
          <form className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Job Title</label>
              <input
                type="text"
                name="title"
                defaultValue={job.title}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Job Description</label>
              <textarea
                name="description"
                defaultValue={job.description}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="6"
                required
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Category</label>
                <input
                  type="text"
                  name="jobCategory"
                  defaultValue={job.jobCategory}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Salary Range</label>
                <input
                  type="text"
                  name="salary"
                  defaultValue={job.salary}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Industry</label>
                <input
                  type="text"
                  name="industry"
                  defaultValue={job.industry}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Location ID</label>
                <input
                  type="text"
                  name="locationId"
                  defaultValue={job.locationId}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Education Requirements</label>
              <input
                type="text"
                name="education"
                defaultValue={job.education}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Minimum Qualifications</label>
              <textarea
                name="minimumQualifications"
                defaultValue={job.minimumQualifications}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                required
              ></textarea>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Job Duties</label>
              <textarea
                name="jobDuties"
                defaultValue={job.jobDuties}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                required
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Posting Date</label>
                <input
                  type="date"
                  name="postedDate"
                  defaultValue={job.postedDate}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Closing Date</label>
                <input
                  type="date"
                  name="closingDate"
                  defaultValue={job.closingDate}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </EmployerLayout>
  );
};

export default EditJobPage;