import api from './api';

export const careerApi = {
  getAllCareers: async () => {
    try {
      const response = await api.get('/Career');
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Không thể tải danh sách ngành nghề';
    }
  },

  getCareerById: async (id) => {
    try {
      const response = await api.get(`/Career/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Không thể tải thông tin ngành nghề';
    }
  },

  addCareer: async (careerData) => {
    try {
      const response = await api.post('/Career', careerData);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Không thể thêm ngành nghề mới';
    }
  },

  updateCareer: async (id, careerData) => {
    try {
      await api.put(`/Career/${id}`, careerData);
      return true;
    } catch (error) {
      throw error.response?.data || 'Không thể cập nhật ngành nghề';
    }
  },

  deleteCareer: async (id) => {
    try {
      await api.delete(`/Career/${id}`);
      return true;
    } catch (error) {
      throw error.response?.data || 'Không thể xóa ngành nghề';
    }
  },

  getMappingsByCareerId: async (careerId) => {
    try {
      const response = await api.get(`/Career/${careerId}/mappings`);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Không thể tải các ánh xạ ngành nghề';
    }
  },

  getMappingsByJobId: async (jobId) => {
    try {
      const response = await api.get(`/Career/mappings/job/${jobId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Không thể tải ánh xạ theo công việc';
    }
  },

  addMapping: async (mappingData) => {
    try {
      const response = await api.post('/Career/mappings', mappingData);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Không thể thêm ánh xạ ngành nghề';
    }
  },

  deleteMapping: async (mapId) => {
    try {
      await api.delete(`/Career/mappings/${mapId}`);
      return true;
    } catch (error) {
      throw error.response?.data || 'Không thể xóa ánh xạ ngành nghề';
    }
  }
};
