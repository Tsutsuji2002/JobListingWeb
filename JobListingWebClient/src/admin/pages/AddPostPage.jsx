import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createBlog, fetchAllBlogTypes } from '../../redux/slices/postSlice';
import JoditEditor from "jodit-react";
import {
  TextField,
  Button,
  Typography,
  Box,
  Chip,
  Autocomplete,
  CircularProgress,
  Alert,
  Checkbox
} from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddPostPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // State management
  const [title, setTitle] = useState('');
  const [blogTypeIds, setBlogTypeIds] = useState([]);
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs for performance and controlled components
  const editorRef = useRef(null);
  const contentRef = useRef('');

  const blogTypes = useSelector(state => state.posts.blogTypes);
  const loading = useSelector(state => state.posts.loading);
  const error = useSelector(state => state.posts.error);

  // Stable editor configuration
  const editorConfig = {
    readonly: false,
    height: 400,
    uploader: {
      insertImageAsBase64URI: true,
    },
    buttons: [
      'bold', 'italic', 'underline', '|',
      'ul', 'ol', '|',
      'image', 'link', '|',
      'align', 'undo', 'redo', '|',
      'hr', 'eraser', 'fullsize'
    ],
  };

  useEffect(() => {
    dispatch(fetchAllBlogTypes());
  }, [dispatch]);

  // Handlers with minimal re-renders
  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    setIsDirty(true);
  };

  const handleContentChange = (newContent) => {
    // Use ref to store content to minimize re-renders
    contentRef.current = newContent;
    setIsDirty(true);
  };

  const handleNewTagChange = (e) => {
    setNewTag(e.target.value);
  };

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags(prev => [...prev, trimmedTag]);
      setNewTag('');
      setIsDirty(true);
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
    setIsDirty(true);
  };

  const handleBlogTypesChange = (_, newValue) => {
    setBlogTypeIds(newValue.map(type => type.blogTypeID));
    setIsDirty(true);
  };

  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm('Có thay đổi chưa được cập nhật, Bạn có chắc muốn thoát?')) {
        navigate('/admin/manage/posts');
      }
    } else {
      navigate('/admin/manage/posts');
    }
  };

  const handleAddBlog = async () => {
    if (!title.trim()) {
      toast.error('Vui lòng nhập tiêu đề');
      return;
    }

    // Use contentRef.current instead of a state variable
    const content = contentRef.current;
    if (!content || !content.trim()) {
      toast.error('Vui lòng nhập nội dung');
      return;
    }

    if (blogTypeIds.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 loại bài viết');
      return;
    }

    try {
      setIsSubmitting(true);
      const blogData = {
        title: title.trim(),
        content,
        tags: tags.join(','),
        blogTypeIds
      };

      await dispatch(createBlog(blogData)).unwrap();
      toast.success('Đăng bài viết thành công!');
      navigate('/admin/manage/posts');
    } catch (error) {
      toast.error(error?.message || 'Thất bại trong việc tạo bài viết!');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && !blogTypes) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Có lỗi khi tải nội dung loại bài viết: {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={6} className="bg-white shadow-md rounded-lg">
      <Typography variant="h4" className="mb-6 text-red-700" gutterBottom>
        Thêm bài viết mới
      </Typography>

      <TextField
        label="Tiêu đề"
        fullWidth
        margin="normal"
        value={title}
        onChange={handleTitleChange}
        required
        error={!title.trim()}
        helperText={!title.trim() ? 'Tiêu đề là bắt buộc' : ''}
      />

      <Box sx={{ mt: 2, mb: 2 }}>
        <JoditEditor
          ref={editorRef}
          config={editorConfig}
          onChange={handleContentChange}
        />
      </Box>

      <Box sx={{ mb: 2 }}>
        <TextField
          label="Thêm thẻ mới"
          value={newTag}
          onChange={handleNewTagChange}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleAddTag();
            }
          }}
          sx={{ mr: 1 }}
        />
        <Button variant="outlined" onClick={handleAddTag}>
          Thêm thẻ
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
        {tags.map((tag) => (
          <Chip key={tag} label={tag} onDelete={() => handleRemoveTag(tag)} />
        ))}
      </Box>

      <Box sx={{ mb: 2 }}>
        <Autocomplete
          multiple
          options={blogTypes || []}
          getOptionLabel={(option) => option.name}
          onChange={handleBlogTypesChange}
          renderOption={(props, option, { selected }) => (
            <li {...props} key={option.blogTypeID}>
              <Checkbox checked={selected} style={{ marginRight: 8 }} />
              {option.name}
            </li>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              label="Chọn một loại bài viết"
              placeholder="Loại bài viết"
            />
          )}
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddBlog}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Đang tạo...' : 'Thêm bài viết'}
        </Button>

        <Button
          variant="outlined"
          color="secondary"
          onClick={handleCancel}
        >
          Hủy
        </Button>
      </Box>

      <ToastContainer />
    </Box>
  );
};

export default AddPostPage;
