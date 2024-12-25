import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Upload, X } from 'lucide-react';
import { fetchCompanyByUserId, updateCompany } from '../../redux/slices/companySlice';
import { ImageApi } from '../../services/ImageApi';
import JoditEditor from 'jodit-react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  TextField,
  Typography,
  CircularProgress,
  CardMedia,
} from '@mui/material';
import {
  CalendarToday,
  Language,
  Business,
} from '@mui/icons-material';

const CompanyProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedCompany, status, error } = useSelector((state) => state.companies);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    benefits: '',
    foundedYear: '',
    website: '',
    logo: null,
    background: null
  });
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState({ message: '', severity: '' });
  const [previewLogo, setPreviewLogo] = useState('');
  const [previewBackground, setPreviewBackground] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const descriptionRef = useRef('');
  const benefitsRef = useRef('');

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      dispatch(fetchCompanyByUserId(userId));
    }
  }, [dispatch]);

  useEffect(() => {
    if (selectedCompany) {
      setFormData({
        name: selectedCompany.name || '',
        description: selectedCompany.description || '',
        benefits: selectedCompany.benefits || '',
        foundedYear: selectedCompany.foundedYear || '',
        website: selectedCompany.website || '',
        logo: null, // Don't store the URL in formData
        background: null // Don't store the URL in formData
      });

      descriptionRef.current = selectedCompany.description || '';
      benefitsRef.current = selectedCompany.benefits || '';

      if (selectedCompany && selectedCompany.logo) {
        // Fetch the logo using its ID if the logo URL isn't available
        ImageApi.getImageById(selectedCompany.logo).then((imageUrl) => {
          setPreviewLogo(selectedCompany.logo);
        }).catch(error => {
          setNotification({ message: 'Lỗi khi tải logo.', severity: 'error' });
        });
      }

      if (selectedCompany && selectedCompany.background) {
        // Fetch the background image using its ID if the background URL isn't available
        ImageApi.getImageById(selectedCompany.background).then((imageUrl) => {
          setPreviewBackground(selectedCompany.background);  // Set the fetched image URL to state
        }).catch(error => {
          setNotification({ message: 'Lỗi khi tải ảnh bìa.', severity: 'error' });
        });

        if (selectedCompany.logo) {
          setPreviewLogo(selectedCompany.logo);
        }

        if (selectedCompany.background) {
          setPreviewBackground(selectedCompany.background);
        }
      }
    }
  }, [selectedCompany]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setNotification({
        message: 'Chỉ chấp nhận file ảnh định dạng JPG, PNG hoặc GIF',
        severity: 'error'
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setNotification({
        message: 'File ảnh không được vượt quá 5MB',
        severity: 'error'
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'logo') {
        setPreviewLogo(reader.result);
        setFormData(prev => ({ ...prev, logo: file }));
      } else {
        setPreviewBackground(reader.result);
        setFormData(prev => ({ ...prev, background: file }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (type) => {
    if (type === 'logo') {
      setPreviewLogo('');
      setFormData(prev => ({ ...prev, logo: null }));
    } else {
      setPreviewBackground('');
      setFormData(prev => ({ ...prev, background: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedCompany && !isSubmitting) {
      setIsSubmitting(true);
      try {
        const submitData = new FormData();

        submitData.append('name', formData.name);
        submitData.append('description', descriptionRef.current);
        submitData.append('benefits', benefitsRef.current);
        submitData.append('foundedYear', formData.foundedYear);
        submitData.append('website', formData.website);

        if (formData.logo instanceof File) {
          submitData.append('logo', formData.logo);
        }

        if (formData.background instanceof File) {
          submitData.append('background', formData.background);
        }

        const resultAction = await dispatch(updateCompany({
          id: selectedCompany.companyID,
          companyData: submitData
        }));

        if (updateCompany.fulfilled.match(resultAction)) {
          setNotification({ message: 'Cập nhật thông tin công ty thành công!', severity: 'success' });
          setIsEditing(false);
          const userId = localStorage.getItem('userId');
          dispatch(fetchCompanyByUserId(userId));
        } else {
          setNotification({ message: 'Lỗi khi cập nhật thông tin công ty.', severity: 'error' });
        }
      } catch (error) {
        setNotification({ message: 'Lỗi khi cập nhật thông tin công ty.', severity: 'error' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleCreateCompany = () => {
    navigate('/employer/company/create');
  };

  if (status === 'loading') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!selectedCompany && status !== 'loading') {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          <AlertTitle>Chưa có thông tin công ty</AlertTitle>
          Vui lòng tạo thông tin công ty để tiếp tục.
        </Alert>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreateCompany}
        >
          Tạo thông tin công ty
        </Button>
      </Container>
    );
  }

  const editorConfig = {
    readonly: !isEditing,
    height: 300,
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" component="h2">
              Thông tin công ty
            </Typography>
            <Button
              variant={isEditing ? "outlined" : "contained"}
              color="primary"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Hủy' : 'Chỉnh sửa'}
            </Button>
          </Box>

          {notification.message && (
            <Alert severity={notification.severity} sx={{ mb: 3 }}>
              {notification.message}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tên công ty"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  required
                  inputProps={{ maxLength: 100 }}
                  InputProps={{
                    startAdornment: <Business sx={{ mr: 1, color: 'action.active' }} />
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Năm thành lập"
                  name="foundedYear"
                  value={formData.foundedYear}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="VD: 2020"
                  InputProps={{
                    startAdornment: <CalendarToday sx={{ mr: 1, color: 'action.active' }} />
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Website"
                  name="website"
                  type="url"
                  value={formData.website}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="https://example.com"
                  InputProps={{
                    startAdornment: <Language sx={{ mr: 1, color: 'action.active' }} />
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>Logo công ty</Typography>
                <Box className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {previewLogo ? (
                    <Box className="relative">
                      <CardMedia
                        component="img"
                        image={previewLogo.startsWith('data:') ? previewLogo : `/api/Image${previewLogo}`}
                        alt="Logo preview"
                        sx={{ height: 160, width: '100%', objectFit: 'contain' }}
                      />
                      {isEditing && (
                        <Button
                          onClick={() => handleRemoveImage('logo')}
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            minWidth: 'auto',
                            p: 1,
                            bgcolor: 'error.main',
                            color: 'white',
                            '&:hover': { bgcolor: 'error.dark' },
                            borderRadius: '50%'
                          }}
                        >
                          <X size={16} />
                        </Button>
                      )}
                    </Box>
                  ) : (
                    <Box className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      {isEditing && (
                        <Box className="mt-2">
                          <Button
                            component="label"
                            variant="text"
                            sx={{ color: 'primary.main' }}
                          >
                            Tải lên logo
                            <input
                              type="file"
                              hidden
                              accept="image/*"
                              onChange={(e) => handleFileChange(e, 'logo')}
                            />
                          </Button>
                          <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                            PNG, JPG, GIF tối đa 5MB
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>Mô tả công ty</Typography>
                <JoditEditor
                  value={descriptionRef.current}
                  config={editorConfig}
                  onChange={(newContent) => {
                    descriptionRef.current = newContent;
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>Lợi ích công ty</Typography>
                <JoditEditor
                  value={benefitsRef.current}
                  config={editorConfig}
                  onChange={(newContent) => {
                    benefitsRef.current = newContent;
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>Ảnh bìa công ty</Typography>
                <Box className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {previewBackground ? (
                    <Box className="relative">
                      <CardMedia
                        component="img"
                        image={previewBackground.startsWith('data:') ? previewBackground : `/api/Image${previewBackground}`}
                        alt="Background preview"
                        sx={{ height: 200, width: '100%', objectFit: 'cover' }}
                      />
                      {isEditing && (
                        <Button
                          onClick={() => handleRemoveImage('background')}
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            minWidth: 'auto',
                            p: 1,
                            bgcolor: 'error.main',
                            color: 'white',
                            '&:hover': { bgcolor: 'error.dark' },
                            borderRadius: '50%'
                          }}
                        >
                          <X size={16} />
                        </Button>
                      )}
                    </Box>
                  ) : (
                    <Box className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      {isEditing && (
                        <Box className="mt-2">
                          <Button
                            component="label"
                            variant="text"
                            sx={{ color: 'primary.main' }}
                          >
                            Tải lên ảnh bìa
                            <input
                              type="file"
                              hidden
                              accept="image/*"
                              onChange={(e) => handleFileChange(e, 'background')}
                            />
                          </Button>
                          <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                            PNG, JPG, GIF tối đa 5MB
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>

            {isEditing && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={() => setIsEditing(false)}
                  disabled={isSubmitting}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default CompanyProfilePage;
