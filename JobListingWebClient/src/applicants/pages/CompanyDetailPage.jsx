import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import JobCard from '../components/jobs/JobCard';
import {
  fetchCompanyById,
  selectSelectedCompany,
  selectCompanyStatus,
  selectCompanyError
} from '../../redux/slices/companySlice';
import { FaMapMarkerAlt, FaGlobe, FaUsers, FaIndustry, FaCalendarAlt } from 'react-icons/fa';
import { ImageApi } from '../../services/ImageApi';
import HTMLContent from '../../ultils/HTMLContent';

const CompanyDetailPage = () => {
  const { companyId } = useParams();
  const dispatch = useDispatch();
  const company = useSelector(selectSelectedCompany);
  const status = useSelector(selectCompanyStatus);
  const error = useSelector(selectCompanyError);
  const [companyLogoUrl, setCompanyLogoUrl] = useState('');
  const [companyBackgroundUrl, setCompanyBackgroundUrl] = useState('');
  const [logoError, setLogoError] = useState(false);
  const [backgroundError, setBackgroundError] = useState(false);

  useEffect(() => {
    if (companyId) {
      dispatch(fetchCompanyById(companyId));
    }
    console.log(companyId, company);
  }, [companyId, dispatch]);

  useEffect(() => {
    const fetchCompanyImages = async () => {
      // Reset image states
      setCompanyLogoUrl('');
      setCompanyBackgroundUrl('');
      setLogoError(false);
      setBackgroundError(false);
  
      if (company) {
        // Fetch Logo
        if (company.logo) {
          try {
            const logoUrl = company.logo.startsWith('data:') 
              ? company.logo 
              : `/api/Image${company.logo}`;
            setCompanyLogoUrl(logoUrl);
          } catch (error) {
            setLogoError(true);
            console.error('Error fetching company logo:', error);
          }
        }
  
        // Fetch Background
        if (company.background) {
          try {
            const backgroundUrl = company.background.startsWith('data:') 
              ? company.background 
              : `/api/Image${company.background}`;
            setCompanyBackgroundUrl(backgroundUrl);
          } catch (error) {
            setBackgroundError(true);
            console.error('Error fetching company background:', error);
          }
        }
      }
    };
  
    fetchCompanyImages();
  }, [company]);
  
  // Loading state
  if (status === 'loading' || !company) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </Layout>
    );
  }

  // Error state
  if (status === 'failed') {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-600">
            <p className="text-xl">Lỗi khi tải thông tin công ty: {error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  // No company found
  if (!company) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p className="text-xl">Không tìm thấy công ty</p>
          </div>
        </div>
      </Layout>
    );
  }

  const formatLocations = (mappingLocations) => {
    return mappingLocations && mappingLocations.length > 0
      ? mappingLocations.map(loc => loc.location.name).join(', ')
      : 'Chưa xác định';
  };

  const formatIndustries = (mappingIndustries) => {
    return mappingIndustries && mappingIndustries.length > 0
      ? mappingIndustries.map(ind => ind.industry.name).join(', ')
      : 'Chưa xác định';
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div
          className="relative rounded-lg shadow-md p-6 mb-8"
          style={{
            backgroundImage: `url(${companyBackgroundUrl || '/api/placeholder/800/400'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Overlay for better contrast */}
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg"></div>

          {/* Content */}
          <div className="relative flex items-center space-x-6 text-white">
            <div
              className="w-24 h-24 rounded-lg bg-white flex items-center justify-center shadow-lg"
            >
              <img
                src={companyLogoUrl || "/api/placeholder/100/100"}
                alt={`${company.name} logo`}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div className="flex-grow">
              <h1 className="text-3xl font-bold mb-2 drop-shadow-md">{company.name}</h1>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-lg" />
                  <span>{formatLocations(company.mappingLocations)}</span>
                </div>
                <div className="flex items-center">
                  <FaGlobe className="mr-2 text-lg" />
                  <Link to={company.website} target="_blank" rel="noopener noreferrer">
                    <span>{company.website || 'Không có website'}</span>
                  </Link>
                </div>
                <div className="flex items-center">
                  <FaCalendarAlt className="mr-2 text-lg" />
                  <span>Năm thành lập: {company.foundedYear || 'Chưa có thông tin'}</span>
                </div>
                <div className="flex items-center">
                  <FaIndustry className="mr-2 text-lg" />
                  <span>{formatIndustries(company.mappingIndustries)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Về công ty</h2>
            <HTMLContent 
              content={company.description} 
              className="text-gray-700 prose max-w-none"
            />
          </section>
            <section className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Vị trí đang tuyển dụng</h2>
              <div className="grid grid-cols-1 gap-4">
                {company.jobListings && company.jobListings.length > 0 ? (
                  company.jobListings.map((job) => (
                    <JobCard
                      key={job.jobListingId}
                      job={job}
                      company={company}
                      onClick={() => {}}
                    />
                  ))
                ) : (
                  <p className="text-gray-600">Hiện tại không có vị trí tuyển dụng</p>
                )}
              </div>
            </section>
          </div>

          <div className="space-y-8">
          <section className="bg-white rounded-lg shadow-md p-6 overflow-hidden">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Quyền lợi</h2>
            {company.benefits ? (
              <div className="max-w-full">
                <HTMLContent 
                  content={company.benefits}
                  className="text-gray-700 prose max-w-none"
                />
              </div>
            ) : (
              <p className="text-gray-600">Chưa có thông tin quyền lợi</p>
            )}
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