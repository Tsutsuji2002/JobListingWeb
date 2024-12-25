using Google;
using JobListingWebAPI.Entities;
using JobListingWebAPI.Services;
using JobListingWebAPI.Data;
using Microsoft.EntityFrameworkCore;

namespace JobListingWebAPI.Services
{
    public class ChatService : IChatService
    {
        private readonly JobListingWebDbContext _context;
        private readonly IEncryptionService _encryptionService;

        public ChatService(
            JobListingWebDbContext context,
            IEncryptionService encryptionService)
        {
            _context = context;
            _encryptionService = encryptionService;
        }

        public async Task<ChatRoom> CreateChatRoomAsync(string employerId, string applicantId)
        {
            var existingRoom = await _context.ChatRooms
                .FirstOrDefaultAsync(r =>
                    r.EmployerId == employerId &&
                    r.ApplicantId == applicantId &&
                    r.IsActive);

            if (existingRoom != null)
                return existingRoom;

            var chatRoom = new ChatRoom
            {
                EmployerId = employerId,
                ApplicantId = applicantId
            };

            _context.ChatRooms.Add(chatRoom);
            await _context.SaveChangesAsync();
            return chatRoom;
        }

        public async Task<ChatMessage> SendMessageAsync(string chatRoomId, string senderId, string content, MessageType type = MessageType.Text)
        {
            var (encryptedContent, iv) = _encryptionService.EncryptMessage(content);

            var message = new ChatMessage
            {
                ChatRoomId = chatRoomId,
                SenderId = senderId,
                EncryptedContent = encryptedContent,
                InitializationVector = iv,
                Type = type
            };

            var chatRoom = await _context.ChatRooms.FindAsync(chatRoomId);
            chatRoom.LastMessageAt = DateTime.UtcNow;

            _context.ChatMessages.Add(message);
            await _context.SaveChangesAsync();

            return message;
        }

        public async Task<List<ChatRoom>> GetUserChatRoomsAsync(string userId)
        {
            return await _context.ChatRooms
                .Include(r => r.Employer).ThenInclude(r => r.Companies)
                .Include(r => r.Applicant)
                .Include(r => r.Messages.OrderByDescending(m => m.SentAt).Take(1))
                .Where(r => (r.EmployerId == userId || r.ApplicantId == userId) && r.IsActive)
                .OrderByDescending(r => r.LastMessageAt)
                .ToListAsync();
        }

        public async Task<List<ChatMessage>> GetMessagesAsync(string chatRoomId, DateTime? lastFetch = null)
        {
            var query = _context.ChatMessages
                .Include(m => m.Sender)
                .Where(m => m.ChatRoomId == chatRoomId);

            if (lastFetch.HasValue)
            {
                query = query.Where(m => m.SentAt > lastFetch.Value);
            }

            var messages = await query
                .OrderByDescending(m => m.SentAt)
                .Take(50)
                .ToListAsync();

            return messages;
        }

        public async Task MarkMessagesAsReadAsync(string chatRoomId, string userId)
        {
            var unreadMessages = await _context.ChatMessages
                .Where(m => m.ChatRoomId == chatRoomId && m.SenderId != userId && !m.IsRead)
                .ToListAsync();

            foreach (var message in unreadMessages)
            {
                message.IsRead = true;
            }

            await _context.SaveChangesAsync();
        }
    }
}
