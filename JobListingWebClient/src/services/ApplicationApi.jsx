import api from './api';

class ApplicationApi {
    static async getAllApplications() {
        try {
            const response = await api.get('/application');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    static async getApplicationById(id) {
        try {
            const response = await api.get(`/application/${id}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    static async getUserApplications() {
        try {
            const response = await api.get(`/application/user`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    static async getJobApplications(jobId) {
        try {
            const response = await api.get(`/application/job/${jobId}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    static async createApplication(applicationData) {
        try {
            const response = await api.post('/application', applicationData);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    static async updateApplication(id, applicationData) {
        try {
            console.log("update method called!");
            const response = await api.put(`/application/${id}`, applicationData);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    static async deleteApplication(id) {
        try {
            const response = await api.delete(`/application/${id}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    static handleError(error) {
        if (error.response) {
            // Server responded with error
            const message = error.response.data?.message || 'An error occurred';
            return new Error(message);
        }
        if (error.request) {
            // Request made but no response
            return new Error('No response from server');
        }
        // Something else happened
        return new Error('Error setting up request');
    }
}

export default ApplicationApi;