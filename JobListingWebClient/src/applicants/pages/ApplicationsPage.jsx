import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { FaBriefcase, FaMapMarkerAlt, FaClock, FaBuilding, FaEye } from 'react-icons/fa';
import { UserSideNav } from '../components/user/UserSideNav';
import { fetchUserApplications } from '../../redux/slices/applicationSlice';
import { ImageApi } from '../../services/ImageApi'; // Import the ImageApi service
import { previewCV, clearCurrentCV } from '../../redux/slices/cvSlice'; // Import CV preview actions

// CV Preview Modal Component
const CVPreviewModal = ({ isOpen, onClose, cvPreviewData }) => {
  if (!isOpen || !cvPreviewData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Xem trước CV</h2>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Đóng
          </button>
        </div>
        <div className="flex-grow overflow-auto">
          {cvPreviewData.contentType === 'application/pdf' ? (
            <iframe
              src={cvPreviewData.url}
              className="w-full h-full border rounded-lg"
              title="CV Preview"
            />
          ) : (
            <p>Xem trước không khả dụng cho loại tệp này</p>
          )}
        </div>
      </div>
    </div>
  );
};

const ApplicationsPage = () => {
    const dispatch = useDispatch();
    const { userApplications, loading, error } = useSelector((state) => state.applications);
    const [companyLogos, setCompanyLogos] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [cvToPreview, setCVToPreview] = useState(null);
    const [currentPreviewData, setCurrentPreviewData] = useState(null);
    const applicationsPerPage = 10;

    useEffect(() => {
        dispatch(fetchUserApplications());
    }, [dispatch]);

    useEffect(() => {
        const fetchCompanyLogos = async () => {
            const logos = {};
            for (const application of userApplications) {
                const company = application.jobListing.company;
                if (company?.logo) {
                    try {
                        await ImageApi.getImageById(company.logo);
                        logos[company.companyID] = company.logo;
                    } catch (error) {
                        console.error('Lỗi khi tải logo công ty:', error);
                    }
                }
            }
            setCompanyLogos(logos);
        };

        fetchCompanyLogos();
    }, [userApplications]);

    const getStatusColor = (status) => {
        const colors = {
            "Đang xem xét": "text-yellow-600 bg-yellow-50",
            "Đã chấp nhận": "text-green-600 bg-green-50",
            "Đã từ chối": "text-red-600 bg-red-50",
            "Đang chờ": "text-blue-600 bg-blue-50",
            "Chờ duyệt": "text-yellow-600 bg-yellow-50" // Added for the new status
        };
        return colors[status] || "text-gray-600 bg-gray-50";
    };

    const indexOfLastApplication = currentPage * applicationsPerPage;
    const indexOfFirstApplication = indexOfLastApplication - applicationsPerPage;
    const currentApplications = userApplications.slice(indexOfFirstApplication, indexOfLastApplication);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handlePreviewCV = (cvId) => {
        dispatch(previewCV(cvId)).then((action) => {
            if (action.payload) {
                setCurrentPreviewData(action.payload);
            }
        }).catch((error) => {
            console.error('Lỗi xem trước:', error);
        });
    };

    const closePreview = () => {
        setCurrentPreviewData(null);
        dispatch(clearCurrentCV());
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

                        {loading && <p className="text-gray-500">Đang tải ứng tuyển...</p>}
                        {error && <p className="text-red-500">Lỗi: {error}</p>}

                        <div className="space-y-4">
                            {currentApplications.length > 0 ? (
                                currentApplications.map((application) => (
                                    <div key={application.applicationID} className="bg-white rounded-lg shadow-md p-6 flex items-start">
                                        <div className="flex-shrink-0 mr-4">
                                            <Link to={`/companies/${application.jobListing.company.companyID}`}>
                                                {companyLogos[application.jobListing.company.companyID] ? (
                                                    <img
                                                        src={companyLogos[application.jobListing.company.companyID].startsWith('data:') ? companyLogos[application.jobListing.company.companyID] : `/api/Image${companyLogos[application.jobListing.company.companyID]}`}
                                                        alt={`Logo ${application.jobListing.company.name}`}
                                                        className="w-32 h-32 object-contain rounded-lg"
                                                    />
                                                ) : (
                                                    <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded-lg">
                                                        <FaBuilding className="text-gray-500 text-4xl" />
                                                    </div>
                                                )}
                                            </Link>
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <Link to={`/jobs/${application.jobListing.jobID}`}>
                                                        <h3 className="text-xl font-semibold text-gray-800 hover:underline">{application.jobListing.title}</h3>
                                                    </Link>
                                                    <Link to={`/companies/${application.jobListing.company.companyID}`}>
                                                        <p className="text-gray-600 hover:underline">{application.jobListing.company.name}</p>
                                                    </Link>
                                                    <div className="flex items-center space-x-4 mt-2">
                                                        <span className="text-gray-500">
                                                            <FaMapMarkerAlt className="inline mr-1" />
                                                            {application.jobListing.location.name}
                                                        </span>
                                                        <span className="text-gray-500">
                                                            <FaBriefcase className="inline mr-1" />
                                                            {application.jobListing.jobLevel.description}
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
                                                    Ứng tuyển lúc: {new Date(application.applicationDate).toLocaleString()}
                                                </span>
                                                <span>
                                                    Cập nhật lần cuối: {new Date(application.jobListing.updatedDate).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="mt-4">
                                                <button
                                                    onClick={() => handlePreviewCV(application.cvid)}
                                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center"
                                                >
                                                    <FaEye className="mr-2" />
                                                    Xem trước CV
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">Không tìm thấy ứng tuyển.</p>
                            )}
                        </div>

                        {/* Pagination Controls */}
                        <div className="flex justify-center mt-6">
                            {Array.from({ length: Math.ceil(userApplications.length / applicationsPerPage) }, (_, i) => (
                                <button
                                    key={i}
                                    onClick={() => paginate(i + 1)}
                                    className={`mx-1 px-3 py-2 rounded ${currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <CVPreviewModal
                isOpen={!!currentPreviewData}
                onClose={closePreview}
                cvPreviewData={currentPreviewData}
            />
        </Layout>
    );
};

export default ApplicationsPage;
