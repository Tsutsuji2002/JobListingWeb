import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import MultipleSelect from '../components/common/MultipleSelect';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { Upload, X } from 'lucide-react';
import { createCompanyWithLocationsAndIndustries } from '../../redux/slices/companySlice';
import { fetchLocations } from '../../redux/slices/locationSlice';
import { fetchIndustries } from '../../redux/slices/industrySlice';
import JoditEditor from 'jodit-react';

const CompanyCreatePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error } = useSelector((state) => state.companies);
  const { locations, loading: locationLoading } = useSelector((state) => state.locations);
  const { industries, loading: industryLoading } = useSelector((state) => state.industries);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    benefits: '',
    foundedYear: '',
    website: '',
    logo: '',
    background: '',
    industry: '',
    address: '',
    mappingLocations: [],
    industryIds: []
  });

  const [logoPreview, setLogoPreview] = useState('');
  const [backgroundPreview, setBackgroundPreview] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [notification, setNotification] = useState({ type: '', message: '' });

  const descriptionRef = useRef('');
  const benefitsRef = useRef('');

  useEffect(() => {
    dispatch(fetchLocations());
    dispatch(fetchIndustries());
  }, [dispatch]);

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Vui lòng nhập tên công ty';
    }

    if (!descriptionRef.current.trim()) {
      errors.description = 'Vui lòng nhập mô tả công ty';
    }

    if (!benefitsRef.current.trim()) {
      errors.benefits = 'Vui lòng nhập lợi ích công ty';
    }

    if (formData.website && !formData.website.startsWith('http')) {
      errors.website = 'URL phải bắt đầu bằng http:// hoặc https://';
    }

    if (formData.foundedYear) {
      const year = parseInt(formData.foundedYear);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1800 || year > currentYear) {
        errors.foundedYear = 'Năm thành lập không hợp lệ';
      }
    }

    if (!formData.mappingLocations.length) {
      errors.locations = 'Vui lòng chọn ít nhất một địa điểm';
    }

    if (!formData.industryIds.length) {
      errors.industries = 'Vui lòng chọn ít nhất một ngành nghề';
    }

    const maxFileSize = 5 * 1024 * 1024; // 5MB
    if (formData.logo && formData.logo.size > maxFileSize) {
      errors.logo = 'Logo không được vượt quá 5MB';
    }

    if (formData.background && formData.background.size > maxFileSize) {
      errors.background = 'Ảnh nền không được vượt quá 5MB';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFileChange = (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setValidationErrors(prev => ({
        ...prev,
        [type]: 'Chỉ chấp nhận file ảnh định dạng JPG, PNG hoặc GIF'
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setValidationErrors(prev => ({
        ...prev,
        [type]: 'File ảnh không được vượt quá 5MB'
      }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'logo') {
        setLogoPreview(reader.result);
      } else {
        setBackgroundPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);

    setFormData(prev => ({
      ...prev,
      [type]: file
    }));

    if (validationErrors[type]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[type];
        return newErrors;
      });
    }
  };

  const handleRemoveImage = (type) => {
    if (type === 'logo') {
      setLogoPreview('');
    } else {
      setBackgroundPreview('');
    }
    setFormData(prev => ({
      ...prev,
      [type]: ''
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLocationsChange = (selectedLocations) => {
    setFormData((prev) => ({
      ...prev,
      mappingLocations: selectedLocations.map((location) => ({
        locationId: location.id,  // Ensure location.id is mapped here
        address: location.address || '',  // Optional address
        name: location.name,
      })),
    }));
  };

  const handleIndustriesChange = (selectedIndustries) => {
    setFormData((prev) => ({
      ...prev,
      industryIds: selectedIndustries.map((industry) => industry.id),  // Ensure industry.id is mapped here
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const userId = localStorage.getItem('userId');
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', descriptionRef.current);
      formDataToSend.append('benefits', benefitsRef.current);
      formDataToSend.append('foundedYear', formData.foundedYear);
      formDataToSend.append('website', formData.website);
      formDataToSend.append('userId', userId);

      if (formData.logo) {
        formDataToSend.append('logo', formData.logo);
      }

      if (formData.background) {
        formDataToSend.append('background', formData.background);
      }
      formDataToSend.append('mappingLocations', JSON.stringify(
        formData.mappingLocations.map(loc => ({
          locationId: parseInt(loc.locationId),
          address: loc.address || null
        }))
      ));

      formDataToSend.append('mappingIndustries', JSON.stringify(
        formData.industryIds.map(industryId => ({
          industryId: parseInt(industryId)
        }))
      ));

      const resultAction = await dispatch(createCompanyWithLocationsAndIndustries(formDataToSend));

      if (createCompanyWithLocationsAndIndustries.fulfilled.match(resultAction)) {
        setNotification({ type: 'success', message: 'Tạo công ty thành công!' });
        navigate('/employer/company', {
          state: { success: 'Tạo công ty thành công!' }
        });
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: 'Lỗi khi tạo công ty. Vui lòng thử lại.'
      });
    }
  };

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Tạo Hồ Sơ Công Ty</h1>

        {notification.message && (
          <Alert severity={notification.type === 'error' ? 'error' : 'success'} className="mb-6">
            <AlertTitle>{notification.type === 'error' ? 'Lỗi' : 'Thành Công'}</AlertTitle>
            {notification.message}
          </Alert>
        )}

        {error && (
          <Alert severity="error" className="mb-6">
            <AlertTitle>Lỗi</AlertTitle>
            {error}
          </Alert>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Tên Công Ty <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {validationErrors.name && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Mô Tả <span className="text-red-500">*</span>
              </label>
              <JoditEditor
                ref={descriptionRef}
                config={editorConfig}
                onChange={(newContent) => {
                  descriptionRef.current = newContent;
                }}
              />
              {validationErrors.description && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.description}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Lợi Ích <span className="text-red-500">*</span>
              </label>
              <JoditEditor
                ref={benefitsRef}
                config={editorConfig}
                onChange={(newContent) => {
                  benefitsRef.current = newContent;
                }}
              />
              {validationErrors.benefits && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.benefits}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Năm Thành Lập</label>
                <input
                  type="text"
                  name="foundedYear"
                  value={formData.foundedYear}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: 2020"
                />
                {validationErrors.foundedYear && (
                  <p className="mt-1 text-sm text-red-500">{validationErrors.foundedYear}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com"
                />
                {validationErrors.website && (
                  <p className="mt-1 text-sm text-red-500">{validationErrors.website}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <MultipleSelect
                  label="Ngành nghề"
                  options={industries.map(industry => ({
                    id: industry.industryID,
                    name: industry.name
                  }))}
                  selectedValues={formData.industryIds.map(id => {
                    const industry = industries.find(i => i.industryID === id);
                    return { id, name: industry?.name || '' };
                  })}
                  onChange={handleIndustriesChange}
                  error={validationErrors.industries}
                  loading={industryLoading}
                />
              </div>

              <div>
                <MultipleSelect
                  label="Địa điểm"
                  options={locations.map(location => ({
                    id: location.locationID,
                    name: location.name
                  }))}
                  selectedValues={formData.mappingLocations.map(loc => ({
                    id: loc.locationId,
                    name: locations.find(l => l.locationID === loc.locationId)?.name || '',
                    address: loc.address
                  }))}
                  onChange={handleLocationsChange}
                  error={validationErrors.locations}
                  loading={locationLoading}
                  allowAddress={true}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Địa Chỉ Chi Tiết</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Số nhà, đường, phường/xã..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Logo Upload */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Logo Công Ty</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {logoPreview ? (
                    <div className="relative">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="w-full h-40 object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage('logo')}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-2">
                        <label className="cursor-pointer">
                          <span className="text-blue-600 hover:text-blue-700">Tải lên logo</span>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'logo')}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF tối đa 5MB</p>
                    </div>
                  )}
                </div>
                {validationErrors.logo && (
                  <p className="mt-1 text-sm text-red-500">{validationErrors.logo}</p>
                )}
              </div>

              {/* Background Upload */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Ảnh Nền</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {backgroundPreview ? (
                    <div className="relative">
                      <img
                        src={backgroundPreview}
                        alt="Background preview"
                        className="w-full h-40 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage('background')}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-2">
                        <label className="cursor-pointer">
                          <span className="text-blue-600 hover:text-blue-700">Tải lên ảnh nền</span>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'background')}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF tối đa 5MB</p>
                    </div>
                  )}
                </div>
                {validationErrors.background && (
                  <p className="mt-1 text-sm text-red-500">{validationErrors.background}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-medium py-2 rounded-md hover:bg-blue-700 transition duration-300"
            >
              Tạo Công Ty
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompanyCreatePage;
