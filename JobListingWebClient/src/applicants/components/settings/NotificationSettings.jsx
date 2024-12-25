import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MdNotifications, MdEdit, MdDelete, MdAdd } from 'react-icons/md';
import { 
  Button, List, ListItem, ListItemText, 
  ListItemSecondaryAction, IconButton, 
  Dialog, DialogContent, DialogActions,
  CircularProgress
} from '@mui/material';
import { fetchLocations } from '../../../redux/slices/locationSlice';
import { fetchIndustries } from '../../../redux/slices/industrySlice';
import { fetchJobLevels } from '../../../redux/slices/jobSlice';
import { 
  fetchSubscriptions, 
  subscribe, 
  updatePreferences,
  deleteSubscription 
} from '../../../redux/slices/sendmailSlice';
import SubscriptionModal from './SubscriptionModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const NotificationSettings = ({user}) => {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);

  const { locations } = useSelector((state) => state.locations);
  const { industries } = useSelector((state) => state.industries);
  const { jobLevels } = useSelector((state) => state.jobs);
  const { subscriptions, loading, error, success } = useSelector((state) => state.sendmail);

  useEffect(() => {
    if (user?.email) {
      dispatch(fetchLocations());
      dispatch(fetchIndustries());
      dispatch(fetchJobLevels());
      dispatch(fetchSubscriptions(user.email));
    }
  }, [dispatch, user]);
  
  const handleAdd = () => {
    if (!user?.email) {
      toast.error('Vui lòng đăng nhập để thực hiện chức năng này');
      return;
    }
    setEditingSubscription(null);
    setIsModalOpen(true);
  };

  const handleEdit = (subscription) => {
    setEditingSubscription(subscription);
    setIsModalOpen(true);
  };

  const handleDelete = (subscription) => {
    setSelectedSubscription(subscription);
    setDeleteConfirmOpen(true);
  };

  const refreshSubscriptions = () => {
    if (user?.email) {
      dispatch(fetchSubscriptions(user.email));
    }
  };

  const handleSubmit = (values) => {
    if (!user?.email) {
      toast.error('Vui lòng đăng nhập để thực hiện chức năng này');
      return;
    }

    const subscription = {
      ...values,
      email: user.email
    };

    if (editingSubscription) {
      dispatch(updatePreferences({ ...subscription, id: editingSubscription.id }))
        .unwrap()
        .then(() => {
          toast.success('Cập nhật thành công');
          setIsModalOpen(false);
          refreshSubscriptions();
        })
        .catch((error) => {
          toast.error(error.message || 'Có lỗi xảy ra');
        });
    } else {
      dispatch(subscribe(subscription))
        .unwrap()
        .then(() => {
          toast.success('Đăng ký thành công');
          setIsModalOpen(false);
          refreshSubscriptions();
        })
        .catch((error) => {
          toast.error(error.message || 'Có lỗi xảy ra');
        });
    }
  };

  const confirmDelete = () => {
    dispatch(deleteSubscription(selectedSubscription.id))
      .unwrap()
      .then(() => {
        toast.success('Xóa thành công');
        setDeleteConfirmOpen(false);
        refreshSubscriptions();
      })
      .catch((error) => {
        toast.error(error.message || 'Có lỗi xảy ra');
        setDeleteConfirmOpen(false);
      });
  };

  if (!user?.email) {
    return (
      <section className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8 text-gray-600">
          Vui lòng đăng nhập để xem thông tin đăng ký
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <MdNotifications className="mr-2" /> Cài đặt thông báo
        </h2>
        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <MdAdd />}
          onClick={handleAdd}
          color="primary"
          disabled={loading}
        >
          Thêm đăng ký mới
        </Button>
      </div>

      {loading && subscriptions.length === 0 ? (
        <div className="flex justify-center items-center py-8">
          <CircularProgress />
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          Bạn chưa có đăng ký nào
        </div>
      ) : (
        <List>
          {subscriptions.map((subscription) => (
            <ListItem 
              key={subscription.id} 
              divider
              className={loading ? 'opacity-50' : ''}
            >
              <ListItemText
                primary={`Email: ${subscription.email}`}
                secondary={
                  <span>
                    Ngành: {subscription.industryName} | 
                    Địa điểm: {subscription.locationName} | 
                    Cấp bậc: {subscription.jobLevelName}
                  </span>
                }
              />
              <ListItemSecondaryAction>
                <IconButton 
                  onClick={() => handleEdit(subscription)}
                  disabled={loading}
                >
                  <MdEdit />
                </IconButton>
                <IconButton 
                  onClick={() => handleDelete(subscription)} 
                  color="error"
                  disabled={loading}
                >
                  <MdDelete />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      <SubscriptionModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        subscription={editingSubscription}
        locations={locations}
        industries={industries}
        jobLevels={jobLevels}
        loading={loading}
      />

      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogContent>
          Bạn có chắc chắn muốn xóa đăng ký này?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} disabled={loading}>
            Hủy
          </Button>
          <Button 
            onClick={confirmDelete} 
            color="error" 
            variant="contained"
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} color="inherit" />}
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      <ToastContainer />
    </section>
  );
};

export default NotificationSettings;