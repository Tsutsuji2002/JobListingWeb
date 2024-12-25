import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAdminLocations,
  createLocation,
  updateLocation,
  restoreLocation,
  deleteLocation,
  deleteLocationPermanently,
  searchLocations,
  clearSelectedLocation,
  clearError,
  selectAllLocations,
  selectSelectedLocation,
  selectSearchResults,
  selectLocationStatus,
  selectLocationError
} from '../../redux/slices/locationSlice';
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  MenuItem
} from '@mui/material';
import { Edit, Delete, Add, Restore, Clear } from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LocationsManage = () => {
  const dispatch = useDispatch();
  const locations = useSelector(selectAllLocations);
  const selectedLocation = useSelector(selectSelectedLocation);
  const searchResults = useSelector(selectSearchResults);
  const status = useSelector(selectLocationStatus);
  const error = useSelector(selectLocationError);

  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    state: '',
    country: '',
    postalCode: ''
  });
  const [isEdit, setIsEdit] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleteType, setDeleteType] = useState('soft');

  const tableContainerRef = useRef(null);
  const lastActionRef = useRef(null);
  const isInitialLoadRef = useRef(true);

  const fetchData = useCallback(() => {
    if (searchTerm) {
      dispatch(searchLocations(searchTerm));
    } else {
      dispatch(fetchAdminLocations());
    }
  }, [searchTerm, dispatch]);

  useEffect(() => {
    if (isInitialLoadRef.current) {
      fetchData();
      isInitialLoadRef.current = false;
    }
  }, [fetchData]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        dispatch(searchLocations(searchTerm));
      } else {
        dispatch(fetchAdminLocations());
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, dispatch]);

  useEffect(() => {
    if (tableContainerRef.current) {
      const container = tableContainerRef.current;

      if (lastActionRef.current) {
        const rowToScrollTo = container.querySelector(`[data-location-id="${lastActionRef.current}"]`);
        if (rowToScrollTo) {
          rowToScrollTo.scrollIntoView({ block: 'center' });
          lastActionRef.current = null;
        }
      }
    }
  }, [locations, searchResults]);

  const handleAction = async (locationId, actionFn, successMessage) => {
    lastActionRef.current = locationId;

    await actionFn();
    toast.success(successMessage);
    setConfirmDelete(null);
    dispatch(fetchAdminLocations());
  };

  const handleOpen = (location = null) => {
    if (location) {
      setFormData(location);
      setIsEdit(true);
    } else {
      setFormData({ name: '', state: '', country: '', postalCode: '' });
      setIsEdit(false);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setIsEdit(false);
    setFormData({ name: '', state: '', country: '', postalCode: '' });
    dispatch(clearSelectedLocation());
    dispatch(clearError());
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async () => {
    if (isEdit) {
      await dispatch(updateLocation({ id: selectedLocation.locationID, locationData: formData }));
      toast.success('Cập nhật địa điểm thành công!');
    } else {
      await dispatch(createLocation(formData));
      toast.success('Thêm địa điểm mới thành công!');
    }
    handleClose();
    dispatch(fetchAdminLocations());
  };

  const handleDelete = (id) => {
    setConfirmDelete(id);
    const location = locations.find(location => location.locationID === id);
    if (location && location.isDeleted) {
      setDeleteType('permanent');
    } else {
      setDeleteType('soft');
    }
  };

  const confirmDeleteLocation = () => handleAction(
    confirmDelete,
    () => deleteType === 'soft'
      ? dispatch(deleteLocation(confirmDelete))
      : dispatch(deleteLocationPermanently(confirmDelete)),
    deleteType === 'soft'
      ? 'Xóa địa điểm thành công!'
      : 'Xóa vĩnh viễn địa điểm thành công!'
  );

  const handleRestore = (id) => handleAction(
    id,
    () => dispatch(restoreLocation(id)),
    'Khôi phục địa điểm thành công!'
  );

  const handleClearSearch = () => {
    setSearchTerm('');
    dispatch(fetchAdminLocations());
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h4" className="text-red-700">
          Quản Lý Địa Điểm
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => handleOpen()}
        >
          Thêm Địa Điểm Mới
        </Button>
      </div>

      <div className="mb-4 flex items-center">
        <TextField
          label="Tìm kiếm địa điểm"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-64 mr-2"
        />
        {searchTerm && (
          <IconButton onClick={handleClearSearch} title="Xóa tìm kiếm">
            <Clear />
          </IconButton>
        )}
      </div>

      {status === 'loading' ? (
        <div className="flex justify-center">
          <CircularProgress />
        </div>
      ) : (
        <TableContainer
          ref={tableContainerRef}
          component={Paper}
          className="max-h-[650px] overflow-auto"
        >
          <Table stickyHeader>
            <TableHead style={{ backgroundColor: '#dc2626', color: 'white' }}>
              <TableRow>
                <TableCell className="text-white">ID</TableCell>
                <TableCell className="text-white">Tên</TableCell>
                <TableCell className="text-white">Tỉnh/Thành</TableCell>
                <TableCell className="text-white">Quốc Gia</TableCell>
                <TableCell className="text-white">Mã Bưu Điện</TableCell>
                <TableCell className="text-white">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(searchResults.length > 0 ? searchResults : locations || []).map((location) => (
                <TableRow
                  key={location.locationID}
                  data-location-id={location.locationID}
                  className={location.isDeleted ? 'bg-red-100' : 'bg-white'}
                >
                  <TableCell>{location.locationID}</TableCell>
                  <TableCell>{location.name}</TableCell>
                  <TableCell>{location.state}</TableCell>
                  <TableCell>{location.country}</TableCell>
                  <TableCell>{location.postalCode}</TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleOpen(location)}
                      color="primary"
                      title="Chỉnh sửa"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(location.locationID)}
                      color="error"
                      title="Xóa"
                    >
                      <Delete />
                    </IconButton>
                    {location.isDeleted && (
                      <IconButton
                        onClick={() => handleRestore(location.locationID)}
                        color="success"
                        title="Khôi phục"
                      >
                        <Restore />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{isEdit ? 'Chỉnh Sửa Địa Điểm' : 'Thêm Địa Điểm Mới'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Tên"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Tỉnh/Thành"
            name="state"
            value={formData.state}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Quốc Gia"
            name="country"
            value={formData.country}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Mã Bưu Điện"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Hủy
          </Button>
          <Button onClick={handleSubmit} color="primary">
            {isEdit ? 'Cập Nhật' : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa địa điểm này?
          </Typography>
          {deleteType === 'soft' && (
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
              ? 'Địa điểm sẽ bị ẩn nhưng vẫn còn trong hệ thống'
              : 'Địa điểm và các thông tin liên quan sẽ bị xóa hoàn toàn khỏi hệ thống'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Hủy</Button>
          <Button
            onClick={confirmDeleteLocation}
            variant="contained"
            color="error"
          >
            {deleteType === 'soft' ? 'Xóa tạm thời' : 'Xóa vĩnh viễn'}
          </Button>
        </DialogActions>
      </Dialog>

      {error && (
        <Typography color="error" className="mt-4">
          {error}
        </Typography>
      )}

      <ToastContainer />
    </div>
  );
};

export default LocationsManage;
