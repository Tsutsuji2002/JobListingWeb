import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAdminIndustries,
  createIndustry,
  updateIndustry,
  restoreIndustry,
  deleteIndustry,
  deleteIndustryPermanently,
  searchIndustries,
  clearSelectedIndustry,
  clearError,
  selectAllIndustries,
  selectSelectedIndustry,
  selectSearchResults,
  selectIndustryStatus,
  selectIndustryError
} from '../../redux/slices/industrySlice';
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

const IndustriesManage = () => {
  const dispatch = useDispatch();
  const industries = useSelector(selectAllIndustries);
  const selectedIndustry = useSelector(selectSelectedIndustry);
  const searchResults = useSelector(selectSearchResults);
  const status = useSelector(selectIndustryStatus);
  const error = useSelector(selectIndustryError);

  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [isEdit, setIsEdit] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleteType, setDeleteType] = useState('soft');

  const tableContainerRef = useRef(null);
  const lastActionRef = useRef(null);
  const isInitialLoadRef = useRef(true);

  const fetchData = useCallback(() => {
    if (searchTerm) {
      dispatch(searchIndustries(searchTerm));
    } else {
      dispatch(fetchAdminIndustries());
    }
  }, [searchTerm, dispatch]);

  useEffect(() => {
    if (isInitialLoadRef.current || searchTerm) {
      fetchData();

      if (isInitialLoadRef.current) {
        isInitialLoadRef.current = false;
      }
    }
  }, [fetchData, searchTerm]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        dispatch(searchIndustries(searchTerm));
      } else {
        dispatch(fetchAdminIndustries());
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, dispatch]);

  useEffect(() => {
    if (tableContainerRef.current) {
      const container = tableContainerRef.current;

      if (lastActionRef.current) {
        const rowToScrollTo = container.querySelector(`[data-industry-id="${lastActionRef.current}"]`);
        if (rowToScrollTo) {
          rowToScrollTo.scrollIntoView({ block: 'center' });
          lastActionRef.current = null;
        }
      }
    }
  }, [industries, searchResults]);

  const handleAction = async (industryId, actionFn, successMessage) => {
    lastActionRef.current = industryId;

    await actionFn();
    toast.success(successMessage);
    setConfirmDelete(null);
    dispatch(fetchAdminIndustries());
  };

  const handleOpen = (industry = null) => {
    if (industry) {
      setFormData(industry);
      setIsEdit(true);
    } else {
      setFormData({ name: '', description: '' });
      setIsEdit(false);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setIsEdit(false);
    setFormData({ name: '', description: '' });
    dispatch(clearSelectedIndustry());
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
      await dispatch(updateIndustry({ id: selectedIndustry.industryID, industryData: formData }));
      toast.success('Cập nhật ngành nghề thành công!');
    } else {
      await dispatch(createIndustry(formData));
      toast.success('Thêm ngành nghề mới thành công!');
    }
    handleClose();
    dispatch(fetchAdminIndustries());
  };

  const handleDelete = (id) => {
    setConfirmDelete(id);
    const industry = industries.find(industry => industry.industryID === id);
    if (industry && industry.isDeleted) {
      setDeleteType('permanent');
    } else {
      setDeleteType('soft');
    }
  };

  const confirmDeleteIndustry = () => handleAction(
    confirmDelete,
    () => deleteType === 'soft'
      ? dispatch(deleteIndustry(confirmDelete))
      : dispatch(deleteIndustryPermanently(confirmDelete)),
    deleteType === 'soft'
      ? 'Xóa ngành nghề thành công!'
      : 'Xóa vĩnh viễn ngành nghề thành công!'
  );

  const handleRestore = (id) => handleAction(
    id,
    () => dispatch(restoreIndustry(id)),
    'Khôi phục ngành nghề thành công!'
  );

  const handleClearSearch = () => {
    setSearchTerm('');
    dispatch(fetchAdminIndustries());
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h4" className="text-red-700">
          Quản Lý Ngành Nghề
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => handleOpen()}
        >
          Thêm Ngành Nghề Mới
        </Button>
      </div>

      <div className="mb-4 flex items-center">
        <TextField
          label="Tìm kiếm ngành nghề"
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
                <TableCell className="text-white">Mô Tả</TableCell>
                <TableCell className="text-white">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(searchResults.length > 0 ? searchResults : industries || []).map((industry) => (
                <TableRow
                  key={industry.industryID}
                  data-industry-id={industry.industryID}
                  className={industry.isDeleted ? 'bg-red-100' : 'bg-white'}
                >
                  <TableCell>{industry.industryID}</TableCell>
                  <TableCell>{industry.name}</TableCell>
                  <TableCell>{industry.description}</TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleOpen(industry)}
                      color="primary"
                      title="Chỉnh sửa"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(industry.industryID)}
                      color="error"
                      title="Xóa"
                    >
                      <Delete />
                    </IconButton>
                    {industry.isDeleted && (
                      <IconButton
                        onClick={() => handleRestore(industry.industryID)}
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
        <DialogTitle>{isEdit ? 'Chỉnh Sửa Ngành Nghề' : 'Thêm Ngành Nghề Mới'}</DialogTitle>
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
            label="Mô Tả"
            name="description"
            value={formData.description}
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
            Bạn có chắc chắn muốn xóa ngành nghề này?
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
              ? 'Ngành nghề sẽ bị ẩn nhưng vẫn còn trong hệ thống'
              : 'Ngành nghề và các thông tin liên quan sẽ bị xóa hoàn toàn khỏi hệ thống'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Hủy</Button>
          <Button
            onClick={confirmDeleteIndustry}
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

export default IndustriesManage;
