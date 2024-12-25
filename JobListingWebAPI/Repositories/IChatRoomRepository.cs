using JobListingWebAPI.Entities;

namespace JobListingWebAPI.Repositories
{
    public interface IChatRoomRepository
    {
        Task<ChatRoom> CreateChatRoomAsync(string employerId, string applicantId);
        Task<ChatRoom> GetChatRoomAsync(string roomId);
        Task<ChatRoom> GetChatRoomByParticipantsAsync(string employerId, string applicantId);
        Task<List<ChatRoom>> GetUserChatRoomsAsync(string userId);
        Task<ChatMessage> SaveMessageAsync(string roomId, string senderId, string content);
        Task<List<ChatMessage>> GetChatRoomMessagesAsync(string roomId, int page = 1, int pageSize = 50);
        Task<int> GetUnreadMessagesCountAsync(string userId);
        Task MarkMessagesAsReadAsync(string roomId, string readerId);
        Task<(ChatMessage message, ChatFile file)> SaveFileMessageAsync(string roomId, string senderId, IFormFile file, string filePath);
    }
}
