import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCurrentEmployer, updateEmployerProfile, clearUpdateStatus } from '../../redux/slices/employerSlice';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaBuilding, FaIdCard, FaMapMarkerAlt } from 'react-icons/fa';
import EmployerLayout from '../components/layout/EmployerLayout';
import { toast } from 'react-toastify';

const EmployerUpdateProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentEmployer, isLoading, error, updateSuccess } = useSelector((state) => state.employer);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    district: '',
    city: '',
    companyName: '',
    identificationCardNumber: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!currentEmployer) {
      dispatch(fetchCurrentEmployer());
    } else {
      setFormData({
        firstName: currentEmployer.firstName || '',
        lastName: currentEmployer.lastName || '',
        district: currentEmployer.district || '',
        city: currentEmployer.city || '',
        companyName: currentEmployer.companyName || '',
        identificationCardNumber: currentEmployer.identificationCardNumber || ''
      });
    }
  }, [dispatch, currentEmployer]);

  useEffect(() => {
    if (updateSuccess) {
      toast.success("Profile updated successfully!"); // Show success message
      setTimeout(() => {
        dispatch(fetchCurrentEmployer()); // Fetch updated profile data
        dispatch(clearUpdateStatus());  // Clear update status
        navigate('/employer/profile');
      }, 2000);
    }
  }, [updateSuccess, navigate, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(updateEmployerProfile(formData));
  };

  if (isLoading) {
    return (
      <EmployerLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Đang tải thông tin...</div>
        </div>
      </EmployerLayout>
    );
  }

  return (
    <EmployerLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-blue-600 text-white">
            <h2 className="text-2xl font-bold flex items-center">
              <FaUser className="mr-2" /> Cập Nhật Thông Tin
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Form fields */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">
                  <FaUser className="inline mr-2" /> Thông tin cá nhân
                </h3>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Họ</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Tên</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">
                  <FaBuilding className="inline mr-2" /> Thông tin công ty
                </h3>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Tên công ty</label>
                  <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} required />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2"><FaIdCard className="inline mr-2" /> Số CMND/CCCD</label>
                  <input type="text" name="identificationCardNumber" value={formData.identificationCardNumber} onChange={handleChange} required />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2"><FaMapMarkerAlt className="inline mr-2" /> Địa chỉ</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Quận/Huyện</label>
                  <input type="text" name="district" value={formData.district} onChange={handleChange} required />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Tỉnh/Thành phố</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} required />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button type="button" onClick={() => navigate('/employer/profile')} className="px-4 py-2 text-gray-700 bg-gray-200">Hủy</button>
              <button type="submit" disabled={isSubmitting} className={`px-4 py-2 text-white bg-blue-600 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </EmployerLayout>
  );
};

export default EmployerUpdateProfile;
