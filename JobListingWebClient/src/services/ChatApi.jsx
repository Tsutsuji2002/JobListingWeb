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
  },

  // Archive a chat room
  archiveChatRoom: async (roomId) => {
    const response = await api.put(`/chat/rooms/${roomId}/archive`);
    return response.data;
  },

  // Delete a chat room
  deleteChatRoom: async (roomId) => {
    const response = await api.delete(`/chat/rooms/${roomId}`);
    return response.data;
  },

  // Delete a message
  deleteMessage: async (messageId) => {
    const response = await api.delete(`/chat/messages/${messageId}`);
    return response.data;
  },

  // Upload a file
  uploadFile: async (file, chatRoomId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('chatRoomId', chatRoomId);

    const response = await api.post('/chat/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};