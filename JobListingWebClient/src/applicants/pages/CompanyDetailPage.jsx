import React from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import JobCard from '../components/jobs/JobCard';
import { FaMapMarkerAlt, FaGlobe, FaUsers, FaIndustry } from 'react-icons/fa';

const CompanyDetailPage = () => {
  const { id } = useParams();
  
  const company = {
    id: 1,
    name: "TechCorp Solutions",
    logo: "/api/placeholder/100/100",
    description: "TechCorp Solutions is a leading technology company specializing in innovative software solutions for enterprise clients. With over 15 years of experience, we've helped hundreds of businesses transform their digital operations.",
    location: "San Francisco, CA",
    website: "www.techcorp.com",
    employeeCount: "1000-5000",
    industry: "Information Technology",
    benefits: [
      "Competitive salary",
      "Health, dental, and vision insurance",
      "401(k) matching",
      "Flexible working hours",
      "Remote work options",
      "Professional development"
    ],
    culture: "We foster an inclusive environment where innovation thrives. Our team members are encouraged to think creatively, take initiative, and grow both personally and professionally.",
    openPositions: [
      {
        id: 1,
        title: "Senior Software Engineer",
        type: "Full-time",
        location: "San Francisco, CA",
        description: "Looking for an experienced software engineer to join our core platform team.",
        company: "TechCorp Solutions"
      },
      {
        id: 2,
        title: "Product Manager",
        type: "Full-time",
        location: "Remote",
        description: "Seeking a product manager to lead our enterprise solutions division.",
        company: "TechCorp Solutions"
      }
    ]
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center space-x-6">
            <img
              src={company.logo}
              alt={`${company.name} logo`}
              className="w-24 h-24 rounded-lg object-cover"
            />
            <div className="flex-grow">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{company.name}</h1>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center text-gray-600">
                  <FaMapMarkerAlt className="mr-2" />
                  <span>{company.location}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FaGlobe className="mr-2" />
                  <span>{company.website}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FaUsers className="mr-2" />
                  <span>{company.employeeCount} nhân viên</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FaIndustry className="mr-2" />
                  <span>{company.industry}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Về công ty</h2>
              <p className="text-gray-700">{company.description}</p>
            </section>

            <section className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Truyền thống công ty</h2>
              <p className="text-gray-700">{company.culture}</p>
            </section>

            <section className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Vị trí tuyển dụng</h2>
              <div className="grid grid-cols-1 gap-4">
                {company.openPositions.map((job) => (
                  <JobCard key={job.id} job={job} onClick={() => {}} />
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <section className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Lợi ích</h2>
              <ul className="space-y-2">
                {company.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </section>

            <button className="w-full bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300">
            Theo dõi công ty
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CompanyDetailPage;