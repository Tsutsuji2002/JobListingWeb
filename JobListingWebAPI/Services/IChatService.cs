using JobListingWebAPI.Entities;

namespace JobListingWebAPI.Services
{
    public interface IChatService
    {
        Task<ChatRoom> CreateChatRoomAsync(string employerId, string applicantId);
        Task<ChatMessage> SendMessageAsync(string chatRoomId, string senderId, string content, MessageType type = MessageType.Text);
        Task<List<ChatRoom>> GetUserChatRoomsAsync(string userId);
        Task<List<ChatMessage>> GetMessagesAsync(string chatRoomId, DateTime? lastFetch = null);
        Task MarkMessagesAsReadAsync(string chatRoomId, string userId);
        Task<ChatRoom> ArchiveChatRoomAsync(string roomId, string userId);
        Task DeleteChatRoomAsync(string roomId, string userId);
        Task DeleteMessageAsync(string messageId, string userId);
        Task SaveChatFileAsync(ChatFile chatFile);
    }
}
