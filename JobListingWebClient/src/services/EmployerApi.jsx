import api from './api';

export const employerApi = {
  register: async (userData) => {
    try {
      const response = await api.post('/Account/register/employer', userData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Có lỗi xảy ra khi đăng ký' };
    }
  },

  login: async (loginData) => {
    try {
      const response = await api.post('/Account/login/employer', loginData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userId', response.data.userId);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Có lỗi xảy ra khi đăng nhập' };
    }
  },

  logout: async () => {
    try {
      const response = await api.post('/Account/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Có lỗi xảy ra khi đăng xuất' };
    }
  },

  getCurrentEmployer: async () => {
    try {
      const response = await api.get('/Account/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy thông tin người dùng' };
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/Account/profile', profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể cập nhật thông tin' };
    }
  }
};