import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, TextField, Button, MenuItem, Select, FormControl, InputLabel, Checkbox, FormControlLabel, Typography } from '@mui/material';
import { fetchLocations } from '../../redux/slices/locationSlice';
import { fetchIndustries } from '../../redux/slices/industrySlice';
import { fetchJobLevels, fetchJobsbyId, updateJob } from '../../redux/slices/jobSlice';
import JoditEditor from 'jodit-react';

const EditJobPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    salary: '',
    numberofRecruitment: 1,
    jobLevelID: '',
    industryID: '',
    locationID: '',
    preferredLanguage: '',
    closingDate: '',
    education: '',
    isUrgent: false,
    description: '',
    benefits: '',
    minimumQualifications: '',
    jobDuties: ''
  });

  const { jobbyId: job, jobLevels, status } = useSelector((state) => state.jobs);
  const { locations } = useSelector((state) => state.locations);
  const { industries } = useSelector((state) => state.industries);

  const editorConfig = useMemo(() => ({
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
  }), []);

  const handleEditorChange = useCallback((field) => (newContent) => {
    setFormData(prev => ({
      ...prev,
      [field]: newContent
    }));
  }, []);

  const handleInputChange = useCallback((field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await Promise.all([
          dispatch(fetchJobsbyId(jobId)),
          dispatch(fetchJobLevels()),
          dispatch(fetchLocations()),
          dispatch(fetchIndustries())
        ]);
      } catch (err) {
        setError('Lỗi khi tải dữ liệu');
      }
    };

    fetchInitialData();
  }, [dispatch, jobId]);

  useEffect(() => {
    if (job && locations.length > 0 && industries.length > 0) {
      const validLocationID = locations.some(loc => loc.locationID === job.locationID)
        ? job.locationID
        : (locations[0]?.locationID || '');

      const validIndustryID = industries.some(ind => ind.industryID === job.industryID)
        ? job.industryID
        : (industries[0]?.industryID || '');

      setFormData({
        title: job.title || '',
        description: job.description || '',
        benefits: job.benefits || '',
        salary: job.salary || '',
        numberofRecruitment: job.numberofRecruitment || 1,
        jobLevelID: job.jobLevelID || '',
        industryID: validIndustryID,
        locationID: validLocationID,
        minimumQualifications: job.minimumQualifications || '',
        preferredLanguage: job.preferredLanguage || '',
        jobDuties: job.jobDuties || '',
        closingDate: job.closingDate?.split('T')[0] || '',
        education: job.education || '',
        isUrgent: job.isUrgent || false
      });
    }
  }, [job, locations, industries]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateJob({ id: jobId, jobData: formData })).unwrap();
      setSuccess(true);
      setTimeout(() => {
        navigate('/employer/jobs');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Lỗi khi cập nhật công việc');
    }
  };

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert severity="error">{error}</Alert>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert severity="error">Không tìm thấy công việc</Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Chỉnh sửa bài đăng công việc</h2>
        <span className="text-sm text-gray-500">Mã công việc: {jobId}</span>
      </div>

      {success && (
        <Alert severity="success" className="mb-4">
          Cập nhật công việc thành công! Đang chuyển hướng...
        </Alert>
      )}

      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between items-center">
            <TextField
              fullWidth
              label="Tiêu đề công việc"
              value={formData.title}
              onChange={handleInputChange('title')}
              required
              variant="outlined"
              className="mb-4 flex-grow mr-4"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isUrgent}
                  onChange={handleInputChange('isUrgent')}
                  color="primary"
                />
              }
              label="Tuyển gấp"
              className="mb-4"
            />
          </div>

          <div>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>Mô tả công việc</Typography>
            <JoditEditor
              value={formData.description}
              config={editorConfig}
              onChange={handleEditorChange('description')}
            />
          </div>

          <div>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>Quyền lợi</Typography>
            <JoditEditor
              value={formData.benefits}
              config={editorConfig}
              onChange={handleEditorChange('benefits')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <TextField
              fullWidth
              label="Mức lương"
              value={formData.salary}
              onChange={handleInputChange('salary')}
              required
              variant="outlined"
            />

            <TextField
              fullWidth
              label="Số lượng tuyển dụng"
              type="number"
              value={formData.numberofRecruitment}
              onChange={handleInputChange('numberofRecruitment')}
              required
              variant="outlined"
              InputProps={{ inputProps: { min: 1 } }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormControl fullWidth variant="outlined">
              <InputLabel>Cấp bậc công việc</InputLabel>
              <Select
                value={formData.jobLevelID}
                onChange={handleInputChange('jobLevelID')}
                label="Cấp bậc công việc"
                required
              >
                {jobLevels.map(level => (
                  <MenuItem key={level.jobLevelID} value={level.jobLevelID}>
                    {level.description}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth variant="outlined">
              <InputLabel>Ngành nghề</InputLabel>
              <Select
                value={formData.industryID}
                onChange={handleInputChange('industryID')}
                label="Ngành nghề"
                required
              >
                {industries.map(industry => (
                  <MenuItem key={industry.industryID} value={industry.industryID}>
                    {industry.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <TextField
            fullWidth
            label="Yêu cầu trình độ"
            value={formData.education}
            onChange={handleInputChange('education')}
            variant="outlined"
            className="mb-4"
          />

          <div>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>Yêu cầu tối thiểu</Typography>
            <JoditEditor
              value={formData.minimumQualifications}
              config={editorConfig}
              onChange={handleEditorChange('minimumQualifications')}
            />
          </div>

          <div>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>Nhiệm vụ công việc</Typography>
            <JoditEditor
              value={formData.jobDuties}
              config={editorConfig}
              onChange={handleEditorChange('jobDuties')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <TextField
              fullWidth
              label="Ngôn ngữ ưu tiên"
              value={formData.preferredLanguage}
              onChange={handleInputChange('preferredLanguage')}
              variant="outlined"
            />

            <TextField
              fullWidth
              label="Ngày kết thúc tuyển dụng"
              type="date"
              value={formData.closingDate}
              onChange={handleInputChange('closingDate')}
              variant="outlined"
              InputLabelProps={{ shrink: true }}
            />
          </div>

          <FormControl fullWidth variant="outlined">
            <InputLabel>Địa điểm làm việc</InputLabel>
            <Select
              value={formData.locationID}
              onChange={handleInputChange('locationID')}
              label="Địa điểm làm việc"
              required
            >
              {locations.map(location => (
                <MenuItem key={location.locationID} value={location.locationID}>
                  {location.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <div className="flex justify-end mt-6">
            <Button variant="outlined" onClick={() => navigate('/employer/jobs')} className="mr-4">
              Hủy
            </Button>
            <Button variant="contained" color="primary" type="submit">
              Cập nhật
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditJobPage;