import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  CircularProgress 
} from '@mui/material';

const SubscriptionModal = ({ 
  open, 
  onClose, 
  onSubmit, 
  subscription, 
  locations, 
  industries, 
  jobLevels,
  loading 
}) => {
  const [formData, setFormData] = React.useState({
    preferredIndustryId: '',
    preferredLocationId: '',
    preferredJobLevelId: ''
  });

  React.useEffect(() => {
    if (subscription) {
      setFormData({
        preferredIndustryId: subscription.preferredIndustryId || '',
        preferredLocationId: subscription.preferredLocationId || '',
        preferredJobLevelId: subscription.preferredJobLevelId || ''
      });
    } else {
      setFormData({
        preferredIndustryId: '',
        preferredLocationId: '',
        preferredJobLevelId: ''
      });
    }
  }, [subscription]);
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {subscription ? 'Chỉnh sửa đăng ký' : 'Thêm đăng ký mới'}
      </DialogTitle>
      <DialogContent>
        <div className="space-y-4 py-4">
          <FormControl fullWidth disabled={loading}>
            <InputLabel>Ngành nghề</InputLabel>
            <Select
              name="preferredIndustryId"
              value={formData.preferredIndustryId}
              onChange={handleChange}
              defaultValue={subscription?.preferredIndustryId || ''}
            >
              <MenuItem value="">Chọn ngành nghề</MenuItem>
              {industries?.map(industry => (
                <MenuItem 
                  key={industry.industryID} 
                  value={industry.industryID}
                  selected={industry.industryID === formData.preferredIndustryId}
                >
                  {industry.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth disabled={loading}>
            <InputLabel>Địa điểm</InputLabel>
            <Select
              name="preferredLocationId"
              value={formData.preferredLocationId}
              onChange={handleChange}
              defaultValue={subscription?.preferredLocationId || ''}
            >
              <MenuItem value="">Chọn địa điểm</MenuItem>
              {locations?.map(location => (
                <MenuItem 
                  key={location.locationID} 
                  value={location.locationID}
                  selected={location.locationID === formData.preferredLocationId}
                >
                  {location.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth disabled={loading}>
            <InputLabel>Cấp bậc</InputLabel>
            <Select
              name="preferredJobLevelId"
              value={formData.preferredJobLevelId}
              onChange={handleChange}
              defaultValue={subscription?.preferredJobLevelId || ''}
            >
              <MenuItem value="">Chọn cấp bậc</MenuItem>
              {jobLevels?.map(level => (
                <MenuItem 
                  key={level.jobLevelID} 
                  value={level.jobLevelID}
                  selected={level.jobLevelID === formData.preferredJobLevelId}
                >
                  {level.description}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Hủy</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} color="inherit" />}
        >
          {subscription ? 'Cập nhật' : 'Thêm mới'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SubscriptionModal;