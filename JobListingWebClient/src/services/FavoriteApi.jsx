import api from './api'; // Assuming the base API configuration is in api.js

const FavoriteApi = {
    // Add a job to favorites
    addFavoriteJob: async (jobId) => {
        try {
            console.log(jobId);
            const response = await api.post('job/add-favorite', { JobID: jobId });
            return response.data;
        } catch (error) {
            console.error('Error adding job to favorites:', error);
            throw error;
        }
    },

    // Remove a job from favorites
    removeFavoriteJob: async (jobId) => {
        try {
            const response = await api.delete(`job/remove-favorite/${jobId}`);
            return response.data;
        } catch (error) {
            console.error('Error removing job from favorites:', error);
            throw error;
        }
    },

    // Get all favorite jobs
    getFavoriteJobs: async () => {
        try {
            const response = await api.get('job/favorite-jobs');
            return response.data;
        } catch (error) {
            console.error('Error fetching favorite jobs:', error);
            throw error;
        }
    }
};

export default FavoriteApi;