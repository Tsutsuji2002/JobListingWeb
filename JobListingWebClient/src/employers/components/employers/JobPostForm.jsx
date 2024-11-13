import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLocations } from '../../../redux/slices/locationSlice';
import { fetchIndustries } from '../../../redux/slices/industrySlice';
// import { fetchJobLevels } from '../store/jobLevelSlice';

const JobPostForm = ({ onSubmit }) => {
  const dispatch = useDispatch();
  
  const locations = useSelector(state => state.locations.locations);
  const industries = useSelector(state => state.industries.industries);
  // const jobLevels = useSelector(state => state.jobLevels.jobLevels);
  
  const locationsLoading = useSelector(state => state.locations.status === 'loading');
  const industriesLoading = useSelector(state => state.industries.loading);
  // const jobLevelsLoading = useSelector(state => state.jobLevels.loading);

  useEffect(() => {
    dispatch(fetchLocations());
    dispatch(fetchIndustries());
    // dispatch(fetchJobLevels());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const jobData = {
      title: formData.get('title'),
      description: formData.get('description'),
      jobCategory: formData.get('jobCategory'),
      salary: formData.get('salary'),
      companyID: parseInt(formData.get('companyID')),
      education: formData.get('education'),
      jobLevelID: parseInt(formData.get('jobLevelID')),
      industryID: parseInt(formData.get('industryID')),
      minimumQualifications: formData.get('minimumQualifications'),
      locationID: parseInt(formData.get('locationID')),
      preferredLanguage: formData.get('preferredLanguage'),
      jobDuties: formData.get('jobDuties')
    };
    onSubmit(jobData);
  };

  if (locationsLoading || industriesLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-600">Loading form data...</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-gray-700 font-medium mb-2">Job Title</label>
        <input
          type="text"
          name="title"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          maxLength={100}
        />
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-2">Description</label>
        <textarea
          name="description"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="6"
          required
        ></textarea>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 font-medium mb-2">Job Category</label>
          <input
            type="text"
            name="jobCategory"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={100}
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">Salary</label>
          <input
            type="text"
            name="salary"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={100}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 font-medium mb-2">Location</label>
          <select
            name="locationID"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Location</option>
            {locations.map(location => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">Industry</label>
          <select
            name="industryID"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Industry</option>
            {industries.map(industry => (
              <option key={industry.id} value={industry.id}>
                {industry.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* <div>
          <label className="block text-gray-700 font-medium mb-2">Job Level</label>
          <select
            name="jobLevelID"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Job Level</option>
            {jobLevels.map(level => (
              <option key={level.id} value={level.id}>
                {level.name}
              </option>
            ))}
          </select>
        </div> */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Education</label>
          <input
            type="text"
            name="education"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={100}
          />
        </div>
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-2">Minimum Qualifications</label>
        <textarea
          name="minimumQualifications"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="4"
          required
          maxLength={100}
        ></textarea>
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-2">Job Duties</label>
        <textarea
          name="jobDuties"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="4"
          required
        ></textarea>
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-2">Preferred Language</label>
        <input
          type="text"
          name="preferredLanguage"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          maxLength={50}
        />
      </div>

      <input type="hidden" name="companyID" value="1" /> {/* Replace with actual company ID */}

      <button
        type="submit"
        className="w-full bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Post Job
      </button>
    </form>
  );
};

export default JobPostForm;