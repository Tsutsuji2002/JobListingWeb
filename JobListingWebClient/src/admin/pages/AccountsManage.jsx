import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  fetchAllUsersByType,
  softDeleteUser,
  permanentDeleteUser,
  restoreSoftDeletedUser
} from '../../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableContainer,
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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
} from '@mui/material';
import { Edit, Delete, Restore, ContentCopy } from '@mui/icons-material';

const TruncatedId = ({ id }) => {
  const truncatedId = `${id.substring(0, 7)}...`;
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(id);
      toast.success('Đã sao chép ID vào clipboard');
    } catch (err) {
      toast.error('Không thể sao chép ID');
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span>{truncatedId}</span>
      <Tooltip title="Sao chép ID">
        <IconButton 
          size="small" 
          onClick={handleCopy}
          className="text-gray-500 hover:text-gray-700"
        >
          <ContentCopy fontSize="small" />
        </IconButton>
      </Tooltip>
    </div>
  );
};

const AccountsManage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { users, loading } = useSelector((state) => state.auth);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteType, setDeleteType] = useState('permanent');
  const [userType, setUserType] = useState('Applicant');
  const tableContainerRef = useRef(null);

  const saveScrollPosition = () => {
    if (tableContainerRef.current) {
      return tableContainerRef.current.scrollTop;
    }
    return 0;
  };

  const restoreScrollPosition = (position) => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTop = position;
    }
  };

  const handleActionWithScrollPreservation = async (actionPromise, successMessage, errorMessage) => {
    const scrollPosition = saveScrollPosition();
    try {
      await actionPromise();
      await dispatch(fetchAllUsersByType({ userType, includeSoftDeleted: true }));

      // Use setTimeout to ensure DOM has updated before restoring scroll
      setTimeout(() => {
        restoreScrollPosition(scrollPosition);
      }, 0);

      // Show success toast
      toast.success(successMessage);
    } catch (error) {
      console.error('Lỗi trong thao tác:', error);
      // Show error toast
      toast.error(errorMessage);
    }
  };

  const handleDelete = async () => {
    const deleteAction = confirmDelete.isDeleted || deleteType === 'permanent'
      ? () => dispatch(permanentDeleteUser(confirmDelete.id))
      : () => dispatch(softDeleteUser(confirmDelete.id));

    const deleteTypeMessage = confirmDelete.isDeleted || deleteType === 'permanent'
      ? 'Xóa vĩnh viễn'
      : 'Xóa tạm thời';

    await handleActionWithScrollPreservation(
      async () => {
        await deleteAction();
        setConfirmDelete(null);
        setDeleteType('soft');
      },
      `Đã ${deleteTypeMessage} người dùng ${confirmDelete.userName} thành công`,
      `Không thể ${deleteTypeMessage.toLowerCase()} người dùng`
    );
  };

  const handleEdit = (userId) => {
    navigate(`/admin/manage/users/edit/${userId}`);
  };

  const handleRestore = async (userId, userName) => {
    await handleActionWithScrollPreservation(
      () => dispatch(restoreSoftDeletedUser(userId)),
      `Khôi phục người dùng ${userName} thành công`,
      'Không thể khôi phục người dùng'
    );
  };

  useEffect(() => {
    dispatch(fetchAllUsersByType({ userType, includeSoftDeleted: true }));
  }, [dispatch, userType]);

  const filteredUsers = (users || []).filter(user =>
    (user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user?.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user?.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <Typography
        variant="h4"
        className="mb-4 text-red-700"
      >
        Quản Lý Người Dùng
      </Typography>

      <div className="flex justify-between mt-6 mb-6">
        <FormControl variant="outlined" className="w-64">
          <InputLabel className="text-red-700">Loại người dùng</InputLabel>
          <Select
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
            label="Loại người dùng"
            className="text-red-700"
          >
            <MenuItem value="Applicant">Ứng viên</MenuItem>
            <MenuItem value="Employer">Nhà tuyển dụng</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Tìm kiếm người dùng"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-64"
        />
      </div>

      {loading ? (
        <div className="flex justify-center">
          <CircularProgress />
        </div>
      ) : (
        <TableContainer
          component={Paper}
          ref={tableContainerRef}
          className="max-h-[600px] overflow-auto"
        >
          <Table stickyHeader>
            <TableHead style={{ backgroundColor: '#dc2626', color: 'white' }}>
              <TableRow>
                <TableCell className="text-white">ID</TableCell>
                <TableCell className="text-white">Tên</TableCell>
                <TableCell className="text-white">Tên đăng nhập</TableCell>
                <TableCell className="text-white">Email</TableCell>
                <TableCell className="text-white">Loại người dùng</TableCell>
                <TableCell className="text-white">Ngày tạo</TableCell>
                <TableCell className="text-white">Cập nhật lần cuối</TableCell>
                <TableCell className="text-white">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow
                  key={user.id}
                  className={user.isDeleted ? 'bg-red-100' : 'bg-white'}
                >
                  <TableCell>
                    <TruncatedId id={user.id} />
                  </TableCell>
                  <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                  <TableCell>{user.userName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.userType}</TableCell>
                  <TableCell>
                    {new Date(user.createTime).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell>
                    {user.modifiedDate &&
                      new Date(user.modifiedDate).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {!user.isDeleted ? (
                        <IconButton
                          color="primary"
                          onClick={() => handleEdit(user.id)}
                        >
                          <Edit />
                        </IconButton>
                      ) : null}

                      <IconButton
                        color="error"
                        onClick={() => {
                          setConfirmDelete(user);
                          setDeleteType(user.isDeleted ? 'permanent' : 'soft');
                        }}
                      >
                        <Delete />
                      </IconButton>

                      {user.isDeleted ? (
                        <IconButton
                          color="success"
                          onClick={() => handleRestore(user.id, user.userName)}
                          title="Khôi phục"
                        >
                          <Restore />
                        </IconButton>
                      ) : null}
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
            Bạn có chắc chắn muốn xóa người dùng {confirmDelete?.userName}?
            Hành động này không thể hoàn tác.
          </Typography>
          {!confirmDelete?.isDeleted && (
            <Select
              value={deleteType}
              onChange={(e) => setDeleteType(e.target.value)}
              fullWidth
              variant="outlined"
              className="mt-4"
            >
              <MenuItem value="soft">Xóa tạm thời</MenuItem>
              <MenuItem value="permanent">Xóa vĩnh viễn</MenuItem>
            </Select>
          )}
          <Typography variant="body2" color="textSecondary" className="mt-2">
            {confirmDelete?.isDeleted
              ? 'Người dùng sẽ bị xóa vĩnh viễn khỏi hệ thống'
              : (deleteType === 'soft'
                ? 'Người dùng sẽ bị ẩn nhưng vẫn còn trong hệ thống'
                : 'Người dùng cùng các dữ liệu liên quan sẽ bị xóa hoàn toàn khỏi hệ thống')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Hủy</Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
          >
            {confirmDelete?.isDeleted ? 'Xóa vĩnh viễn' :
             (deleteType === 'soft' ? 'Xóa tạm thời' : 'Xóa vĩnh viễn')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Container */}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default AccountsManage;