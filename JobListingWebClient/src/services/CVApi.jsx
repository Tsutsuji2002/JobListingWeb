import api from './api';

export const CVApi = {
  uploadCV: async (file, userId) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);

      const response = await api.post('/CV/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Có lỗi xảy ra khi tải lên CV' };
    }
  },

  getCVById: async (cvId) => {
    try {
      const response = await api.get(`/CV/${cvId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy thông tin CV' };
    }
  },

  getUserCVs: async (userId) => {
    try {
      const response = await api.get(`/CV/user/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy danh sách CV của người dùng' };
    }
  },

  deleteCV: async (cvId) => {
    try {
      const response = await api.delete(`/CV/${cvId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể xóa CV' };
    }
  },

  downloadCV: async (cvId) => {
    try {
      const response = await api.get(`/CV/${cvId}/download`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể tải xuống CV' };
    }
  },
  previewCV: async (cvId) => {
    try {
      const response = await api.get(`/CV/preview/${cvId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể xem trước CV' };
    }
  },
};