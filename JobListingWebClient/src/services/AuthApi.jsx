import api from './api';

export const AuthApi = {
  getCurrentUser: async () => {
    try {
      const response = await api.get('/Account/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy thông tin người dùng' };
    }
  },

  // New method to get Google authentication configuration
  getGoogleConfig: async () => {
    try {
      const response = await api.get('/Account/google-config');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy cấu hình Google' };
    }
  },

  // New method to handle Google login
  googleLogin: async (idToken) => {
    try {
      const response = await api.post('/Account/google-login', { idToken });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Đăng nhập Google không thành công' };
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

  getAllUsersByType: async (userType, includeSoftDeleted = false) => {
    try {
      const response = await api.get(`/Account/users/${userType}`, { params: { includeSoftDeleted } });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy danh sách người dùng' };
    }
  },

  softDeleteUser: async (userId) => {
    try {
      const response = await api.delete(`/Account/soft-delete/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể xóa mềm người dùng' };
    }
  },

  permanentDeleteUser: async (userId) => {
    try {
      const response = await api.delete(`/Account/permanent-delete/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể xóa vĩnh viễn người dùng' };
    }
  },

  restoreSoftDeletedUser: async (userId) => {
    try {
      const response = await api.put(`/Account/restore/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể khôi phục người dùng' };
    }
  }
};