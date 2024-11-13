import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { FaMapMarkerAlt, FaClock, FaBuilding, FaDollarSign, FaEnvelope, FaPhone, FaGlobe, FaArrowLeft } from 'react-icons/fa';
import { jobListings } from '../data/jobListings';

const JobDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const job = jobListings.find(job => job.id === parseInt(id, 10));

  if (!job) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">Không tìm thấy việc làm</h2>
            <button
              onClick={() => navigate('/jobs')}
              className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              <FaArrowLeft className="mr-2" /> Quay lại danh sách việc làm
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px- lg:px-16">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/jobs')}
            className="mb-6 inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <FaArrowLeft className="mr-2" /> Quay lại danh sách việc làm
          </button>
          
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="bg-blue-600 px-6 py-4">
              <h1 className="text-3xl font-bold text-white">{job.title}</h1>
              <p className="text-xl text-blue-100 mt-2">{job.company}</p>
            </div>
            
            <div className="p-6">
              <div className="flex flex-wrap items-center text-sm text-gray-600 mb-4">
                <div className="flex items-center mr-4 mb-2">
                  <FaMapMarkerAlt className="mr-2" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center mr-4 mb-2">
                  <FaClock className="mr-2" />
                  <span>{job.type}</span>
                </div>
                {job.salary && (
                  <div className="flex items-center mb-2">
                    <FaDollarSign className="mr-2" />
                    <span>{job.salary}</span>
                  </div>
                )}
              </div>
              
              <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-4">Mô tả công việc</h2>
              <p className="text-gray-600 mb-6">{job.description}</p>
              
              <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-4">Yêu cầu</h2>
              <ul className="list-disc list-inside text-gray-600 mb-6">
                {job.requirements.map((req, index) => (
                  <li key={index} className="mb-2">{req}</li>
                ))}
              </ul>
              
              <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-4">Trách nhiệm</h2>
              <ul className="list-disc list-inside text-gray-600 mb-6">
                {job.responsibilities.map((resp, index) => (
                  <li key={index} className="mb-2">{resp}</li>
                ))}
              </ul>
              
              {job.benefits && (
                <>
                  <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-4">Những lợi ích</h2>
                  <ul className="list-disc list-inside text-gray-600 mb-6">
                    {job.benefits.map((benefit, index) => (
                      <li key={index} className="mb-2">{benefit}</li>
                    ))}
                  </ul>
                </>
              )}
              
              {job.companyInfo && (
                <div className="bg-gray-100 p-6 mt-8 rounded-lg">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">Về {job.company}</h2>
                  <p className="text-gray-600 mb-4">{job.companyInfo.description}</p>
                  <div className="flex flex-wrap items-center text-sm text-gray-600">
                    {job.companyInfo.website && (
                      <div className="flex items-center mr-4 mb-2">
                        <FaGlobe className="mr-2" />
                        <a href={job.companyInfo.website} className="text-blue-600 hover:underline">{job.companyInfo.website}</a>
                      </div>
                    )}
                    {job.companyInfo.email && (
                      <div className="flex items-center mr-4 mb-2">
                        <FaEnvelope className="mr-2" />
                        <a href={`mailto:${job.companyInfo.email}`} className="text-blue-600 hover:underline">{job.companyInfo.email}</a>
                      </div>
                    )}
                    {job.companyInfo.phone && (
                      <div className="flex items-center mb-2">
                        <FaPhone className="mr-2" />
                        <span>{job.companyInfo.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="mt-8 flex justify-center">
                <button className="bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition duration-300">
                 Ứng tuyển vào vị trí này
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default JobDetailsPage;