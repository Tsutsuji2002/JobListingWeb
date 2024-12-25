import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  TextField,
  Button,
  Typography,
  Box,
  Chip,
  Autocomplete,
  Switch,
  CircularProgress,
  Alert,
  FormControlLabel
} from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import JoditEditor from 'jodit-react';
import {
  fetchBlogById,
  updateBlog,
  fetchAllBlogTypes,
  clearCurrentBlog
} from '../../redux/slices/postSlice';

const EditPostPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useDispatch();

  const { currentBlog, blogTypes, loading, error } = useSelector(state => ({
    currentBlog: state.posts.currentBlog,
    blogTypes: state.posts.blogTypes,
    loading: state.posts.loading,
    error: state.posts.error
  }));

  // State management
  const [title, setTitle] = useState('');
  const [blogTypeIds, setBlogTypeIds] = useState([]);
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs for performance and controlled components
  const editorRef = useRef(null);
  const contentRef = useRef('');

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dispatch(clearCurrentBlog());
    };
  }, [dispatch]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          dispatch(fetchBlogById(id)).unwrap(),
          dispatch(fetchAllBlogTypes()).unwrap()
        ]);
      } catch (error) {
        toast.error(`Failed to load data: ${error.message || 'Unknown error'}`);
      }
    };

    fetchData();
  }, [dispatch, id]);

  // Update form when blog data changes
  useEffect(() => {
    if (currentBlog) {
      setTitle(currentBlog.title || '');
      contentRef.current = currentBlog.content || '';
      setBlogTypeIds(currentBlog.mappingTypes?.map(mapping => mapping.blogTypeID) || []);
      setTags(currentBlog.tags ? currentBlog.tags.split(',').filter(Boolean) : []);
      setIsPublished(currentBlog.isPublished || false);
      setIsDirty(false);

      // If editor ref exists, update its content
      if (editorRef.current) {
        editorRef.current.value = currentBlog.content || '';
      }
    }
  }, [currentBlog]);

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

  const handlePublishedChange = (e) => {
    setIsPublished(e.target.checked);
    setIsDirty(true);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Vui lòng nhập tiêu đề');
      return;
    }

    try {
      setIsSubmitting(true);

      const processedContent = contentRef.current.replace(
        new RegExp(`$/api/Image/uploads/`, 'g'),
        '/uploads/'
      );

      const postData = {
        id,
        title: title.trim(),
        blogTypeIds,
        content: processedContent,
        isPublished,
        tags: tags.join(','),
        updatedAt: new Date().toISOString()
      };

      await dispatch(updateBlog({ id, blogData: postData })).unwrap();
      toast.success('Cập nhật bài đăng thành công!');
      navigate('/admin/manage/posts');
    } catch (error) {
      toast.error(`Failed to update post: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm('Có thay đổi chưa lưu, bạn chắc chắn muốn thoát?')) {
        navigate('/admin/manage/posts');
      }
    } else {
      navigate('/admin/manage/posts');
    }
  };

  if (loading && !currentBlog) {
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
          Có lỗi khi tải nội dung bài viết: {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={6} className="bg-white shadow-md rounded-lg">
      <Typography variant="h4" className="mb-6 text-red-700" gutterBottom>
        Chỉnh sửa bài viết
      </Typography>

      <TextField
        label="Tiêu đề"
        fullWidth
        margin="normal"
        value={title}
        onChange={handleTitleChange}
        required
        error={!title.trim()}
        helperText={!title.trim() ? 'Nội dung tiêu đề là bắt buộc' : ''}
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
          value={blogTypes?.filter(type => blogTypeIds.includes(type.blogTypeID)) || []}
          onChange={handleBlogTypesChange}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              label="Loại bài viết"
              placeholder="Chọn loại bài viết..."
            />
          )}
        />
      </Box>

      <Box sx={{ mb: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={isPublished}
              onChange={handlePublishedChange}
            />
          }
          label={isPublished ? 'Đã xuất bản' : 'Chưa xuất bản'}
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
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

export default EditPostPage;
