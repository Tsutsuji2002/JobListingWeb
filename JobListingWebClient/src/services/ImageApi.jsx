import api from './api'; // Import the custom axios instance

export const ImageApi = {
    getImageById: async (url) => {
      try {
        const response = await api.get(`/Image${url}`); 
  
        if (response.data && response.data.url) {
          return response.data.url;
        } else {
          return null;
        }
      } catch (error) {
        throw error;
      }
    }
  };