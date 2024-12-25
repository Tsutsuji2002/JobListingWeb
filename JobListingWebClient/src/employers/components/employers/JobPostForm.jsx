import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLocations } from '../../../redux/slices/locationSlice';
import { fetchIndustries } from '../../../redux/slices/industrySlice';
import { fetchJobLevels, addJob } from '../../../redux/slices/jobSlice';
import { fetchCompanyByUserId } from '../../../redux/slices/companySlice';
import { fetchCareers } from '../../../redux/slices/careerSlice';
import { useNavigate, Link } from 'react-router-dom';
import {
  Paper,
  Typography,
  TextField,
  Grid,
  Button,
  MenuItem,
  Box,
  CircularProgress,
  Alert,
  Container,
  FormControl,
  InputLabel,
  Select,
  Chip,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import JoditEditor from 'jodit-react';

const JobPostForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formErrors, setFormErrors] = useState([]);
  const [selectedCareers, setSelectedCareers] = useState([]);
  const [isUrgent, setIsUrgent] = useState(false);

  const { selectedCompany } = useSelector((state) => state.companies);
  const locations = useSelector(state => state.locations.locations);
  const industries = useSelector(state => state.industries.industries);
  const jobLevels = useSelector(state => state.jobs.jobLevels);
  const careers = useSelector(state => state.careers.careers);

  const jobStatus = useSelector(state => state.jobs.status);
  const jobError = useSelector(state => state.jobs.error);

  const descriptionRef = useRef('');
  const benefitsRef = useRef('');
  const minimumQualificationsRef = useRef('');
  const jobDutiesRef = useRef('');

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      dispatch(fetchCompanyByUserId(userId));
    }
    dispatch(fetchLocations());
    dispatch(fetchIndustries());
    dispatch(fetchJobLevels());
    dispatch(fetchCareers());
  }, [dispatch]);

  if (jobStatus === 'loading') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  // Check if company profile exists
  if (!selectedCompany || !selectedCompany.companyID) {
    return (
        <div className="bg-white rounded-lg shadow-lg p-8 mt-8 mb-8">
          <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">
            Bạn cần tạo hồ sơ công ty trước khi đăng tin tuyển dụng
          </h2>
          <div className="flex justify-center mt-6">
            <Link
              to="/employer/company"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-md transition-colors duration-200"
            >
              Tạo hồ sơ công ty
            </Link>
          </div>
        </div>
    );
  }

  const validateForm = (formData) => {
    const errors = [];
    const requiredFields = {
      title: 'Chức danh công việc',
      description: 'Mô tả công việc',
      numberofRecruitment: 'Số lượng tuyển',
      locationID: 'Địa điểm',
      industryID: 'Ngành nghề',
      jobLevelID: 'Cấp bậc',
      minimumQualifications: 'Yêu cầu tối thiểu',
      jobDuties: 'Nhiệm vụ công việc',
      closingDate: 'Ngày hết hạn',
      benefits: 'Quyền lợi'
    };

    Object.entries(requiredFields).forEach(([field, label]) => {
      if (!formData.get(field) && !descriptionRef.current && !benefitsRef.current && !minimumQualificationsRef.current && !jobDutiesRef.current) {
        errors.push(`${label} không được để trống`);
      }
    });

    // Additional validation for number field
    const numberofRecruitment = formData.get('numberofRecruitment');
    if (numberofRecruitment && parseInt(numberofRecruitment) < 1) {
      errors.push('Số lượng tuyển phải lớn hơn 0');
    }

    // Validate closing date is not in the past
    const closingDate = new Date(formData.get('closingDate'));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (closingDate < today) {
      errors.push('Ngày hết hạn không thể là ngày trong quá khứ');
    }

    return errors;
  };

  const handleCareerChange = (event) => {
    setSelectedCareers(event.target.value);
  };

  const createCareerMappings = async (jobId) => {
    try {
      const mappingPromises = selectedCareers.map(careerId =>
        fetch('/api/Career/mappings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            careerID: careerId,
            jobID: jobId
          })
        })
      );

      await Promise.all(mappingPromises);
    } catch (error) {
      console.error('Failed to create career mappings:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    // Validate form
    const errors = validateForm(formData);
    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    const jobData = {
      title: formData.get('title'),
      description: descriptionRef.current,
      benefits: benefitsRef.current,
      salary: formData.get('salary'),
      companyID: parseInt(selectedCompany.companyID),
      education: formData.get('education'),
      jobLevelID: parseInt(formData.get('jobLevelID')),
      industryID: parseInt(formData.get('industryID')),
      minimumQualifications: minimumQualificationsRef.current,
      locationID: parseInt(formData.get('locationID')),
      preferredLanguage: formData.get('preferredLanguage'),
      jobDuties: jobDutiesRef.current,
      numberofRecruitment: parseInt(formData.get('numberofRecruitment')),
      closingDate: formData.get('closingDate'),
      isUrgent: isUrgent
    };

    try {
      const result = await dispatch(addJob(jobData)).unwrap();
      if (selectedCareers.length > 0) {
        await createCareerMappings(result.jobID);
      }
      navigate('/employer/jobs');
    } catch (err) {
      console.error('Failed to add job:', err);
    }
  };

  const editorConfig = {
    readonly: false,
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
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Đăng tin tuyển dụng mới
        </Typography>

        {formErrors.length > 0 && (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Vui lòng kiểm tra lại các thông tin sau:
            </Typography>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {formErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} container alignItems="center">
              <Grid item xs>
                <TextField
                  name="title"
                  label="Chức danh công việc"
                  required
                  fullWidth
                  inputProps={{ maxLength: 100 }}
                />
              </Grid>
              <Grid item>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isUrgent}
                      onChange={(e) => setIsUrgent(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Tuyển gấp"
                  sx={{ ml: 2 }}
                />
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>Mô tả công việc</Typography>
              <JoditEditor
                ref={descriptionRef}
                config={editorConfig}
                onChange={(newContent) => {
                  descriptionRef.current = newContent;
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>Quyền lợi</Typography>
              <JoditEditor
                ref={benefitsRef}
                config={editorConfig}
                onChange={(newContent) => {
                  benefitsRef.current = newContent;
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="numberofRecruitment"
                label="Số lượng tuyển"
                type="number"
                required
                fullWidth
                inputProps={{ min: 1 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="salary"
                label="Mức lương"
                fullWidth
                inputProps={{ maxLength: 100 }}
                placeholder="VD: 15-20 triệu"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                name="locationID"
                label="Địa điểm"
                required
                fullWidth
                defaultValue=""
              >
                <MenuItem value="">Chọn địa điểm</MenuItem>
                {locations.map(location => (
                  <MenuItem key={location.locationID} value={location.locationID}>
                    {location.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                name="industryID"
                label="Ngành nghề"
                required
                fullWidth
                defaultValue=""
              >
                <MenuItem value="">Chọn ngành nghề</MenuItem>
                {industries.map(industry => (
                  <MenuItem key={industry.industryID} value={industry.industryID}>
                    {industry.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                name="jobLevelID"
                label="Cấp bậc"
                required
                fullWidth
                defaultValue=""
              >
                <MenuItem value="">Chọn cấp bậc</MenuItem>
                {jobLevels.map(level => (
                  <MenuItem key={level.jobLevelID} value={level.jobLevelID}>
                    {level.description}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="education"
                label="Yêu cầu học vấn"
                fullWidth
                inputProps={{ maxLength: 100 }}
                placeholder="VD: Đại học/Cao đẳng"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>Yêu cầu tối thiểu</Typography>
              <JoditEditor
                ref={minimumQualificationsRef}
                config={editorConfig}
                onChange={(newContent) => {
                  minimumQualificationsRef.current = newContent;
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>Nhiệm vụ công việc</Typography>
              <JoditEditor
                ref={jobDutiesRef}
                config={editorConfig}
                onChange={(newContent) => {
                  jobDutiesRef.current = newContent;
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                name="preferredLanguage"
                label="Ngôn ngữ ưu tiên"
                fullWidth
                inputProps={{ maxLength: 50 }}
                placeholder="VD: Tiếng Anh, Tiếng Nhật"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                name="closingDate"
                label="Ngày hết hạn"
                type="date"
                required
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  min: new Date().toISOString().split('T')[0]
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="careers-label">Ngành nghề liên quan</InputLabel>
                <Select
                  labelId="careers-label"
                  multiple
                  value={selectedCareers}
                  onChange={handleCareerChange}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const career = careers.find(c => c.careerID === value);
                        return (
                          <Chip
                            key={value}
                            label={career ? career.name : value}
                            sx={{ margin: '2px' }}
                          />
                        );
                      })}
                    </Box>
                  )}
                >
                  {careers.map((career) => (
                    <MenuItem key={career.careerID} value={career.careerID}>
                      {career.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {jobError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {jobError}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={jobStatus === 'loading'}
            sx={{ mt: 3, mb: 2 }}
          >
            {jobStatus === 'loading' ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                Đang xử lý...
              </Box>
            ) : (
              'Đăng tin tuyển dụng'
            )}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default JobPostForm;
