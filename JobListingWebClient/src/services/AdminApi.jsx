import api from './api';

const AdminApi = {
  /**
   * Admin login method
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - Admin email
   * @param {string} credentials.password - Admin password
   * @returns {Promise} Promise resolving with login response
   */
  loginAdmin: async (credentials) => {
    try {
      const response = await api.post('/Account/login/admin', credentials);
      // Store token and user info in localStorage after successful login
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Login failed');
    }
  },

  /**
   * Logout method for admin
   * @returns {Promise} Promise resolving with logout response
   */
  logout: async () => {
    try {
      const response = await api.post('/Account/logout');
      // Clear local storage on successful logout
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Logout failed');
    }
  },

  /**
   * Get admin profile information
   * @returns {Promise} Promise resolving with user profile data
   */
  getProfile: async () => {
    try {
      const response = await api.get('/Account/profile');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch profile');
    }
  },

  /**
   * Update admin profile
   * @param {Object} profileData - Profile update information
   * @returns {Promise} Promise resolving with update response
   */
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/Account/profile', profileData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Profile update failed');
    }
  }
};

export default AdminApi;