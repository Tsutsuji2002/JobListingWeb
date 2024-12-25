import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
import { Edit, Delete, Check } from '@mui/icons-material';
import {
  fetchUnapprovedJobs,
  updateJobStatus,
  deleteJob,
  deleteJobPermanently,
} from '../../redux/slices/jobSlice';
import { getIndustryById } from '../../redux/slices/industrySlice';

const UnapprovedJobsPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [industryNames, setIndustryNames] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleteType, setDeleteType] = useState('soft');
  const [confirmApprove, setConfirmApprove] = useState(null);

  const { unapprovedJobs, loading } = useSelector((state) => ({
    unapprovedJobs: state.jobs.unapprovedJobs,
    loading: state.jobs.status === 'loading'
  }));

  useEffect(() => {
    dispatch(fetchUnapprovedJobs());
  }, [dispatch]);

  useEffect(() => {
    const fetchIndustryNames = async () => {
      const names = {};
      const uniqueIndustryIds = [...new Set(unapprovedJobs.map(job => job.industryID))];

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

    if (unapprovedJobs.length > 0) {
      fetchIndustryNames();
    }
  }, [unapprovedJobs, dispatch]);

  const handleDelete = async () => {
    try {
      if (deleteType === 'soft') {
        await dispatch(deleteJob(confirmDelete.jobID)).unwrap();
        toast.success(`Đã ẩn việc làm "${confirmDelete.title}"`);
      } else {
        await dispatch(deleteJobPermanently(confirmDelete.jobID)).unwrap();
        toast.success(`Đã xóa vĩnh viễn việc làm "${confirmDelete.title}"`);
      }
      setConfirmDelete(null);
      setDeleteType('soft');
      dispatch(fetchUnapprovedJobs());
    } catch (error) {
      toast.error(`Lỗi khi xóa việc làm: ${error.message}`);
    }
  };

  const handleApprove = async () => {
    try {
      await dispatch(updateJobStatus({ jobId: confirmApprove.jobID, status: 1 })).unwrap();
      dispatch(fetchUnapprovedJobs());
      toast.success('Đã duyệt việc làm thành công');
      setConfirmApprove(null);
    } catch (error) {
      toast.error(`Lỗi khi duyệt việc làm: ${error.message}`);
    }
  };

  const filteredJobs = unapprovedJobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (industryNames[job.industryID] || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <ToastContainer />
      
      <Typography variant="h4" className="mb-6 text-red-700">
        Danh Sách Việc Làm Chờ Duyệt
      </Typography>

      <TextField
        label="Tìm kiếm việc làm"
        variant="outlined"
        size="small"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-64 mb-6"
      />

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
                <TableCell className="text-white">Công ty</TableCell>
                <TableCell className="text-white">Tiêu đề</TableCell>
                <TableCell className="text-white">Ngành nghề</TableCell>
                <TableCell className="text-white">Ngày đăng</TableCell>
                <TableCell className="text-white">Ngày hết hạn</TableCell>
                <TableCell className="text-white">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
                {filteredJobs.map((job) => (
                <TableRow key={job.jobID} className="bg-purple-100">
                    <TableCell>{job.jobID}</TableCell>
                    <TableCell>{job.company?.name || 'N/A'}</TableCell>
                    <TableCell>{job.title}</TableCell>
                    <TableCell>{industryNames[job.industryID] || 'Đang tải...'}</TableCell>
                    <TableCell>{new Date(job.postedDate).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell>{new Date(job.closingDate).toLocaleDateString('vi-VN')}</TableCell>
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
                        <IconButton
                        onClick={() => setConfirmApprove(job)}
                        color="success"
                        title="Duyệt việc làm"
                        >
                        <Check />
                        </IconButton>
                    </div>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
                <DialogTitle>Xác nhận xóa</DialogTitle>
                <DialogContent>
                <Typography>
                    Bạn có chắc chắn muốn xóa việc làm "{confirmDelete?.title}"?
                </Typography>
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
                <Typography variant="body2" color="textSecondary" className="mt-2">
                    {deleteType === 'soft'
                    ? 'Việc làm sẽ bị ẩn nhưng vẫn còn trong hệ thống'
                    : 'Việc làm và các ứng tuyển liên quan sẽ bị xóa hoàn toàn khỏi hệ thống'}
                </Typography>
                </DialogContent>
                <DialogActions>
                <Button onClick={() => setConfirmDelete(null)}>Hủy</Button>
                <Button onClick={handleDelete} variant="contained" color="error">
                    {deleteType === 'soft' ? 'Xóa tạm thời' : 'Xóa vĩnh viễn'}
                </Button>
                </DialogActions>
            </Dialog>

            {/* Approve Confirmation Dialog */}
            <Dialog open={!!confirmApprove} onClose={() => setConfirmApprove(null)}>
                <DialogTitle>Xác nhận duyệt</DialogTitle>
                <DialogContent>
                <Typography>
                    Bạn có chắc chắn muốn duyệt việc làm "{confirmApprove?.title}"?
                </Typography>
                </DialogContent>
                <DialogActions>
                <Button onClick={() => setConfirmApprove(null)}>Hủy</Button>
                <Button onClick={handleApprove} variant="contained" color="success">
                    Duyệt
                </Button>
                </DialogActions>
            </Dialog>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};

export default UnapprovedJobsPage;