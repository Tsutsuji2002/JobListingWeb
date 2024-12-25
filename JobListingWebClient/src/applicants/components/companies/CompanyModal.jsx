import React, { useState, useEffect } from 'react';
import { 
  FaMapMarkerAlt, 
  FaIndustry, 
  FaCalendarAlt, 
  FaGlobe, 
  FaBuilding 
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { ImageApi } from '../../../services/ImageApi';
import HTMLContent from '../../../ultils/HTMLContent';

const CompanyModal = ({ company, onClose }) => {
  const [companyLogoUrl, setCompanyLogoUrl] = useState('');
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    setCompanyLogoUrl('');
    setLogoError(false);

    const fetchCompanyLogo = async () => {
      if (company?.logo) {
        try {
          await ImageApi.getImageById(company.logo);
          setCompanyLogoUrl(company.logo);
        } catch (error) {
          setLogoError(true);
          console.error('Error fetching company logo:', error);
        }
      }
    };

    fetchCompanyLogo();
  }, [company]);

  if (!company) return null;

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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{company.name}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-600 hover:text-gray-900 text-2xl"
          >
            &times;
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-gray-600 mb-2 flex items-center">
              <FaMapMarkerAlt className="mr-2 text-blue-500" /> 
              {formatLocations(company.mappingLocations)}
            </p>
            <p className="text-gray-600 mb-2 flex items-center">
              <FaIndustry className="mr-2 text-green-500" /> 
              {formatIndustries(company.mappingIndustries)}
            </p>
            <p className="text-gray-600 mb-2 flex items-center">
              <FaCalendarAlt className="mr-2 text-purple-500" /> 
              Năm thành lập: {company.foundedYear || 'Chưa có thông tin'}
            </p>
            <p className="text-gray-600 mb-2 flex items-center">
              <FaGlobe className="mr-2 text-red-500" /> 
              {company.website || 'Chưa cập nhật website'}
            </p>
          </div>

          <div className="flex justify-center items-center">
            {companyLogoUrl && !logoError ? (
              <img 
                src={companyLogoUrl.startsWith('data:') ? companyLogoUrl : `/api/Image${companyLogoUrl}`}
                alt={`Logo ${company.name}`} 
                className="max-h-32 max-w-full object-contain rounded-lg"
              />
            ) : (
              <div className="w-32 h-32 bg-gray-200 flex items-center justify-center rounded-lg">
                <FaBuilding className="text-gray-500 text-4xl" />
              </div>
            )}
          </div>
        </div>

        <section className="mb-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Về chúng tôi</h3>
          <HTMLContent 
            content={company.description || 'Chưa có mô tả'} 
            className="prose max-w-none"
          />
        </section>

        <div className="flex justify-end space-x-3 mt-6 border-t pt-4">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
          >
            Đóng
          </button>
          <Link to={`/companies/${company.companyID}`}>
            <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
              Xem chi tiết
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CompanyModal;