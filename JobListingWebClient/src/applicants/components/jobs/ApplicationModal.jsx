import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaFilePdf, FaFileWord, FaFile, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { fetchUserCVs } from '../../../redux/slices/cvSlice';
import { createApplication } from '../../../redux/slices/applicationSlice';

const ResponseModal = ({ isOpen, onClose, response, isSuccess }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-center mb-4">
          {isSuccess ? (
            <FaCheckCircle className="text-green-500 text-6xl" />
          ) : (
            <FaExclamationCircle className="text-red-500 text-6xl" />
          )}
        </div>
        <h2 className="text-2xl font-bold text-center mb-4">
          {isSuccess ? "Ứng tuyển thành công" : "Lỗi"}
        </h2>
        <p className="text-center mb-4">
          {response}
        </p>
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

const ApplicationModal = ({ isOpen, onClose, jobId, onSubmit }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedCV, setSelectedCV] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [responseModalOpen, setResponseModalOpen] = useState(false);
  const [submitResponse, setSubmitResponse] = useState('');
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);
  const { userCVs, loading } = useSelector((state) => state.cvs);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (isOpen)
    {
      if (userId) {
        dispatch(fetchUserCVs(userId));
      } else {
        navigate('/user/login');
      }
    }   
  }, [dispatch, navigate, userId, isOpen]);
  
  
  const getCVIcon = (contentType) => {
    switch (contentType) {
      case 'application/pdf':
        return <FaFilePdf className="text-red-500" />;
      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return <FaFileWord className="text-blue-500" />;
      default:
        return <FaFile className="text-gray-500" />;
    }
  };

  const handleCVSelect = (cv) => {
    setSelectedCV(prevSelectedCV => 
      prevSelectedCV?.cvid === cv.cvid ? null : cv
    );
  };

  const handleSubmit = async () => {
    if (!selectedCV) {
      alert('Please select a CV');
      return;
    }

    const applicationData = {
      jobId,
      cvId: selectedCV.cvid,
      coverLetter: coverLetter.trim(),
      userId: userId
    };

    try {
      await dispatch(createApplication(applicationData)).unwrap();
      // Success handling
      setSubmitResponse("Đã nộp đơn thành công");
      setIsSubmitSuccess(true);
    } catch (error) {
      // Error handling
      let errorMessage = "Đã xảy ra lỗi";
      
      // Handle specific error scenarios
      switch (error) {
        case "You have already applied to this job":
          errorMessage = "Bạn đã nộp đơn xin việc này rồi";
          break;
        case "Invalid job listing":
          errorMessage = "Danh sách việc làm không hợp lệ";
          break;
        case "Job is no longer accepting applications":
          errorMessage = "Việc làm không còn chấp nhận đơn xin việc nữa";
          break;
        default:
          errorMessage = error || "Đã xảy ra lỗi không mong muốn";
      }
      
      setSubmitResponse(errorMessage);
      setIsSubmitSuccess(false);
    }
    
    setResponseModalOpen(true);
  };

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedCV(null);
      setCoverLetter('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Ứng tuyển vào việc làm</h2>
          
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Chọn CV</h3>
            {loading ? (
              <p>Đang tải danh sách CV...</p>
            ) : userCVs && userCVs.length > 0 ? (
              <div className="grid grid-cols-1 gap-2">
                {userCVs.map(cv => (
                  <div 
                    key={cv.cvid}
                    onClick={() => handleCVSelect(cv)}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition
                      ${selectedCV?.cvid === cv.cvid ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                  >
                    {getCVIcon(cv.contentType)}
                    <span className="ml-2 truncate">{cv.fileName}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Bạn chưa tải lên CV nào</p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-2">
              Thư giới thiệu (Tùy chọn)
            </label>
            <textarea
              id="coverLetter"
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Viết thư giới thiệu cho nhà tuyển dụng (nếu có)"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              disabled={!selectedCV}
            >
              Nộp đơn
            </button>
          </div>
        </div>
      </div>
    </div>
    <ResponseModal 
        isOpen={responseModalOpen}
        onClose={() => setResponseModalOpen(false)}
        response={submitResponse}
        isSuccess={isSubmitSuccess}
    />
    </>
  );
};

export default ApplicationModal;