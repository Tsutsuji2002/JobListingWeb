import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FaUser,
  FaLinkedin, 
  FaGithub,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaSpinner
} from 'react-icons/fa';
import Layout from '../components/layout/Layout';
import { UserSideNav } from '../components/user/UserSideNav';
import { updateApplicantProfile, clearUpdateStatus, fetchCurrentApplicant } from '../../redux/slices/authSlice';
import { cities } from '../../services/cities';

const UserProfilePage = () => {
  const dispatch = useDispatch();
  const { currentUser, isLoading, updateSuccess, error } = useSelector((state) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [districts, setDistricts] = useState([]);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    city: '',
    district: '',
    email: '',
    phoneNumber: '',
    gender: false
  });
  const [originalData, setOriginalData] = useState({});

  // Update local state when Redux state changes
  useEffect(() => {
    console.log('Current applicant:', currentUser);
    if (currentUser) {
      const initialCity = currentUser.city || 'Bình Dương';
      const initialDistricts = cities.find(city => city.name === initialCity)?.districts || [];
      const data = {
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        city: initialCity,
        district: currentUser.district || (initialDistricts[0] || ''),
        email: currentUser.email || 'leluyen2024@gmail.com',
        phoneNumber: currentUser.phoneNumber || '',
        gender: currentUser.gender || false
      };

      setProfileData(data);
      setOriginalData(data);
      setDistricts(initialDistricts);
    }
    else {
      dispatch(fetchCurrentApplicant());
    }
  }, [currentUser]);

  // Reset update success status
  useEffect(() => {
    if (updateSuccess) {
      setIsEditing(false);
      dispatch(clearUpdateStatus());
      dispatch(fetchCurrentApplicant());
    }
  }, [updateSuccess, dispatch]);

  const handleCityChange = (selectedCity) => {
    const cityData = cities.find(city => city.name === selectedCity);
    const cityDistricts = cityData ? cityData.districts : [];
    
    setProfileData(prev => ({ 
      ...prev, 
      city: selectedCity, 
      district: cityDistricts[0] || '' 
    }));
    
    setDistricts(cityDistricts);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveProfile = () => {
    const updateData = {
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      city: profileData.city,
      district: profileData.district,
      email: profileData.email, // Email is non-editable
      phoneNumber: profileData.phoneNumber || null,
      gender: profileData.gender
    };

    dispatch(updateApplicantProfile(updateData));
  };

  const handleCancelEdit = () => {
    setProfileData(originalData);
    setIsEditing(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <div className="flex items-center space-x-2">
            <FaSpinner className="animate-spin text-4xl text-blue-500" />
            <span className="text-gray-600">Loading profile...</span>
          </div>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-red-600">Error loading profile: {error}</p>
        </div>
      </Layout>
    );
  }

  if (!currentUser) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-600">No user data available</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <UserSideNav activeTab="profile" />
          </div>
          
          <div className="lg:col-span-3 space-y-8">
            {/* Profile Header */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                    <FaUser className="w-12 h-12 text-gray-400" />
                  </div>
                  <div>
                  {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          name="firstName"
                          value={profileData.firstName}
                          onChange={handleInputChange}
                          placeholder="First Name"
                          className="w-full border rounded px-2 py-1"
                        />
                        <input
                          type="text"
                          name="lastName"
                          value={profileData.lastName}
                          onChange={handleInputChange}
                          placeholder="Last Name"
                          className="w-full border rounded px-2 py-1"
                        />
                      </div>
                    ) : (
                      <>
                        <h1 className="text-2xl font-bold text-gray-800">{profileData.firstName} {profileData.lastName}</h1>
                        <p className="text-gray-600">{profileData.email}</p>
                      </>
                    )}
                    <div className="flex items-center text-gray-600 mt-2">
                      <FaMapMarkerAlt className="mr-2" />
                      {isEditing ? (
                        <div className="space-x-2">
                          <select
                            name="city"
                            value={profileData.city}
                            onChange={(e) => handleCityChange(e.target.value)}
                            className="border rounded px-2 py-1 w-32"
                          >
                            {cities.map((city) => (
                              <option key={city.name} value={city.name}>{city.name}</option>
                            ))}
                          </select>
                          <select
                            name="district"
                            value={profileData.district}
                            onChange={handleInputChange}
                            className="border rounded px-2 py-1 w-32"
                            disabled={!districts.length}
                          >
                            {districts.map((district) => (
                              <option key={district} value={district}>{district}</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <span>{profileData.city}, {profileData.district}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-4">
                  {isEditing && (
                    <button
                      onClick={handleCancelEdit}
                      className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                    >
                      Hủy
                    </button>
                  )}
                  <button
                    onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                  >
                    {isEditing ? 'Lưu thay đổi' : 'Chỉnh sửa hồ sơ'}
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center text-gray-600">
                  <FaEnvelope className="mr-2" />
                  <span>{profileData.email}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FaPhone className="mr-2" />
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={profileData.phoneNumber || ''}
                      onChange={handleInputChange}
                      placeholder="Phone Number"
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    <span>{profileData.phoneNumber || 'Not provided'}</span>
                  )}
                </div>
                <div className="flex items-center text-gray-600">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="gender"
                      checked={profileData.gender}
                      onChange={handleInputChange}
                      className="mr-2"
                      disabled={!isEditing}
                    />
                    Giới tính: {profileData.gender ? 'Nam' : 'Nữ'}
                  </label>
                </div>
                <div className="flex items-center space-x-4">
                  <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-500">
                    <FaLinkedin className="w-6 h-6" />
                  </a>
                  <a href="https://www.github.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900">
                    <FaGithub className="w-6 h-6" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserProfilePage;
