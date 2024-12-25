import api from './api';

export const chatApi = {
  // Create a new chat room
  createChatRoom: async (employerId) => {
    try {
      const response = await api.post('/chat/rooms', null, {
        params: { employerId }
      });
      
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data || 'Server error occurred');
      }
      throw error;
    }
  },

  // Get all chat rooms for current user
  fetchChatRooms: async () => {
    const response = await api.get('/chat/rooms');
    return response.data;
  },

  // Get messages for a specific room
  fetchMessages: async (roomId, lastFetch = null) => {
    let url = `/chat/messages/${roomId}`;
    if (lastFetch) {
      url += `?lastFetch=${lastFetch}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  // Send a message
  sendMessage: async (chatRoomId, content, type) => {
    type = 0;
    console.log("chatRoomId", chatRoomId);
    console.log("content", content);
    
    const response = await api.post('/chat/messages', {
      chatRoomId,  // Directly passing the chatRoomId as a string
      content,     // Directly passing the content as a string
      type         // Passing the type as an integer (0 for Text by default)
  });
    return response.data;
  }
};