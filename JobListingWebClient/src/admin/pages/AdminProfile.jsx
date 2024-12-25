import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateAdminProfile, getAdminProfile } from '../../redux/slices/adminSlice';
import { Pencil, X, Check } from 'lucide-react';

const AdminProfile = () => {
  const dispatch = useDispatch();
  const { profile, status } = useSelector((state) => state.admin);
  const loading = status === 'loading';
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    userName: '',
    email: '',
    phoneNumber: '',
    avatar: null
  });

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken && !profile) {
      dispatch(getAdminProfile());
    }
  }, [dispatch, profile]);

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        userName: profile.userName || '',
        email: profile.email || '',
        phoneNumber: profile.phoneNumber || '',
        avatar: profile.avatar || null
      });
    }
  }, [profile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateAdminProfile(formData)).unwrap();
      setIsEditing(false);
      // Optional: Show success message
    } catch (error) {
      console.error('Cập nhật thất bại:', error);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        userName: profile.userName || '',
        email: profile.email || '',
        phoneNumber: profile.phoneNumber || '',
        avatar: profile.avatar || null
      });
    }
    setIsEditing(false);
  };

  if (loading && !profile) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Thông tin cá nhân</h1>
        <div className="flex justify-center items-center h-48">
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Thông tin cá nhân</h1>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <Pencil className="w-4 h-4" />
            Chỉnh sửa
          </button>
        )}
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block mb-2">Họ</label>
            <input
              id="firstName"
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              required
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block mb-2">Tên</label>
            <input
              id="lastName"
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              required
            />
          </div>
          <div>
            <label htmlFor="userName" className="block mb-2">Tên hiển thị</label>
            <input
              id="userName"
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block mb-2">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              required
            />
          </div>
          <div>
            <label htmlFor="phoneNumber" className="block mb-2">Số điện thoại</label>
            <input
              id="phoneNumber"
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            />
          </div>
        </div>
        {isEditing && (
          <div className="mt-6 flex gap-4">
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              {loading ? 'Đang cập nhật...' : 'Lưu thay đổi'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center gap-2 bg-gray-100 text-gray-600 px-4 py-2 rounded-md hover:bg-gray-200"
            >
              <X className="w-4 h-4" />
              Hủy
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProfile;