import api from './api';

export const chatbotAPI = {
    sendMessage: async (message) => {
        try {
        const response = await api.post('/chatbot/chat', { message });
        return response.data.candidates[0].content.parts[0].text;
        } catch (error) {
        throw error.response?.data || 'Không thể chat lúc này';
        }
    },
}