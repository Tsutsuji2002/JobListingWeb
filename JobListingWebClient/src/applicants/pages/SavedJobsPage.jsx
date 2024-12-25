import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from '../components/layout/Layout';
import { UserSideNav } from '../components/user/UserSideNav';
import { fetchFavoriteJobs, removeFavoriteJob } from '../../redux/slices/favoriteSlice';
import SavedJobCard from '../components/jobs/SavedJobCard';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';

const SavedJobsPage = () => {
  const dispatch = useDispatch();
  const { favoriteJobs, loading, error } = useSelector(state => state.favorites);
  const [jobToRemove, setJobToRemove] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    dispatch(fetchFavoriteJobs());
  }, [dispatch]);

  const openConfirmModal = (jobId) => {
    setJobToRemove(jobId);
    setOpenDialog(true);
  };

  const handleClose = () => {
    setJobToRemove(null);
    setOpenDialog(false);
  };

  const handleRemoveFavorite = async () => {
    if (!jobToRemove) return;
    
    try {
      await dispatch(removeFavoriteJob(jobToRemove)).unwrap();
      toast.success('Đã xóa công việc khỏi danh sách yêu thích', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
    } catch (error) {
      toast.error('Không thể xóa công việc. Vui lòng thử lại sau', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
    } finally {
      handleClose();
    }
  };

  useEffect(() => {
    if (error) {
      toast.error('Có lỗi xảy ra: ' + error);
    }
  }, [error]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <p>Đang tải công việc đã lưu...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <ToastContainer />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <UserSideNav activeTab="Công việc đã lưu" />
          </div>

          <div className="lg:col-span-3">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Công việc đã lưu</h1>
            {favoriteJobs.length === 0 ? (
              <p>Bạn chưa có công việc nào được lưu</p>
            ) : (
              <div className="space-y-4">
                {favoriteJobs.map((job) => (
                  <SavedJobCard
                    key={job.jobID}
                    job={job}
                    onRemoveFavorite={() => openConfirmModal(job.jobID)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <Dialog
          open={openDialog}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            Xác nhận xóa
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Bạn có chắc chắn muốn xóa công việc này khỏi danh sách yêu thích?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Hủy
            </Button>
            <Button onClick={handleRemoveFavorite} color="error" variant="contained" autoFocus>
              Xác nhận
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </Layout>
  );
};

export default SavedJobsPage;