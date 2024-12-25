import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { addBlogType } from '../../redux/slices/postSlice';

const AddBlogTypeModal = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const [blogTypeName, setBlogTypeName] = useState('');
  const [blogTypeDescription, setBlogTypeDescription] = useState('');

  const handleAddBlogType = async () => {
    if (blogTypeName.trim()) {
      await dispatch(addBlogType({ name: blogTypeName, description: blogTypeDescription}));
      setBlogTypeName('');
      setBlogTypeDescription('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Thêm Loại Bài Viết</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Tên loại bài viết"
          type="text"
          fullWidth
          value={blogTypeName}
          onChange={(e) => setBlogTypeName(e.target.value)}
        />
        <TextField
          autoFocus
          margin="dense"
          label="Mô tả loại bài viết"
          type="text"
          fullWidth
          value={blogTypeDescription}
          onChange={(e) => setBlogTypeDescription(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={handleAddBlogType} color="primary">
          Thêm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddBlogTypeModal;
