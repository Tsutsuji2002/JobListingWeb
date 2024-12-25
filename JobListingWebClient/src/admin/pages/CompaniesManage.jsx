import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  fetchAdminCompanies,
  toggleFeatureCompany,
  deleteCompany,
  permanentDeleteCompany,
  restoreCompany
} from '../../redux/slices/companySlice';
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
} from '@mui/material';
import { Assessment, Edit, Delete, Star, StarBorder, Restore } from '@mui/icons-material';

const CompaniesManage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { companies, loading } = useSelector((state) => state.companies);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteType, setDeleteType] = useState('permanent');
  const tableContainerRef = useRef(null);
  const [sortField, setSortField] = useState('createdDate');
  const [sortOrder, setSortOrder] = useState('newest');

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
      await dispatch(fetchAdminCompanies());

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
      ? () => dispatch(permanentDeleteCompany(confirmDelete.companyID))
      : () => dispatch(deleteCompany(confirmDelete.companyID));

    const deleteTypeMessage = confirmDelete.isDeleted || deleteType === 'permanent'
      ? 'Xóa vĩnh viễn'
      : 'Xóa tạm thời';

    await handleActionWithScrollPreservation(
      async () => {
        await deleteAction();
        setConfirmDelete(null);
        setDeleteType('soft');
      },
      `Đã ${deleteTypeMessage} công ty ${confirmDelete.name} thành công`,
      `Không thể ${deleteTypeMessage.toLowerCase()} công ty`
    );
  };

  const handleEdit = (companyId) => {
    navigate(`/admin/manage/companies/edit/${companyId}`);
  };

  const handleFeatureToggle = async (companyId, currentStatus) => {
    await handleActionWithScrollPreservation(
      () => dispatch(toggleFeatureCompany(companyId)),
      currentStatus
        ? 'Đã gỡ công ty khỏi danh sách nổi bật'
        : 'Đã đánh dấu công ty nổi bật',
      'Không thể thay đổi trạng thái nổi bật'
    );
  };

  const handleRestore = async (companyId, companyName) => {
    await handleActionWithScrollPreservation(
      () => dispatch(restoreCompany(companyId)),
      `Khôi phục công ty ${companyName} thành công`,
      'Không thể khôi phục công ty'
    );
  };

  useEffect(() => {
    dispatch(fetchAdminCompanies());
  }, [dispatch]);

  const filteredCompanies = (companies || [])
  .filter(company =>
    company?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false
  )
  .sort((a, b) => {
    const dateA = new Date(a[sortField]);
    const dateB = new Date(b[sortField]);
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <Typography
        variant="h4"
        className="mb-8 text-red-700"
      >
        Quản Lý Công Ty
      </Typography>

      <TextField
        label="Tìm kiếm công ty"
        variant="outlined"
        size="small"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-64 mt-6 mb-6"
      />

      <Select
          value={sortField}
          onChange={(e) => setSortField(e.target.value)}
          size="small"
          className="w-48"
        >
          <MenuItem value="createdDate">Ngày tạo</MenuItem>
          <MenuItem value="updatedDate">Ngày cập nhật</MenuItem>
        </Select>

        <Select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          size="small"
          className="w-48"
        >
          <MenuItem value="newest">Mới nhất</MenuItem>
          <MenuItem value="oldest">Cũ nhất</MenuItem>
        </Select>

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
                <TableCell className="text-white">Tên công ty</TableCell>
                <TableCell className="text-white">Website</TableCell>
                <TableCell className="text-white">Email người dùng</TableCell>
                <TableCell className="text-white">Ngày tạo</TableCell>
                <TableCell className="text-white">Cập nhật lần cuối</TableCell>
                <TableCell className="text-white">Nổi bật</TableCell>
                <TableCell className="text-white">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCompanies.map((company) => (
                <TableRow
                  key={company.companyID}
                  className={company.isDeleted ? 'bg-red-100' : 'bg-white'}
                >
                  <TableCell>{company.companyID}</TableCell>
                  <TableCell>{company.name}</TableCell>
                  <TableCell>
                    {company.website && (
                      <a href={company.website} target="_blank" rel="noopener noreferrer">
                        {company.website}
                      </a>
                    )}
                  </TableCell>
                  <TableCell>{company.user.email || 'N/A'}</TableCell>
                  <TableCell>
                    {new Date(company.createdDate).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell>
                    {company.updatedDate &&
                      new Date(company.updatedDate).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleFeatureToggle(company.companyID, company.isFeature)}
                      color={company.isFeature ? "primary" : "default"}
                      disabled={company.isDeleted}
                    >
                      {company.isFeature ? <Star /> : <StarBorder />}
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {!company.isDeleted ? (
                        <IconButton
                          color="primary"
                          onClick={() => handleEdit(company.companyID)}
                        >
                          <Edit />
                        </IconButton>
                      ) : null}

                      <IconButton
                        color="error"
                        onClick={() => {
                          setConfirmDelete(company);
                          setDeleteType(company.isDeleted ? 'permanent' : 'soft');
                        }}
                      >
                        <Delete />
                      </IconButton>

                      {company.isDeleted ? (
                        <IconButton
                          color="success"
                          onClick={() => handleRestore(company.companyID, company.name)}
                          title="Khôi phục"
                        >
                          <Restore />
                        </IconButton>
                      ) : null}

                      <IconButton
                        color="info"
                        onClick={() => navigate(`/admin/manage/companies/${company.companyID}/${company.name}/jobs`)}
                        title="Xem danh sách việc làm"
                        disabled={company.isDeleted}
                      >
                        <Assessment />
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
            Bạn có chắc chắn muốn xóa công ty {confirmDelete?.name}?
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
              ? 'Công ty sẽ bị xóa vĩnh viễn khỏi hệ thống'
              : (deleteType === 'soft'
                ? 'Công ty sẽ bị ẩn nhưng vẫn còn trong hệ thống'
                : 'Công ty cùng các dữ liệu liên quan sẽ bị xóa hoàn toàn khỏi hệ thống')}
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

export default CompaniesManage;
