import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  fetchAllBlogs,
  fetchAllBlogTypes,
  softDeleteBlog,
  permanentDeleteBlog,
  restoreBlog,
  addBlogType
} from '../../redux/slices/postSlice';
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
  Chip,
  Checkbox,
  ListItemText,
  Box,
  Grid
} from '@mui/material';
import { Edit, Delete, Restore, Visibility, Add } from '@mui/icons-material';
import AddBlogTypeModal from './AddBlogTypeModal';

const PostsManage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { posts = [], blogTypes = [], loading, error } = useSelector((state) => state.posts);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteType, setDeleteType] = useState('permanent');
  const [selectedBlogTypes, setSelectedBlogTypes] = useState([]);
  const [addBlogTypeModalOpen, setAddBlogTypeModalOpen] = useState(false);
  const tableContainerRef = useRef(null);
  const [sortOrder, setSortOrder] = useState('newest');

  const saveScrollPosition = () => tableContainerRef.current?.scrollTop || 0;
  const restoreScrollPosition = (position) => {
    if (tableContainerRef.current) tableContainerRef.current.scrollTop = position;
  };

  const handleActionWithScrollPreservation = async (actionPromise, successMessage, errorMessage) => {
    const scrollPosition = saveScrollPosition();
    try {
      await actionPromise();
      await dispatch(fetchAllBlogs());
      setTimeout(() => restoreScrollPosition(scrollPosition), 0);
      toast.success(successMessage, {
        position: 'top-right',
        autoClose: 3000,
        closeOnClick: true,
      });
    } catch (error) {
      toast.error(`${errorMessage}: ${error.message}`, {
        position: 'top-right',
        autoClose: 5000,
        closeOnClick: true,
        pauseOnHover: true,
      });
    }
  };

  const handleDelete = async () => {
    const deleteAction =
      confirmDelete.isDeleted || deleteType === 'permanent'
        ? () => dispatch(permanentDeleteBlog(confirmDelete.blogID))
        : () => dispatch(softDeleteBlog(confirmDelete.blogID));

    const deleteTypeMessage =
      confirmDelete.isDeleted || deleteType === 'permanent'
        ? 'Xóa vĩnh viễn'
        : 'Xóa tạm thời';

    await handleActionWithScrollPreservation(
      async () => {
        await deleteAction();
        setConfirmDelete(null);
        setDeleteType('soft');
      },
      `Đã ${deleteTypeMessage} bài viết "${confirmDelete.title}" thành công`,
      `Không thể ${deleteTypeMessage.toLowerCase()} bài viết "${confirmDelete.title}"`
    );
  };

  const handleEdit = (postId) => {
    navigate(`/admin/manage/posts/edit/${postId}`);
  };

  const handleRestore = async (postId, postTitle) => {
    await handleActionWithScrollPreservation(
      () => dispatch(restoreBlog(postId)),
      `Khôi phục bài viết "${postTitle}" thành công`,
      `Không thể khôi phục bài viết "${postTitle}"`
    );
  };

  useEffect(() => {
    dispatch(fetchAllBlogs());
    dispatch(fetchAllBlogTypes());
  }, [dispatch]);

  const filteredPosts = posts
  .filter(
    (post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedBlogTypes.length === 0 ||
        (post.mappingTypes && selectedBlogTypes.some((type) =>
          post.mappingTypes.some((postType) => postType.blogTypeID === type.blogTypeID)
        )))
  )
  .sort((a, b) => {
    const dateA = new Date(a.publication);
    const dateB = new Date(b.publication);
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const handleBlogTypeChange = (event) => {
    const {
      target: { value },
    } = event;
    setSelectedBlogTypes(typeof value === 'string' ? value.split(',') : value);
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <Typography variant="h4" className="mb-6 text-red-700">
        Quản Lý Bài viết Nghề nghiệp
      </Typography>

      <Grid container spacing={2} alignItems="center" className="mb-6">
        <Grid item xs={12} md={6}>
          <TextField
            label="Tìm kiếm bài viết"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Select
            multiple
            value={selectedBlogTypes}
            onChange={handleBlogTypeChange}
            renderValue={(selected) => selected.map((type) => type.name).join(', ')}
            fullWidth
          >
            {blogTypes.map((type) => (
              <MenuItem key={type.blogTypeID} value={type}>
                <Checkbox checked={selectedBlogTypes.some((t) => t.blogTypeID === type.blogTypeID)} />
                <ListItemText primary={type.name} />
              </MenuItem>
            ))}
          </Select>
        </Grid>
          <Grid item xs={12} md={4}>
            <Select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              fullWidth
              size="small"
            >
              <MenuItem value="newest">Mới nhất</MenuItem>
              <MenuItem value="oldest">Cũ nhất</MenuItem>
            </Select>
          </Grid>
      </Grid>

      <Box className="mb-6">
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => navigate('/admin/manage/posts/add-post')}
          className="mr-2"
        >
          Thêm bài viết
        </Button>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<Add />}
          onClick={() => setAddBlogTypeModalOpen(true)}
        >
          Thêm loại bài viết
        </Button>
      </Box>

      {loading ? (
        <div className="flex justify-center">
          <CircularProgress />
        </div>
      ) : error ? (
        <Typography color="error" className="text-center">
          {error}
        </Typography>
      ) : (
        <TableContainer
          component={Paper}
          ref={tableContainerRef}
          className="max-h-[600px] overflow-auto"
        >
          <Table stickyHeader>
            <TableHead style={{ backgroundColor: '#dc2626', color: 'white' }}>
              <TableRow>
                <TableCell className="text-white">Tiêu đề</TableCell>
                <TableCell className="text-white">Ngày tạo</TableCell>
                <TableCell className="text-white">Trạng thái</TableCell>
                <TableCell className="text-white">Loại bài viết</TableCell>
                <TableCell className="text-white">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPosts.map((post) => (
                <TableRow
                  key={post.blogID}
                  className={post.isDeleted ? 'bg-red-100' : 'bg-white'}
                >
                  <TableCell>{post.title}</TableCell>
                  <TableCell>{new Date(post.publication).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell>
                    <Chip
                      label={post.isPublished ? 'Đã xuất bản' : 'Nháp'}
                      color={post.isPublished ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {post.mappingTypes ? post.mappingTypes.map((type) => (
                      <Chip key={type.blogTypeID} label={type.blogType.name} size="small" className="mr-1" />
                    )) : null}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {/* <IconButton
                        color="primary"
                        onClick={() => navigate(`/admin/posts/view/${post.blogID}`)}
                      >
                        <Visibility />
                      </IconButton> */}
                      {!post.isDeleted ? (
                        <IconButton
                          color="primary"
                          onClick={() => handleEdit(post.blogID)}
                        >
                          <Edit />
                        </IconButton>
                      ) : null}
                      <IconButton
                        color="error"
                        onClick={() => {
                          setConfirmDelete(post);
                          setDeleteType(post.isDeleted ? 'permanent' : 'soft');
                        }}
                      >
                        <Delete />
                      </IconButton>
                      {post.isDeleted && (
                        <IconButton
                          color="success"
                          onClick={() => handleRestore(post.blogID, post.title)}
                          title="Khôi phục"
                        >
                          <Restore />
                        </IconButton>
                      )}
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
            Bạn có chắc chắn muốn xóa bài viết "{confirmDelete?.title}" không?
            Hành động này không thể hoàn tác.
          </Typography>
          {!confirmDelete?.isDeleted && (
            <Select
              value={deleteType}
              onChange={(e) => setDeleteType(e.target.value)}
              fullWidth
              className="mt-4"
            >
              <MenuItem value="soft">Xóa tạm thời</MenuItem>
              <MenuItem value="permanent">Xóa vĩnh viễn</MenuItem>
            </Select>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Hủy</Button>
          <Button onClick={handleDelete} color="error">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Blog Type Modal */}
      {addBlogTypeModalOpen && (
        <AddBlogTypeModal
          open={addBlogTypeModalOpen}
          onClose={() => setAddBlogTypeModalOpen(false)}
        />
      )}

      <ToastContainer />
    </div>
  );
};

export default PostsManage;
