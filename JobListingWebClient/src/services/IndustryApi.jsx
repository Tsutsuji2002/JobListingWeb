import api from './api';

export const industryApi = {
  getAllIndustries: async () => {
    try {
      const response = await api.get('/Industry');
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Không thể tải danh sách ngành nghề';
    }
  },

  getIndustryById: async (id) => {
    try {
      const response = await api.get(`/Industry/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Không thể tải thông tin ngành nghề';
    }
  },

  createIndustry: async (industryData) => {
    try {
      const response = await api.post(`/Industry`, industryData);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Không thể tạo ngành nghề mới';
    }
  },

  updateIndustry: async (id, industryData) => {
    try {
      const response = await api.put(`/Industry/${id}`, industryData);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Không thể cập nhật ngành nghề';
    }
  },

  deleteIndustry: async (id) => {
    try {
      await api.delete(`/Industry/${id}`);
      return true;
    } catch (error) {
      throw error.response?.data || 'Không thể xóa ngành nghề';
    }
  },

  searchIndustries: async (searchTerm) => {
    try {
      const response = await api.get(`/Industry/search`, {
        params: { searchTerm }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Không thể tìm kiếm ngành nghề';
    }
  }
};
