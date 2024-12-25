import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { registerApplicant } from '../../../redux/slices/authSlice';
import { AuthApi } from '../../../services/AuthApi';
import { cities } from '../../../services/cities';

export const RegisterForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    city: '',
    district: '',
    gender: true
  });

  const [districts, setDistricts] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [googleClientId, setGoogleClientId] = useState('');

  useEffect(() => {
    const fetchGoogleConfig = async () => {
      try {
        const config = await AuthApi.getGoogleConfig();
        setGoogleClientId(config.clientId);
      } catch (err) {
        console.error('Failed to fetch Google config:', err);
      }
    };
    fetchGoogleConfig();
  }, []);

  // Memoized Google Sign-In handler
  const handleGoogleSignIn = useCallback(async (response) => {
    setErrors({});
    setIsLoading(true);

    try {
      const googleRegisterResult = await AuthApi.googleLogin(response.credential);
      
      // Store token in localStorage
      localStorage.setItem('token', googleRegisterResult.token);
      
      // Navigate based on the redirect URL from the backend
      if (googleRegisterResult.redirectUrl) {
        window.location.href = googleRegisterResult.redirectUrl;
      } else {
        navigate('/');
      }
    } catch (err) {
      setErrors(prev => ({
        ...prev,
        submit: err.message || 'Đăng ký Google không thành công'
      }));
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  // Add Google Sign-In script
  useEffect(() => {
    if (googleClientId) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);

      script.onload = () => {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleSignIn
        });

        window.google.accounts.id.renderButton(
          document.getElementById('googleSignInButton'),
          { 
            theme: 'outline', 
            size: 'large',
            text: 'continue_with',
            shape: 'rectangular' 
          }
        );
      };

      return () => {
        document.body.removeChild(script);
      };
    }
  }, [googleClientId, handleGoogleSignIn]);
  // Validation function mirroring C# model constraints
  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải từ 6 ký tự trở lên';
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    // First name validation
    if (!formData.firstName) {
      newErrors.firstName = 'Họ là bắt buộc';
    } else if (formData.firstName.length > 100) {
      newErrors.firstName = 'Họ không được vượt quá 100 ký tự';
    }

    // Last name validation
    if (!formData.lastName) {
      newErrors.lastName = 'Tên là bắt buộc';
    } else if (formData.lastName.length > 100) {
      newErrors.lastName = 'Tên không được vượt quá 100 ký tự';
    }

    // City validation
    if (!formData.city) {
      newErrors.city = 'Thành phố/Tỉnh là bắt buộc';
    }

    // District validation
    if (!formData.district) {
      newErrors.district = 'Quận/Huyện là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCityChange = (e) => {
    const selectedCity = e.target.value;
    setFormData(prev => ({ 
      ...prev, 
      city: selectedCity, 
      district: '' 
    }));

    // Find districts for the selected city
    const cityData = cities.find(city => city.name === selectedCity);
    setDistricts(cityData ? cityData.districts : []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Use Redux thunk to register
      const result = await dispatch(registerApplicant(formData)).unwrap();
      // On successful registration
      navigate('/');
    } catch (err) {
      // Handle registration error
      setErrors(prev => ({
        ...prev,
        submit: err || 'Đăng ký thất bại'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'gender' ? value === 'true' : value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg space-y-6">
      {errors.submit && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
          {errors.submit}
        </div>
      )}
  
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            Họ
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            required
            value={formData.firstName}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} rounded-md`}
          />
          {errors.firstName && <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>}
        </div>
  
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            Tên
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            required
            value={formData.lastName}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border ${errors.lastName ? 'border-red-500' : 'border-gray-300'} rounded-md`}
          />
          {errors.lastName && <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>}
        </div>
      </div>
  
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md`}
          />
          {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
        </div>
  
        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
            Giới tính
          </label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="true">Nam</option>
            <option value="false">Nữ</option>
          </select>
        </div>
      </div>
  
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Mật khẩu
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md`}
          />
          {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
        </div>
  
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Xác nhận mật khẩu
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md`}
          />
          {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
        </div>
      </div>
  
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
            Thành phố/Tỉnh
          </label>
          <select
            id="city"
            name="city"
            value={formData.city}
            onChange={handleCityChange}
            className={`mt-1 block w-full px-3 py-2 border ${errors.city ? 'border-red-500' : 'border-gray-300'} rounded-md`}
          >
            <option value="">Chọn thành phố/tỉnh</option>
            {cities.map((city) => (
              <option key={city.name} value={city.name}>{city.name}</option>
            ))}
          </select>
          {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city}</p>}
        </div>
  
        <div>
          <label htmlFor="district" className="block text-sm font-medium text-gray-700">
            Quận/Huyện
          </label>
          <select
            id="district"
            name="district"
            value={formData.district}
            onChange={handleChange}
            disabled={!districts.length}
            className={`mt-1 block w-full px-3 py-2 border ${errors.district ? 'border-red-500' : 'border-gray-300'} rounded-md`}
          >
            <option value="">Chọn quận/huyện</option>
            {districts.map((district) => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
          {errors.district && <p className="mt-1 text-sm text-red-500">{errors.district}</p>}
        </div>
      </div>
  
      <div className="flex justify-center">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
        </button>
      </div>
  
      <div className="mt-4 flex justify-center">
        <div id="googleSignInButton" className="w-full"></div>
      </div>
    </form>
  );
};  