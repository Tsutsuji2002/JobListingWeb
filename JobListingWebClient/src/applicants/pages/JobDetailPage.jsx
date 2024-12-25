import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../components/layout/Layout';
import { FaMapMarkerAlt, FaClock, FaBuilding, FaDollarSign, FaEnvelope, FaPhone, FaGlobe, FaArrowLeft, FaGraduationCap, FaIndustry, FaLanguage, FaUserTie, FaComment, FaPaperPlane, FaHeart, FaRegHeart } from 'react-icons/fa';
import { ImageApi } from '../../services/ImageApi';
import { fetchJobsbyId } from '../../redux/slices/jobSlice';
import { createApplication } from '../../redux/slices/applicationSlice';
import { createChatRoom } from '../../redux/slices/chatSlice';
import { fetchCurrentApplicant } from '../../redux/slices/authSlice';
import { addFavoriteJob, removeFavoriteJob } from '../../redux/slices/favoriteSlice';
import ApplicationModal from '../components/jobs/ApplicationModal';
import HTMLContent from '../../ultils/HTMLContent';

const JobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, currentUser } = useSelector(state => state.auth);
  const favoriteJobIds = useSelector(state => state.favorites.favoriteJobIds);
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  const handleChatButtonClick = async () => {
    setIsCreatingChat(true);
    try {
      await handleStartConversation();
    } finally {
      setIsCreatingChat(false);
    }
  };

  const currentUserId = localStorage.getItem('userId');
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && currentUser.length === 0) {
      dispatch(fetchCurrentApplicant());
    }
  }, [dispatch]);

  const { jobbyId, loading, error } = useSelector((state) => ({
    jobbyId: state.jobs.jobbyId,
    loading: state.jobs.loading,
    error: state.jobs.error
  }), (prev, next) => {
    return prev.jobbyId?.jobID === next.jobbyId?.jobID &&
           prev.loading === next.loading &&
           prev.error === next.error;
  });

  const [companyLogoUrl, setCompanyLogoUrl] = useState('');
  const [logoError, setLogoError] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);

  const handleSubmitApplication = (applicationData) => {
    dispatch(createApplication(applicationData))
      .unwrap()
      .then(() => {
      })
      .catch((error) => {
        console.error('Application submission failed:', error);
      });
  };

  const getJobStatus = useCallback((status) => {
    switch (status) {
      case 0:
        return { text: 'Hết hạn', class: 'bg-red-100 text-red-800' };
      case 1:
        return { text: 'Đang tuyển', class: 'bg-green-100 text-green-800' };
      case 2:
        return { text: 'Tạm dừng', class: 'bg-yellow-100 text-yellow-800' };
      default:
        return { text: 'Không xác định', class: 'bg-gray-100 text-gray-800' };
    }
  }, []);

  const status = useMemo(() => {
    return getJobStatus(jobbyId?.status);
  }, [jobbyId?.status, getJobStatus]);

  const calculateRemainingDays = useCallback((closingDate) => {
    if (!closingDate) return 'Không có thông tin';

    const today = new Date();
    const closing = new Date(closingDate);
    const timeDiff = closing.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysDiff < 0) return 'Đã hết hạn';
    if (daysDiff === 0) return 'Hôm nay';
    if (daysDiff === 1) return 'Còn 1 ngày';
    return `Còn ${daysDiff} ngày`;
  }, []);

  const formatDate = useCallback((date) => {
    if (!date) return 'Không có thông tin';
    return new Date(date).toLocaleDateString('vi-VN');
  }, []);

  const fetchCompanyLogo = useCallback(async (company) => {
    if (!company?.logo) {
      setLogoError(true);
      return;
    }

    try {
      await ImageApi.getImageById(company.logo);
      setCompanyLogoUrl(company.logo);
      setLogoError(false);
    } catch (error) {
      setLogoError(true);
      console.error('Error fetching company logo:', error);
    }
  }, []);

  useEffect(() => {
    if (id && isInitialLoad) {
      dispatch(fetchJobsbyId(id))
        .unwrap()
        .then(() => {
          setIsInitialLoad(false);
        })
        .catch(error => {
          console.error('Error fetching job:', error);
          setIsInitialLoad(false);
        });
    }
  }, [dispatch, id, isInitialLoad]);

  useEffect(() => {
    if (!isInitialLoad && jobbyId?.company) {
      fetchCompanyLogo(jobbyId.company);
    }
  }, [jobbyId?.company?.logo, isInitialLoad, fetchCompanyLogo]);

  const handleStartConversation = async () => {
    console.log('Button clicked');
    console.log('Auth status:', isAuthenticated);
    console.log('Current user:', currentUser);
    console.log('Company ID:', jobbyId?.company?.userId);


    if (!jobbyId?.company?.userId || !currentUser?.userId) {
        console.error('Missing required IDs:', {
            employerUserId: jobbyId?.company?.userId,
            applicantUserId: currentUser?.userId
        });
        return;
    }

    try {
        setIsCreatingChat(true);
        console.log('Creating chat room with employer ID:', jobbyId.company.userId);
        
        const result = await dispatch(createChatRoom(jobbyId.company.userId)).unwrap();
        console.log('Chat room creation result:', result);
        
        if (result && result.id) {
            console.log('Navigating to chat with room ID:', result.id);
            navigate('/user/chat', {
                state: {
                    selectedRoomId: result.id,
                    employer: {
                        id: jobbyId.company.userId,
                        name: jobbyId.company.name,
                        logo: jobbyId.company.logo,
                        email: jobbyId.company.email
                    }
                }
            });
        } else {
            throw new Error('Invalid chat room response');
        }
    } catch (error) {
        console.error('Failed to create chat room:', error);
    } finally {
        setIsCreatingChat(false);
    }
};

  const handleFavoriteToggle = async () => {
    try {
      if (isFavorite) {
        await dispatch(removeFavoriteJob(jobbyId.jobID)).unwrap();
      } else {
        await dispatch(addFavoriteJob(jobbyId.jobID)).unwrap();
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const isFavorite = favoriteJobIds.includes(jobbyId?.jobID);
  const showFavoriteButton = isAuthenticated && currentUser && currentUserId;

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">Đang tải...</h2>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">Có lỗi xảy ra: {error}</h2>
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

  if (!jobbyId || jobbyId.isDeleted) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">Không tìm thấy việc làm hoặc đã bị xóa</h2>
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
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-16">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate('/jobs')}
            className="mb-6 inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <FaArrowLeft className="mr-2" /> Quay lại danh sách việc làm
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content Column */}
            <div className="lg:col-span-2 bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="bg-blue-600 px-6 py-4">
                <div className="flex items-center gap-4">
                  {companyLogoUrl && !logoError ? (
                    <img
                      src={companyLogoUrl.startsWith('data:') ? companyLogoUrl : `/api/Image${companyLogoUrl}`}
                      alt={jobbyId.company?.name}
                      className="w-16 h-16 object-contain bg-white rounded-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      <FaBuilding className="text-gray-400 text-3xl" />
                    </div>
                  )}
                  <div className="flex-grow">
                    <h1 className="text-3xl font-bold text-white">{jobbyId.title || 'Không có tiêu đề'}</h1>
                    <p className="text-xl text-blue-100 mt-2">{jobbyId.company?.name || 'Không có thông tin công ty'}</p>
                  </div>
                  <button
                    onClick={handleFavoriteToggle}
                    className={`text-2xl p-2 rounded-full ${isFavorite ? 'text-red-300 bg-white' : 'text-gray-300 bg-white'} hover:text-red-300`}
                    title={isFavorite ? 'Bỏ lưu' : 'Lưu công việc'}
                  >
                    {isFavorite ? <FaHeart /> : <FaRegHeart />}
                  </button>

                </div>
              </div>

              <div className="p-6">
                {/* Job Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="mr-2" />
                    <span>{jobbyId.location?.name || 'Không có thông tin địa điểm'}</span>
                  </div>
                  <div className="flex items-center">
                    <FaClock className="mr-2" />
                    <span>{calculateRemainingDays(jobbyId.closingDate)}</span>
                  </div>
                  {jobbyId.salary && (
                    <div className="flex items-center">
                      <FaDollarSign className="mr-2" />
                      <span>{jobbyId.salary}</span>
                    </div>
                  )}
                  {jobbyId.numberofRecruitment && (
                    <div className="flex items-center">
                      <FaUserTie className="mr-2" />
                      <span>Số lượng tuyển: {jobbyId.numberofRecruitment}</span>
                    </div>
                  )}
                </div>

                {/* Job Description Sections */}
                <div className="space-y-6">
                <section>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">Mô tả công việc</h2>
                  <div className="text-gray-600">
                    <HTMLContent
                      content={jobbyId.description}
                      className="prose max-w-none"
                    />
                  </div>
                </section>

                {jobbyId.jobDuties && (
                  <section>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Nhiệm vụ công việc</h2>
                    <div className="text-gray-600">
                      <HTMLContent
                        content={jobbyId.jobDuties}
                        className="prose max-w-none"
                      />
                    </div>
                  </section>
                )}

                {jobbyId.minimumQualifications && (
                  <section>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Yêu cầu tối thiểu</h2>
                    <div className="text-gray-600">
                      <HTMLContent
                        content={jobbyId.minimumQualifications}
                        className="prose max-w-none"
                      />
                    </div>
                  </section>
                )}
                </div>
              </div>
            </div>

            {/* Sidebar Column */}
            <div className="space-y-6">
              {/* Status and Action Section */}
              <div className="bg-white shadow-md rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">Trạng thái</span>
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${status.class}`}
                  >
                    {status.text}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-semibold block mb-1">Ngày đăng</span>
                    {formatDate(jobbyId.postedDate)}
                  </div>
                  <div>
                    <span className="font-semibold block mb-1">Hạn nộp</span>
                    {formatDate(jobbyId.closingDate)}
                  </div>
                  <div>
                    <span className="font-semibold block mb-1">Cấp bậc</span>
                    {jobbyId.jobLevel?.description || 'Không có thông tin'}
                  </div>
                  <div>
                    <span className="font-semibold block mb-1">Cập nhật</span>
                    {formatDate(jobbyId.postedDate)}
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    className={`w-full flex items-center justify-center gap-3
                      px-6 py-3 rounded-lg
                      text-base font-semibold
                      transition duration-300 ease-in-out
                      ${jobbyId.status === 1
                        ? 'bg-blue-600 text-white hover:bg-blue-700 '
                        : 'bg-gray-400 text-white cursor-not-allowed'}
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                    disabled={jobbyId.status !== 1}
                    onClick={() => setIsApplicationModalOpen(true)}
                  >
                    <FaPaperPlane className="w-5 h-5" />
                    {jobbyId.status === 1 ? 'Ứng tuyển ngay' : 'Không thể ứng tuyển'}
                  </button>
                </div>
              </div>

              {/* Company Information */}
              {jobbyId.company && (
                <div className="bg-white shadow-md rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Về {jobbyId.company.name || 'Công ty'}
                  </h2>
                  <div className="text-gray-600 mb-4 text-sm">
                    <HTMLContent
                      content={jobbyId.company.description}
                      className="prose max-w-none prose-sm"
                    />
                  </div>
                  <div className="space-y-3 text-sm text-gray-600">
                    {jobbyId.company.website && (
                      <div className="flex items-center">
                        <FaGlobe className="mr-2 text-blue-500" />
                        <a
                          href={jobbyId.company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline truncate"
                        >
                          {jobbyId.company.website}
                        </a>
                      </div>
                    )}
                    {jobbyId.company.email && (
                      <div className="flex items-center">
                        <FaEnvelope className="mr-2 text-gray-500" />
                        <a
                          href={`mailto:${jobbyId.company.email}`}
                          className="text-blue-600 hover:underline truncate"
                        >
                          {jobbyId.company.email}
                        </a>
                      </div>
                    )}
                    {jobbyId.company.phone && (
                      <div className="flex items-center">
                        <FaPhone className="mr-2 text-green-500" />
                        <span>{jobbyId.company.phone}</span>
                      </div>
                    )}
                  </div>
                  <button
                    className={`w-full flex items-center justify-center gap-2
                        px-4 py-3 rounded-lg
                        bg-gradient-to-r from-green-500 to-green-600
                        text-white font-semibold text-base
                        shadow-md hover:shadow-lg
                        transition duration-300 ease-in-out
                        transform hover:-translate-y-0.5
                        focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2
                        ${!currentUser || !jobbyId?.company?.userId || isCreatingChat 
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'hover:bg-green-600'}`}
                    onClick={handleStartConversation}
                    disabled={!currentUser || !jobbyId?.company?.userId || isCreatingChat}
                >
                    {isCreatingChat ? (
                        <div className="flex items-center gap-2">
                            <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                            <span>Đang tạo...</span>
                        </div>
                    ) : (
                        <>
                            <FaComment className="w-5 h-5" />
                            <span>Liên hệ nhà tuyển dụng</span>
                        </>
                    )}
                </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ApplicationModal
        isOpen={isApplicationModalOpen}
        onClose={() => setIsApplicationModalOpen(false)}
        jobId={jobbyId.jobID}
        onSubmit={handleSubmitApplication}
      />
    </Layout>
  );
};

export default JobDetailPage;
