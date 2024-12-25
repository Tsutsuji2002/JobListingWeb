import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginApplicant } from '../../../redux/slices/authSlice';
import { AuthApi } from '../../../services/AuthApi';

export const LoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState('');
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

  // Memoize the Google Sign-In handler using useCallback
  const handleGoogleSignIn = useCallback(async (response) => {
    setError('');
    setIsLoading(true);

    try {
      const googleLoginResult = await AuthApi.googleLogin(response.credential);
      
      // Store token in localStorage
      localStorage.setItem('token', googleLoginResult.token);
      console.log(googleLoginResult.user.id);
      localStorage.setItem('userId', googleLoginResult.user.id);

      // Optional: dispatch an action to update Redux store
      // You might want to create a googleLogin async thunk similar to loginApplicant
      
      // Navigate based on the redirect URL from the backend
      if (googleLoginResult.redirectUrl) {
        window.location.href = googleLoginResult.redirectUrl;
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Đăng nhập Google không thành công');
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

  // Handle Google Sign-In
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const resultAction = await dispatch(loginApplicant({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe
      }));

      if (loginApplicant.fulfilled.match(resultAction)) {
        navigate('/');
      } else {
        // If the action was rejected, set the error message
        setError(resultAction.payload || 'Đăng nhập thất bại');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi đăng nhập');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
          {error}
        </div>
      )}
      
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
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

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
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="rememberMe"
          name="rememberMe"
          checked={formData.rememberMe}
          onChange={handleChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
          Ghi nhớ đăng nhập
        </label>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </button>
      <div className="mt-4">
        <div 
          id="googleSignInButton" 
          className="w-full flex justify-center"
        ></div>
      </div>
    </form>
  );
};