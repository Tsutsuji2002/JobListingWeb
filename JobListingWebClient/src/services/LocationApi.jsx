import api from './api';


export const locationApi = {
  getAllLocations: async () => {
    try {
      const response = await api.get('/Location');
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Không thể tải danh sách địa điểm';
    }
  },

  admin_getAllLocations: async () => {
    try {
      const response = await api.get('/Location/admin');
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Không thể tải danh sách địa điểm';
    }
  },

  getLocationById: async (id) => {
    try {
      const response = await api.get(`/Location/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Không thể tải thông tin địa điểm';
    }
  },

  createLocation: async (locationData) => {
    try {
      const response = await api.post(`/Location`, locationData);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Không thể tạo địa điểm mới';
    }
  },

  updateLocation: async (id, locationData) => {
    try {
      const response = await api.put(`/Location/${id}`, locationData);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Không thể cập nhật địa điểm';
    }
  },

  restoreLocation: async (id) => {
    try {
      await api.put(`/Location/restore/${id}`);
      return true;
    } catch (error) {
      throw error.response?.data || 'Không thể khôi phục địa điểm';
    }
  },

  deleteLocation: async (id) => {
    try {
      await api.delete(`/Location/${id}`);
      return true;
    } catch (error) {
      throw error.response?.data || 'Không thể xóa địa điểm';
    }
  },

  deleteLocationPermanently: async (id) => {
    try {
      await api.delete(`/Location/permanent/${id}`);
      return true;
    } catch (error) {
      throw error.response?.data || 'Không thể xóa địa điểm';
    }
  },

  searchLocations: async (searchTerm) => {
    try {
      const response = await api.get(`/Location/search`, {
        params: { searchTerm }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Không thể tìm kiếm địa điểm';
    }
  }
};
