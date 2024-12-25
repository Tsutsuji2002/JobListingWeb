import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  CircularProgress,
  IconButton,
  MenuItem
} from '@mui/material';
import { Edit, Delete, Assessment, Visibility, Restore, Star, StarBorder, PauseCircle, PlayCircle, Check } from '@mui/icons-material';
import { Eye } from 'lucide-react';
import CVPreviewModal from '../components/common/CVPreviewModal';
import {
  fetchAdminJobsbyComp,
  deleteJob,
  deleteJobPermanently,
  restoreJob,
  updateJobStatus,
  extendJob,
  toggleFeatureJob
} from '../../redux/slices/jobSlice';
import { previewCV } from '../../redux/slices/cvSlice';
import { getIndustryById } from '../../redux/slices/industrySlice';

const JobsByCompany = () => {
  const { companyId, companyName } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleteType, setDeleteType] = useState('soft');
  const [industryNames, setIndustryNames] = useState({});
  const [showApplications, setShowApplications] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [extensionDays, setExtensionDays] = useState(10);
  const [extendError, setExtendError] = useState('');
  const [cvPreviewData, setCvPreviewData] = useState(null);

  const [statusFilter, setStatusFilter] = useState('all');

  const { compJobs, loading } = useSelector((state) => state.jobs);

  useEffect(() => {
    if (companyId) {
      dispatch(fetchAdminJobsbyComp(companyId));
    }
  }, [dispatch, companyId]);

  useEffect(() => {
    const fetchIndustryNames = async () => {
      const names = {};
      const uniqueIndustryIds = [...new Set(compJobs.map(job => job.industryID))];

      for (const industryId of uniqueIndustryIds) {
        try {
          const industryData = await dispatch(getIndustryById(industryId)).unwrap();
          names[industryId] = industryData.name;
        } catch (error) {
          console.error(`Error fetching industry name for ID ${industryId}:`, error);
          names[industryId] = 'Ngành nghề không xác định';
        }
      }

      setIndustryNames(names);
    };

    if (compJobs.length > 0) {
      fetchIndustryNames();
    }
  }, [compJobs, dispatch]);

  const handleDelete = async () => {
    try {
      let result;
      if (confirmDelete.isDeleted) {
        result = await dispatch(deleteJobPermanently(confirmDelete.jobID)).unwrap();
        toast.success(`Đã xóa vĩnh viễn việc làm "${confirmDelete.title}"`);
      } else {
        if (deleteType === 'soft') {
          result = await dispatch(deleteJob(confirmDelete.jobID)).unwrap();
          toast.success(`Đã ẩn việc làm "${confirmDelete.title}"`);
        } else {
          result = await dispatch(deleteJobPermanently(confirmDelete.jobID)).unwrap();
          toast.success(`Đã xóa vĩnh viễn việc làm "${confirmDelete.title}"`);
        }
      }
      setConfirmDelete(null);
      setDeleteType('soft');
      dispatch(fetchAdminJobsbyComp(companyId));
    } catch (error) {
      toast.error(`Lỗi khi xóa việc làm: ${error.message}`);
      console.error('Lỗi khi xóa việc làm:', error);
    }
  };

  const handleToggleStatus = async (jobId, currentStatus) => {
    if (currentStatus === 0) {
      setSelectedJobId(jobId);
      setExtensionDays(10); // Reset to default
      setExtendError('');
      setIsModalOpen(true);
      return;
    }

    const newStatus = currentStatus === 1 ? 2 : 1;
    try {
      await dispatch(updateJobStatus({ jobId, status: newStatus })).unwrap();
      dispatch(fetchAdminJobsbyComp(companyId));

      toast.info(
        newStatus === 1
          ? `Đã kích hoạt lại việc làm`
          : `Đã tạm dừng việc làm`
      );
    } catch (error) {
      toast.error(`Lỗi cập nhật trạng thái: ${error.message}`);
      console.error('Lỗi cập nhật trạng thái:', error);
    }
  };

  const handleShowApplications = (job) => {
    setSelectedJob(job);
    setShowApplications(true);
  };

  const handleExtendJob = async () => {
    try {
      if (!extensionDays || extensionDays < 1) {
        setExtendError('Số ngày gia hạn phải lớn hơn 0');
        return;
      }

      await dispatch(extendJob({
        jobId: selectedJobId,
        days: parseInt(extensionDays)
      })).unwrap();

      dispatch(fetchAdminJobsbyComp(companyId));
      setIsModalOpen(false);
      setSelectedJobId(null);
      setExtendError('');

      toast.success(`Đã gia hạn việc làm thêm ${extensionDays} ngày`);
    } catch (error) {
      setExtendError('Có lỗi xảy ra khi gia hạn công việc');
      toast.error(`Lỗi gia hạn: ${error.message}`);
      console.error('Lỗi gia hạn:', error);
    }
  };

  const handleRestoreJob = async (jobId) => {
    try {
      await dispatch(restoreJob(jobId)).unwrap();
      dispatch(fetchAdminJobsbyComp(companyId));
      toast.success('Việc làm đã được khôi phục');
    } catch (error) {
      toast.error(`Lỗi khôi phục việc làm: ${error.message}`);
      console.error('Lỗi khôi phục:', error);
    }
  };

  const handleExtensionDaysChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setExtensionDays(value);
      setExtendError('');
    }
  };

  const handlePreviewCV = (cvId) => {
    dispatch(previewCV(cvId)).then((action) => {
      if (action.payload) {
        setCvPreviewData(action.payload);
        toast.info('Xem trước CV');
      }
    }).catch((error) => {
      toast.error(`Lỗi xem trước CV: ${error.message}`);
      console.error('Preview error:', error);
    });
  };

  const handleFeatureToggle = async (jobId, currentStatus) => {
    try {
      await dispatch(toggleFeatureJob(jobId)).unwrap();
      dispatch(fetchAdminJobsbyComp(companyId));
      toast.success(currentStatus ? 'Đã gỡ việc làm khỏi danh sách nổi bật' : 'Đã đánh dấu việc làm nổi bật');
    } catch (error) {
      toast.error('Không thể thay đổi trạng thái nổi bật');
      console.error('Lỗi thay đổi trạng thái nổi bật:', error);
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 1:
        return 'Đang hoạt động';
      case 2:
        return 'Tạm dừng';
      case 0:
        return 'Hết hạn';
      case 3:
        return 'Chờ duyệt';
      default:
        return 'Không xác định';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 1:
        return 'success.main';
      case 2:
        return 'warning.main';
      case 0:
        return 'error.main';
      case 3:
        return 'info.main';
      default:
        return 'text.secondary';
    }
  };

  const handleApproveJob = async (jobId) => {
    try {
      await dispatch(updateJobStatus({ jobId, status: 1 })).unwrap();
      dispatch(fetchAdminJobsbyComp(companyId));
      toast.success('Đã duyệt việc làm thành công');
    } catch (error) {
      toast.error(`Lỗi khi duyệt việc làm: ${error.message}`);
    }
  };

  const filteredJobs = compJobs.filter(job =>
    (job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (industryNames[job.industryID] || '').toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === 'all' || job.status.toString() === statusFilter)
  );

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <Typography variant="h4" className="mb-6 text-red-700">
        Quản Lý Việc Làm Của Công Ty {companyName}
      </Typography>

      <TextField
        label="Tìm kiếm việc làm"
        variant="outlined"
        size="small"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-64 mb-6"
      />

      <TextField
        select
        label="Trạng thái"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        size="small"
        className="w-48"
      >
        <MenuItem value="all">Tất cả</MenuItem>
        <MenuItem value="3">Chờ duyệt</MenuItem>
        <MenuItem value="1">Đang hoạt động</MenuItem>
        <MenuItem value="2">Tạm dừng</MenuItem>
        <MenuItem value="0">Hết hạn</MenuItem>
      </TextField>

      {loading ? (
        <div className="flex justify-center">
          <CircularProgress />
        </div>
      ) : (
        <TableContainer component={Paper} className="max-h-[600px] overflow-auto">
          <Table stickyHeader>
            <TableHead style={{ backgroundColor: '#dc2626', color: 'white' }}>
              <TableRow>
                <TableCell className="text-white">ID</TableCell>
                <TableCell className="text-white">Tiêu đề</TableCell>
                <TableCell className="text-white">Ngành nghề</TableCell>
                <TableCell className="text-white">Ngày đăng</TableCell>
                <TableCell className="text-white">Ngày hết hạn</TableCell>
                <TableCell className="text-white">Trạng thái</TableCell>
                <TableCell className="text-white">Số lượng ứng tuyển</TableCell>
                <TableCell className="text-white">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredJobs.map((job) => (
                <TableRow
                  key={job.jobID}
                  className={job.isDeleted ? 'bg-red-100' : job.status === 0 ? 'bg-yellow-100' : job.status === 2 ? 'bg-blue-100' : job.status === 3 ? 'bg-purple-100' : 'bg-white'}
                >
                  <TableCell>{job.jobID}</TableCell>
                  <TableCell>{job.title}</TableCell>
                  <TableCell>{industryNames[job.industryID] || 'Đang tải...'}</TableCell>
                  <TableCell>{new Date(job.postedDate).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell>{new Date(job.closingDate).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell>
                    <Typography color={getStatusColor(job.status)}>
                      {getStatusText(job.status)}
                    </Typography>
                  </TableCell>
                  <TableCell>{job.applications?.length || 0}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <IconButton
                        onClick={() => navigate(`/admin/manage/jobs/edit/${job.jobID}`)}
                        color="primary"
                        title="Chỉnh sửa"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        onClick={() => setConfirmDelete(job)}
                        color="error"
                        title="Xóa"
                      >
                        <Delete />
                      </IconButton>
                      {job.isDeleted && (
                        <IconButton
                          onClick={() => handleRestoreJob(job.jobID)}
                          color="success"
                          title="Khôi phục"
                        >
                          <Restore />
                        </IconButton>
                      )}
                      {job.status !== 3 && (
                        <IconButton
                          onClick={() => handleToggleStatus(job.jobID, job.status)}
                          color={job.status === 1 ? "warning" : "success"}
                          title={job.status === 1 ? "Tạm dừng" : "Kích hoạt"}
                        >
                          {job.status === 1 ? <PauseCircle /> : <PlayCircle />}
                        </IconButton>
                      )}
                      {job.status === 3 && (
                        <IconButton
                          onClick={() => handleApproveJob(job.jobID)}
                          color="success"
                          title="Duyệt việc làm"
                        >
                          <Check />
                        </IconButton>
                      )}
                      <IconButton
                        onClick={() => handleShowApplications(job)}
                        color="info"
                        title="Xem ứng tuyển"
                      >
                        <Assessment />
                      </IconButton>
                      <IconButton
                        onClick={() => handleFeatureToggle(job.jobID, job.isFeatured)}
                        color={job.isFeatured ? "primary" : "default"}
                        title={job.isFeatured ? "Gỡ nổi bật" : "Đánh dấu nổi bật"}
                      >
                        {job.isFeatured ? <Star /> : <StarBorder />}
                      </IconButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa việc làm "{confirmDelete?.title}"?
          </Typography>
          {!confirmDelete?.isDeleted && (
            <TextField
              select
              label="Loại xóa"
              value={deleteType}
              onChange={(e) => setDeleteType(e.target.value)}
              fullWidth
              margin="normal"
            >
              <MenuItem value="soft">Xóa tạm thời</MenuItem>
              <MenuItem value="permanent">Xóa vĩnh viễn</MenuItem>
            </TextField>
          )}
          <Typography variant="body2" color="textSecondary" className="mt-2">
            {deleteType === 'soft'
              ? 'Việc làm sẽ bị ẩn nhưng vẫn còn trong hệ thống'
              : 'Việc làm và các ứng tuyển liên quan sẽ bị xóa hoàn toàn khỏi hệ thống'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Hủy</Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
          >
            {confirmDelete?.isDeleted ? 'Xóa vĩnh viễn' : (deleteType === 'soft' ? 'Xóa tạm thời' : 'Xóa vĩnh viễn')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Applications Dialog */}
      <Dialog
        open={showApplications}
        onClose={() => setShowApplications(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Danh sách ứng tuyển - {selectedJob?.title}
        </DialogTitle>
        <DialogContent>
          {selectedJob?.applications?.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Ứng viên</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Ngày ứng tuyển</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedJob.applications.map((application) => (
                    <TableRow key={application.applicationId}>
                      <TableCell>
                        {application.user.firstName && application.user.lastName
                          ? `${application.user.firstName} ${application.user.lastName}`
                          : application.user.userName}
                      </TableCell>
                      <TableCell>{application.user.email}</TableCell>
                      <TableCell>
                        {new Date(application.applicationDate).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell>{application.status}</TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => navigate(`/admin/applications/${application.applicationId}`)}
                          color="primary"
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton
                          onClick={() => handlePreviewCV(application.cvid)}
                          color="primary"
                          title="Xem trước CV"
                        >
                          <Eye />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography>Chưa có ứng tuyển nào cho việc làm này</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowApplications(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Extend Job Modal */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="sm"
      >
        <DialogContent>
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              Gia hạn công việc
            </h3>
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Công việc đã hết hạn, vui lòng nhập số ngày muốn gia hạn:
              </p>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="1"
                  value={extensionDays}
                  onChange={handleExtensionDaysChange}
                  placeholder="Nhập số ngày"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-500">ngày</span>
              </div>
              {extendError && (
                <p className="text-sm text-red-500">{extendError}</p>
              )}
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <button
            onClick={() => {
              setIsModalOpen(false);
              setExtendError('');
            }}
            className="mt-3 inline-flex justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            onClick={handleExtendJob}
            className="inline-flex justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
          >
            Đồng ý
          </button>
        </DialogActions>
      </Dialog>

      {/* CV Preview Modal */}
      <CVPreviewModal
        isOpen={!!cvPreviewData}
        onClose={() => setCvPreviewData(null)}
        cvPreviewData={cvPreviewData}
      />
    </div>
  );
};

export default JobsByCompany;
