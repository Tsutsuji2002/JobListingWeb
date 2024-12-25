import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { uploadCV, resetSuccess, resetError } from '../../redux/slices/cvSlice';
import Layout from '../components/layout/Layout';
import { Upload, FilePlus, FileCheck, AlertCircle, X, Eye } from 'lucide-react';

const FILE_SIZE_LIMIT = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const Alert = ({ variant = 'default', children }) => {
  const variantStyles = {
    default: 'bg-blue-50 border-blue-200 text-blue-700',
    destructive: 'bg-red-50 border-red-200 text-red-700',
    success: 'bg-green-50 border-green-200 text-green-700'
  };

  return (
    <div 
      className={`p-4 rounded-md border flex items-center space-x-3 ${variantStyles[variant]}`}
    >
      {children}
    </div>
  );
};

export default function CreateCVPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, success } = useSelector((state) => state.cvs);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    console.log('userID:', userId);
    if (!userId) {
      navigate('/user/login');
    }
  }, [dispatch, navigate]);

  useEffect(() => {
    if (success) {
      navigate('/user/cv');
      dispatch(resetSuccess());
    }
  }, [success, navigate, dispatch]);

  const validateFile = (file) => {
    if (!file) {
      dispatch(resetError());
      return false;
    }
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      dispatch(resetError());
      return false;
    }
    if (file.size > FILE_SIZE_LIMIT) {
      dispatch(resetError());
      return false;
    }
    return true;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
      // Tạo URL xem trước cho PDF
      if (selectedFile.type === 'application/pdf') {
        setPreview(URL.createObjectURL(selectedFile));
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && validateFile(droppedFile)) {
      setFile(droppedFile);
      if (droppedFile.type === 'application/pdf') {
        setPreview(URL.createObjectURL(droppedFile));
      }
    }
  };

  const handleUpload = () => {
    const userId = localStorage.getItem('userId');
    if (!file) return;
    
    dispatch(uploadCV({ file, userId }));
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    dispatch(resetError());
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Tải Lên CV Của Bạn</h1>
        
        <div className="mb-8">
          <p className="text-gray-600 mb-4">
            Tải lên CV của bạn để ứng tuyển công việc. Chúng tôi chấp nhận các tệp PDF và Word có dung lượng tối đa 10MB.
          </p>
          
          {/* Khu vực tải lên */}
          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center 
              ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} 
              ${file ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {!file ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <FilePlus className="h-12 w-12 text-gray-400" />
                </div>
                <div>
                  <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer">
                    <Upload className="w-5 h-5 mr-2" />
                    Chọn Tệp
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
                <p className="text-sm text-gray-500">
                  hoặc kéo và thả tệp của bạn vào đây
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <FileCheck className="h-12 w-12 text-green-500" />
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-medium">{file.name}</span>
                  <button
                    onClick={clearFile}
                    className="p-1 hover:bg-gray-200 rounded-full"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Thông báo lỗi */}
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4 mr-2" />
              <div>
                <h3 className="font-medium">Lỗi</h3>
                <p>{error}</p>
              </div>
            </Alert>
          )}

          {/* Nút Tải Lên */}
          {file && (
            <div className="mt-6 flex gap-4">
              <button
                onClick={handleUpload}
                disabled={loading}
                className={`inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700
                  ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Upload className="w-5 h-5 mr-2" />
                {loading ? 'Đang tải lên...' : 'Tải Lên CV'}
              </button>
              
              {preview && (
                <button
                  onClick={() => window.open(preview)}
                  className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  <Eye className="w-5 h-5 mr-2" />
                  Xem Trước
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
