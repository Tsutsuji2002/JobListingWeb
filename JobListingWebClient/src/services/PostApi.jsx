import api from './api';

const PostApi = {
  /**
   * Fetch all blogs
   * @param {boolean} includeDeleted - Whether to include deleted blogs
   * @returns {Promise} Promise resolving with an array of blogs
   */
  getAllBlogs: async (includeDeleted = false) => {
    try {
      const response = await api.get('/blog', { params: { includeDeleted } });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch blogs');
    }
  },

  /**
   * Fetch the newest blogs
   * @param {number} limit - Number of blogs to fetch
   * @returns {Promise} Promise resolving with an array of newest blogs
   */
  getNewestBlogs: async (limit) => {
    try {
      const response = await api.get(`/blog/newest/${limit}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch newest blogs');
    }
  },

  /**
   * Fetch a blog by its ID
   * @param {number} id - Blog ID
   * @returns {Promise} Promise resolving with the blog data
   */
  getBlogById: async (id) => {
    try {
      const response = await api.get(`/blog/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch blog');
    }
  },

  /**
   * Fetch blogs by type ID
   * @param {number} blogTypeId - Blog type ID
   * @returns {Promise} Promise resolving with an array of blogs
   */
  getBlogsByType: async (blogTypeId) => {
    try {
      const response = await api.get(`/blog/byType/${blogTypeId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch blogs by type');
    }
  },

  /**
   * Create a new blog
   * @param {Object} blogData - Blog data to create
   * @returns {Promise} Promise resolving with the created blog data
   */
  createBlog: async (blogData) => {
    try {
      const response = await api.post('/blog', blogData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to create blog');
    }
  },

  /**
   * Update an existing blog
   * @param {number} id - Blog ID
   * @param {Object} blogData - Blog data to update
   * @returns {Promise} Promise resolving with the updated blog data
   */
  updateBlog: async (id, blogData) => {
    try {
      const response = await api.put(`/blog/${id}`, blogData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to update blog');
    }
  },

  /**
   * Publish a blog
   * @param {number} id - Blog ID
   * @returns {Promise} Promise resolving with the published blog data
   */
  publishBlog: async (id) => {
    try {
      const response = await api.put(`/blog/${id}/publish`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to publish blog');
    }
  },

  /**
   * Unpublish a blog
   * @param {number} id - Blog ID
   * @returns {Promise} Promise resolving with the unpublished blog data
   */
  unpublishBlog: async (id) => {
    try {
      const response = await api.put(`/blog/${id}/unpublish`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to unpublish blog');
    }
  },

  /**
   * Increment the view count of a blog
   * @param {number} id - Blog ID
   * @returns {Promise} Promise resolving with the updated blog data
   */
  incrementViewCount: async (id) => {
    try {
      const response = await api.put(`/blog/${id}/increment-view`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to increment view count');
    }
  },

  /**
   * Soft delete a blog
   * @param {number} id - Blog ID
   * @returns {Promise} Promise resolving with a success message
   */
  softDeleteBlog: async (id) => {
    try {
      const response = await api.delete(`/blog/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to soft delete blog');
    }
  },

  /**
   * Permanently delete a blog
   * @param {number} id - Blog ID
   * @returns {Promise} Promise resolving with a success message
   */
  permanentDeleteBlog: async (id) => {
    try {
      const response = await api.delete(`/blog/${id}/permanent`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to permanently delete blog');
    }
  },

  /**
   * Restore a soft-deleted blog
   * @param {number} id - Blog ID
   * @returns {Promise} Promise resolving with the restored blog data
   */
  restoreBlog: async (id) => {
    try {
      const response = await api.put(`/blog/${id}/restore`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to restore blog');
    }
  },

  /**
   * Search blogs based on criteria
   * @param {Object} searchModel - Search criteria
   * @returns {Promise} Promise resolving with an array of blogs
   */
  searchBlogs: async (searchModel) => {
    try {
      const response = await api.post('/blog/search', searchModel);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to search blogs');
    }
  },

  /**
   * Fetch all blog types
   * @param {boolean} includeDeleted - Whether to include deleted blog types
   * @returns {Promise} Promise resolving with an array of blog types
   */
  getAllBlogTypes: async (includeDeleted = false) => {
    try {
      const response = await api.get('/blog/type', { params: { includeDeleted } });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch blog types');
    }
  },

  /**
   * Fetch a blog type by its ID
   * @param {number} id - Blog type ID
   * @returns {Promise} Promise resolving with the blog type data
   */
  getBlogTypeById: async (id) => {
    try {
      const response = await api.get(`/blog/type/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch blog type');
    }
  },

  /**
   * Create a new blog type
   * @param {Object} blogTypeData - Blog type data to create
   * @returns {Promise} Promise resolving with the created blog type data
   */
  addBlogType: async (blogTypeData) => {
    try {
      const response = await api.post('/blog/type', blogTypeData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to create blog type');
    }
  },

  uploadImage: async (formData) => {
    try {
      const response = await api.post('/blog/upload', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data' 
        }
      });
      return response.data; // Returns the image URL
    } catch (error) {
      console.error('Image upload failed', error);
      throw error.response ? error.response.data : new Error('Failed to upload image');
    }
  },

  /**
   * Update an existing blog type
   * @param {number} id - Blog type ID
   * @param {Object} blogTypeData - Blog type data to update
   * @returns {Promise} Promise resolving with the updated blog type data
   */
  updateBlogType: async (id, blogTypeData) => {
    try {
      const response = await api.put(`/blog/type/${id}`, blogTypeData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to update blog type');
    }
  },

  /**
   * Soft delete a blog type
   * @param {number} id - Blog type ID
   * @returns {Promise} Promise resolving with a success message
   */
  softDeleteBlogType: async (id) => {
    try {
      const response = await api.delete(`/blog/type/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to soft delete blog type');
    }
  },

  /**
   * Permanently delete a blog type
   * @param {number} id - Blog type ID
   * @returns {Promise} Promise resolving with a success message
   */
  permanentDeleteBlogType: async (id) => {
    try {
      const response = await api.delete(`/blog/type/${id}/permanent`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to permanently delete blog type');
    }
  },

  /**
   * Restore a soft-deleted blog type
   * @param {number} id - Blog type ID
   * @returns {Promise} Promise resolving with the restored blog type data
   */
  restoreBlogType: async (id) => {
    try {
      const response = await api.put(`/blog/type/${id}/restore`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to restore blog type');
    }
  },

  /**
   * Search blog types based on criteria
   * @param {string} searchTerm - Search term
   * @returns {Promise} Promise resolving with an array of blog types
   */
  searchBlogTypes: async (searchTerm) => {
    try {
      const response = await api.get('/blog/type/search', { params: { searchTerm } });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to search blog types');
    }
  },

  getAllTags: async() => {
    try{
      const response = await api.get('/blog/tags');
      return response.data;
    } catch(error) {
      throw error.response ? error.response.data : new Error('Failed to fetch all tags');
    }
  },

  
  createTag: async(tagData) => {
    try {
      const response = await api.post('/blog/tags', tagData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to create blog tags');
    }
  }
};

export default PostApi;
