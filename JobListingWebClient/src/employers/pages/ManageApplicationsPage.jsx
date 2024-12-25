import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchJobApplications, 
  updateApplication 
} from '../../redux/slices/applicationSlice';
import { 
  fetchJobsbyId
} from '../../redux/slices/jobSlice';
import { 
  FaEye, 
  FaCheck, 
  FaTimes, 
  FaSort,
  FaEllipsisV,
  FaFileAlt 
} from 'react-icons/fa';
import { Eye } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogActions,
  Snackbar,
  Alert as MuiAlert
} from '@mui/material';
import { previewCV } from '../../redux/slices/cvSlice';
import CVPreviewModal from '../../admin/components/common/CVPreviewModal';

const ManageApplicationsPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [selectedApplication, setSelectedApplication] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState('createdDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentApplicationId, setCurrentApplicationId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [cvPreviewData, setCvPreviewData] = useState(null);

  const { jobApplications, loading, error } = useSelector((state) => state.applications);
  const { jobbyId } = useSelector((state) => state.jobs);

  useEffect(() => {
    dispatch(fetchJobsbyId(jobId));
    dispatch(fetchJobApplications(jobId));
  }, [dispatch, jobId]);

  const handleViewApplicationDetails = (application) => {
    setSelectedApplication(application);
    setCurrentApplicationId(null);
  };

  const handleUpdateApplicationStatus = async (application, status) => {
    if (!application) {
      setErrorMessage('Không tìm thấy ứng viên để cập nhật');
      return;
    }

    try {
      await dispatch(updateApplication({
        id: application.applicationID,
        applicationData: { status }
      })).unwrap();

      dispatch(fetchJobApplications(jobId));
      setCurrentApplicationId(null);
    } catch (error) {
      console.error('Failed to update application status', error);
      setErrorMessage('Không thể cập nhật trạng thái ứng tuyển');
    }
  };

  const handlePreviewCV = (cvId) => {
    dispatch(previewCV(cvId)).then((action) => {
      if (action.payload) {
        setCvPreviewData(action.payload);
        setErrorMessage('Xem trước CV');
      }
    }).catch((error) => {
      setErrorMessage(`Lỗi xem trước CV: ${error.message}`);
      console.error('Preview error:', error);
    });
  };

  const handleCloseErrorMessage = () => {
    setErrorMessage('');
  };

  const filteredAndSortedApplications = jobApplications
    .filter(app => !filterStatus || app.status === filterStatus)
    .sort((a, b) => {
      const modifier = sortDirection === 'desc' ? -1 : 1;
      switch (sortBy) {
        case 'name':
          return modifier * a.user.fullName.localeCompare(b.user.fullName);
        case 'status':
          return modifier * (a.status.localeCompare(b.status));
        default: // applicationDate
          return modifier * (new Date(a.applicationDate) - new Date(b.applicationDate));
      }
    });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Quản Lý Ứng Tuyển - {jobbyId?.title}
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
        >
          Quay Lại
        </button>
      </div>

      {error && (
        <MuiAlert severity="error" className="mb-6">
          {error}
        </MuiAlert>
      )}

      <div className="flex space-x-4 mb-6">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="Chờ duyệt">Chờ duyệt</option>
          <option value="Đã duyệt">Đã duyệt</option>
          <option value="Từ chối">Từ chối</option>
        </select>

        <div className="flex items-center space-x-2">
          <label>Sắp xếp theo:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="createdDate">Ngày ứng tuyển</option>
            <option value="name">Tên ứng viên</option>
            <option value="status">Trạng thái</option>
          </select>
          <button 
            onClick={() => setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc')}
            className="flex items-center px-3 py-2 border border-gray-300 rounded-md"
          >
            {sortDirection === 'desc' ? (
              <><FaSort /> Giảm dần</>
            ) : (
              <><FaSort /> Tăng dần</>
            )}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ứng Viên</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày Ứng Tuyển</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng Thái</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-4">Đang tải...</td>
              </tr>
            ) : filteredAndSortedApplications.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4">Chưa có ứng viên</td>
              </tr>
            ) : (
              filteredAndSortedApplications.map((application) => (
                <tr key={application.applicationID}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {application.user.firstName} {application.user.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {application.user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(application.applicationDate).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {application.status}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 relative">
                    <div className="relative">
                      <button 
                        onClick={() => setCurrentApplicationId(
                          currentApplicationId === application.applicationID ? null : application.applicationID
                        )}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <FaEllipsisV />
                      </button>
                      {currentApplicationId === application.applicationID && (
                        <div className="absolute right-0 z-10 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                          <div className="py-1">
                            <button 
                                onClick={() => handlePreviewCV(application.cvid)}
                                className="block w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-gray-100"
                              >
                                <Eye className="mr-2 inline" /> Xem CV
                              </button>
                            <button 
                              onClick={() => handleViewApplicationDetails(application)}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <FaEye className="mr-2 inline" /> Xem Chi Tiết
                            </button>
                            {application.status === 'Chờ duyệt' && (
                              <>
                                <button 
                                  onClick={() => handleUpdateApplicationStatus(application, 'Đã duyệt')}
                                  className="block w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-gray-100"
                                >
                                  <FaCheck className="mr-2 inline text-green-500" /> Duyệt
                                </button>
                                <button 
                                  onClick={() => handleUpdateApplicationStatus(application, 'Từ chối')}
                                  className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
                                >
                                  <FaTimes className="mr-2 inline text-red-500" /> Từ Chối
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedApplication && (
        <Dialog 
          open={!!selectedApplication}
          onClose={() => setSelectedApplication(null)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Chi Tiết Ứng Tuyển</DialogTitle>
          <DialogContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold">Thông Tin Ứng Viên</h4>
                <p>Họ Tên: {selectedApplication.user.firstName} {selectedApplication.user.lastName}</p>
                <p>Email: {selectedApplication.user.email}</p>
                <p>Số Điện Thoại: {selectedApplication.user.phoneNumber}</p>
              </div>
              <div>
                <h4 className="font-semibold">Thông Tin Công Việc</h4>
                <p>Vị Trí: {jobbyId?.title}</p>
                <p>Ngày Ứng Tuyển: {new Date(selectedApplication.applicationDate).toLocaleDateString('vi-VN')}</p>
                <p>Trạng Thái Hiện Tại: {selectedApplication.status}</p>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Thư Giới Thiệu</h4>
              <p>{selectedApplication.coverLeter || 'Không có thông tin'}</p>
            </div>
          </DialogContent>
          <DialogActions>
            <button
              onClick={() => setSelectedApplication(null)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Đóng
            </button>
          </DialogActions>
        </Dialog>
      )}

      <CVPreviewModal
        isOpen={!!cvPreviewData}
        onClose={() => setCvPreviewData(null)}
        cvPreviewData={cvPreviewData}
      />

      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={handleCloseErrorMessage}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <MuiAlert 
          onClose={handleCloseErrorMessage}
          severity="error" 
          sx={{ width: '100%' }}
        >
          {errorMessage}
        </MuiAlert>
      </Snackbar>
    </div>
  );
};

export default ManageApplicationsPage;