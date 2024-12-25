import api from './api';

export const jobAPI = {
    fetchJobLevels: async () => {
        try {
        const response = await api.get('/Job/levels');
        return response.data;
        } catch (error) {
        throw error.response?.data || 'Không thể tải danh sách cấp bậc công việc';
        }
    },
    
    addJob: async (jobData) => {
        try {
        const response = await api.post('/Job', jobData);
        return response.data;
        } catch (error) {
        throw error.response?.data || 'Không thể thêm công việc mới';
        }
    },

    updateJob: async (id, jobData) => {
        try {
        const response = await api.put(`/Job/${id}`, jobData);
        return response.data;
        } catch (error) {
        throw error.response?.data || 'Không thể cập nhật công việc';
        }
    },

    restoreJob: async (id) => {
        try {
        const response = await api.put(`/Job/restore/${id}`);
        return response.data;
        } catch (error) {
        throw error.response?.data || 'Không thể khôi phục công việc';
        }
    },

    deleteJob: async (id) => {
        try {
        const response = await api.delete(`/Job/${id}`);
        return response.data;
        } catch (error) {
        throw error.response?.data || 'Không thể xóa công việc';
        }
    },

    deleteJobPermanently: async (id) => {
        try {
        const response = await api.delete(`/Job/permanent/${id}`);
        return response.data;
        } catch (error) {
        throw error.response?.data || 'Không thể xóa công việc';
        }
    },

    fetchJobs: async () => {
        try {
          const response = await api.get('/Job');
          return response.data;
        } catch (error) {
          throw error.response?.data || 'Không thể tải danh sách việc làm';
        }
      },

    fetchAdminJobs: async () => {
        try {
          const response = await api.get('/Job/admin');
          return response.data;
        } catch (error) {
          throw error.response?.data || 'Không thể tải danh sách việc làm';
        }
      },

    fetchUnapprovedJobs: async () => {
        try {
          const response = await api.get('/Job/unapproved');
          return response.data;
        } catch (error) {
          throw error.response?.data || 'Không thể tải danh sách việc làm chưa được duyệt';
        }
      },

    fetchJobsbyComp: async (companyId) => {
        try {
            const response = await api.get(`/Job/company/${companyId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || 'Không thể tải danh sách việc làm cho công ty';
        }
    },

    fetchAdminJobsbyComp: async (companyId) => {
        try {
            const response = await api.get(`/Job/admin/company/${companyId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || 'Không thể tải danh sách việc làm cho công ty';
        }
    },

    fetchFeaturedJobs: async () => {
        try {
            const response = await api.get(`/Job/featured/`);
            return response.data;
        } catch (error) {
            throw error.response?.data || 'Không thể tải danh sách việc làm nổi bật';
        }
    },
    fetchJobsbyId: async (id) => {
        try {
            const response = await api.get(`/Job/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || 'Không thể tải việc làm';
        }
    },
    updateJobStatus: async (jobId, status) => {
        try {
            const response = await api.put(`/Job/${jobId}/status`, { status });
            return response.data;
        } catch (error) {
            throw error.response?.data || 'Không thể cập nhật trạng thái việc làm';
        }
    },
    extendJob: async (jobId, days) => {
        try {
            const response = await api.put(`/Job/${jobId}/extend`, { days });
            return response.data;
        } catch (error) {
            throw error.response?.data || 'Không thể cập nhật thời hạn việc làm';
        }
    },
    toggleFeatureJob: async (jobId) => {
        try {
          const response = await api.put(`/Job/toggle-feature/${jobId}`);
          return response.data;
        } catch (error) {
          throw new Error(`Failed to toggle feature for job ${jobId}: ` + error.message);
        }
    }
};