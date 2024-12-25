import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchUserCVs, 
  deleteCV, 
  downloadCV,
  clearCurrentCV,
  resetSuccess,
  previewCV 
} from '../../redux/slices/cvSlice';
import Layout from '../components/layout/Layout';
import { 
  File, 
  Trash2, 
  Download, 
  FileText, 
  Plus, 
  MoreVertical,
  Eye 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Xác nhận Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Hủy
          </button>
          <button 
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

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


// CV Card Component
const CVCard = ({ cv, onDelete, onDownload, onPreview }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="relative bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <FileText className="h-10 w-10 text-blue-500" />
          <div>
            <h3 className="font-semibold text-lg">{cv.fileName || 'CV Không Tiêu Đề'}</h3>
            <p className="text-sm text-gray-500">
              Tải lên vào {formatDate(cv.UploadDate || new Date())}
            </p>
          </div>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <MoreVertical className="h-5 w-5 text-gray-500" />
          </button>
          
          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border rounded-md shadow-lg z-10">
              <button 
                onClick={() => {
                  onPreview(cv.cvid);
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>Xem trước</span>
              </button>
              <button 
                onClick={() => {
                  onDownload(cv.cvid);
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Tải xuống</span>
              </button>
              <button 
                onClick={() => {
                  onDelete(cv.cvid);
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Xóa</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function MyCVPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userCVs, loading, error, success } = useSelector((state) => state.cvs);
  
  const [cvToDelete, setCVToDelete] = useState(null);
  const [cvToPreview, setCVToPreview] = useState(null);
  const [currentPreviewData, setCurrentPreviewData] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      dispatch(fetchUserCVs(userId));
    } else {
      // Chuyển hướng đến trang đăng nhập nếu không có ID người dùng
      navigate('/user/login');
    }
  }, [dispatch, navigate]);

  useEffect(() => {
    if (success) {
      dispatch(resetSuccess());
    }
  }, [success, dispatch]);

  const handleDeleteCV = (cvId) => {
    setCVToDelete(cvId);
  };

  const confirmDeleteCV = () => {
    if (cvToDelete) {
      dispatch(deleteCV(cvToDelete));
      setCVToDelete(null);
    }
  };

  const handleDownloadCV = (cvId) => {
    dispatch(downloadCV(cvId));
  };

  const handlePreviewCV = (cv) => {
    const cvId = typeof cv === 'object' ? cv.cvid : cv;
    
    dispatch(previewCV(cvId)).then((action) => {
      if (action.payload) {
        setCurrentPreviewData(action.payload);
      }
    }).catch((error) => {
      console.error('Preview error:', error);
    });
  };

  const closePreview = () => {
    setCVToPreview(null);
    dispatch(clearCurrentCV());
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Hồ Sơ Của Tôi</h1>
          <button 
            onClick={() => navigate('/user/cv/create')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Tải Lên CV Mới
          </button>
        </div>

        {loading && (
          <div className="text-center py-8">
            <p className="text-gray-500">Đang tải hồ sơ của bạn...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
            {error}
          </div>
        )}

        {!loading && userCVs.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <File className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <p className="text-xl text-gray-600">
              Bạn chưa tải lên bất kỳ hồ sơ nào.
            </p>
            <button 
              onClick={() => navigate('/user/cv/create')}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Tải Lên Hồ Sơ Đầu Tiên
            </button>
          </div>
        )}

        {userCVs.length > 0 && (
          <div className="space-y-4">
            {userCVs.map((cv) => (
              <CVCard
                key={cv.cvid}
                cv={cv}
                onDelete={handleDeleteCV}
                onDownload={handleDownloadCV}
                onPreview={handlePreviewCV}
              />
            ))}
          </div>
        )}

        <ConfirmationModal
          isOpen={!!cvToDelete}
          onClose={() => setCVToDelete(null)}
          onConfirm={confirmDeleteCV}
          title="Xóa CV"
          message="Bạn có chắc chắn muốn xóa CV này không? Hành động này không thể hoàn tác."
        />

        <CVPreviewModal
          isOpen={!!currentPreviewData}
          onClose={() => setCurrentPreviewData(null)}
          cvPreviewData={currentPreviewData}
        />
      </div>
    </Layout>
  );
}