import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, TextField, Button, MenuItem, Select, FormControl, InputLabel, Checkbox, FormControlLabel, Typography } from '@mui/material';
import { fetchLocations } from '../../redux/slices/locationSlice';
import { fetchIndustries } from '../../redux/slices/industrySlice';
import { fetchJobLevels, fetchJobsbyId, updateJob } from '../../redux/slices/jobSlice';
import JoditEditor from 'jodit-react';

const JobEditPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Controlled input states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [benefits, setBenefits] = useState('');
  const [salary, setSalary] = useState('');
  const [numberofRecruitment, setNumberofRecruitment] = useState(1);
  const [jobLevelID, setJobLevelID] = useState('');
  const [industryID, setIndustryID] = useState('');
  const [minimumQualifications, setMinimumQualifications] = useState('');
  const [locationID, setLocationID] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('');
  const [jobDuties, setJobDuties] = useState('');
  const [closingDate, setClosingDate] = useState('');
  const [education, setEducation] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  // Redux selectors
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
    if (job) {
      const validLocationID = locations.some(loc => loc.locationID === job.locationID)
        ? job.locationID
        : (locations[0]?.locationID || '');

      const validIndustryID = industries.some(ind => ind.industryID === job.industryID)
        ? job.industryID
        : (industries[0]?.industryID || '');

      setTitle(job.title || '');
      setDescription(job.description || '');
      setBenefits(job.benefits || '');
      setSalary(job.salary || '');
      setNumberofRecruitment(job.numberofRecruitment || 1);
      setJobLevelID(job.jobLevelID || '');
      setIndustryID(validIndustryID);
      setLocationID(validLocationID);
      setMinimumQualifications(job.minimumQualifications || '');
      setPreferredLanguage(job.preferredLanguage || '');
      setJobDuties(job.jobDuties || '');
      setClosingDate(job.closingDate?.split('T')[0] || '');
      setEducation(job.education || '');
      setIsUrgent(job.isUrgent || false);
    }
  }, [job, locations, industries]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedJobData = {
      title,
      description,
      benefits,
      salary,
      numberofRecruitment,
      jobLevelID,
      industryID,
      minimumQualifications,
      locationID,
      preferredLanguage,
      jobDuties,
      closingDate,
      education,
      isUrgent
    };

    try {
      await dispatch(updateJob({ id: jobId, jobData: updatedJobData })).unwrap();
      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/manage/companies');
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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              variant="outlined"
              className="mb-4 flex-grow mr-4"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
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
              value={description}
              config={editorConfig}
              onChange={newContent => setDescription(newContent)}
            />
          </div>

          <div>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>Quyền lợi</Typography>
            <JoditEditor
              value={benefits}
              config={editorConfig}
              onChange={newContent => setBenefits(newContent)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <TextField
              fullWidth
              label="Mức lương"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              required
              variant="outlined"
            />

            <TextField
              fullWidth
              label="Số lượng tuyển dụng"
              type="number"
              value={numberofRecruitment}
              onChange={(e) => setNumberofRecruitment(parseInt(e.target.value))}
              required
              variant="outlined"
              InputProps={{ inputProps: { min: 1 } }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormControl fullWidth variant="outlined">
              <InputLabel>Cấp bậc công việc</InputLabel>
              <Select
                value={jobLevelID}
                onChange={(e) => setJobLevelID(e.target.value)}
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
                value={industryID}
                onChange={(e) => setIndustryID(e.target.value)}
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
            value={education}
            onChange={(e) => setEducation(e.target.value)}
            variant="outlined"
            className="mb-4"
          />

          <div>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>Yêu cầu tối thiểu</Typography>
            <JoditEditor
              value={minimumQualifications}
              config={editorConfig}
              onChange={newContent => setMinimumQualifications(newContent)}
            />
          </div>

          <div>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>Nhiệm vụ công việc</Typography>
            <JoditEditor
              value={jobDuties}
              config={editorConfig}
              onChange={newContent => setJobDuties(newContent)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <TextField
              fullWidth
              label="Ngôn ngữ ưu tiên"
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
              variant="outlined"
            />

            <TextField
              fullWidth
              label="Ngày kết thúc tuyển dụng"
              type="date"
              value={closingDate}
              onChange={(e) => setClosingDate(e.target.value)}
              variant="outlined"
              InputLabelProps={{ shrink: true }}
            />
          </div>

          <FormControl fullWidth variant="outlined">
            <InputLabel>Địa điểm làm việc</InputLabel>
            <Select
              value={locationID}
              onChange={(e) => setLocationID(e.target.value)}
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
            <Button variant="outlined" onClick={() => navigate('/admin/jobs')} className="mr-4">
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

export default JobEditPage;