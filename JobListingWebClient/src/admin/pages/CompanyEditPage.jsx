import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, X } from 'lucide-react';
import { fetchCompanyById, updateCompany } from '../../redux/slices/companySlice';
import { ImageApi } from '../../services/ImageApi';
import JoditEditor from 'jodit-react';
import { 
  Card, 
  CardContent, 
  Container, 
  Grid, 
  TextField, 
  Button, 
  Typography, 
  Alert, 
  Box,
  CardMedia,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  CalendarToday,
  Language,
  Business
} from '@mui/icons-material';

const CompanyEditPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedCompany } = useSelector((state) => state.companies);
  const [formData, setFormData] = useState({
    name: '',
    foundedYear: '',
    website: '',
    isFeature: false,
    logo: null,
    background: null
  });
  const [previewLogo, setPreviewLogo] = useState('');
  const [previewBackground, setPreviewBackground] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const descriptionRef = useRef('');
  const benefitsRef = useRef('');

  useEffect(() => {
    if (id) {
      dispatch(fetchCompanyById(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (selectedCompany) {
      setFormData({
        name: selectedCompany.name || '',
        foundedYear: selectedCompany.foundedYear || '',
        website: selectedCompany.website || '',
        isFeature: selectedCompany.isFeature || false,
        logo: null,
        background: null
      });

      descriptionRef.current = selectedCompany.description || '';
      benefitsRef.current = selectedCompany.benefits || '';

      // Fetch and set logo
      if (selectedCompany.logo) {
        ImageApi.getImageById(selectedCompany.logo).then(() => {
          setPreviewLogo(selectedCompany.logo);
        }).catch(error => {
          setError('Lỗi khi tải logo');
        });
      }

      // Fetch and set background
      if (selectedCompany.background) {
        ImageApi.getImageById(selectedCompany.background).then(() => {
          setPreviewBackground(selectedCompany.background);
        }).catch(error => {
          setError('Lỗi khi tải ảnh bìa');
        });
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
      setError('Chỉ chấp nhận file ảnh định dạng JPG, PNG hoặc GIF');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File ảnh không được vượt quá 5MB');
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
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const submitData = new FormData();
      
      submitData.append('name', formData.name);
      submitData.append('description', descriptionRef.current);
      submitData.append('benefits', benefitsRef.current);
      submitData.append('foundedYear', formData.foundedYear);
      submitData.append('website', formData.website);
      submitData.append('isFeature', formData.isFeature);
      
      if (formData.logo instanceof File) {
        submitData.append('logo', formData.logo);
      }
      
      if (formData.background instanceof File) {
        submitData.append('background', formData.background);
      }

      await dispatch(updateCompany({
        id: id,
        companyData: submitData
      }));

      navigate('/admin/manage/companies');
    } catch (error) {
      setError('Có lỗi xảy ra khi cập nhật thông tin công ty');
    } finally {
      setIsSubmitting(false);
    }
  };

  const editorConfig = {
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
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" component="h2">
              Chỉnh Sửa Thông Tin Công Ty
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tên công ty"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
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
                  placeholder="https://example.com"
                  InputProps={{
                    startAdornment: <Language sx={{ mr: 1, color: 'action.active' }} />
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isFeature}
                      onChange={(e) => setFormData(prev => ({
                        ...prev, 
                        isFeature: e.target.checked
                      }))}
                      name="isFeature"
                    />
                  }
                  label="Công ty nổi bật"
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
                    </Box>
                  ) : (
                    <Box className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
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
                    </Box>
                  ) : (
                    <Box className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
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
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/admin/companies')}
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
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default CompanyEditPage;