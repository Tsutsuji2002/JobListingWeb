using JobListingWebAPI.Entities;
using JobListingWebAPI.Data;
using Microsoft.EntityFrameworkCore;

namespace JobListingWebAPI.Repositories
{
    public class ChatRoomRepository : IChatRoomRepository
    {
        private readonly JobListingWebDbContext _context;

        public ChatRoomRepository(JobListingWebDbContext context)
        {
            _context = context;
        }

        public async Task<ChatRoom> CreateChatRoomAsync(string employerId, string applicantId)
        {
            // Check if a room already exists between these participants
            var existingRoom = await GetChatRoomByParticipantsAsync(employerId, applicantId);
            if (existingRoom != null)
            {
                return existingRoom;
            }

            var chatRoom = new ChatRoom
            {
                EmployerId = employerId,
                ApplicantId = applicantId,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            _context.ChatRooms.Add(chatRoom);
            await _context.SaveChangesAsync();

            return chatRoom;
        }

        public async Task<ChatRoom> GetChatRoomAsync(string roomId)
        {
            return await _context.ChatRooms
                .Include(r => r.Employer)
                .Include(r => r.Applicant)
                .Include(r => r.Messages)
                .FirstOrDefaultAsync(r => r.Id == roomId);
        }

        public async Task<ChatRoom> GetChatRoomByParticipantsAsync(string employerId, string applicantId)
        {
            return await _context.ChatRooms
                .FirstOrDefaultAsync(r =>
                    r.EmployerId == employerId && r.ApplicantId == applicantId ||
                    r.EmployerId == applicantId && r.ApplicantId == employerId);
        }

        public async Task<List<ChatRoom>> GetUserChatRoomsAsync(string userId)
        {
            return await _context.ChatRooms
                .Where(r => r.EmployerId == userId || r.ApplicantId == userId)
                .Include(r => r.Employer)
                .Include(r => r.Applicant)
                .Include(r => r.Messages.OrderByDescending(m => m.SentAt).Take(1))
                .OrderByDescending(r => r.Messages.Max(m => m.SentAt))
                .ToListAsync();
        }

        public async Task<ChatMessage> SaveMessageAsync(string roomId, string senderId, string content)
        {
            var chatMessage = new ChatMessage
            {
                ChatRoomId = roomId,
                SenderId = senderId,
                EncryptedContent = content,
                SentAt = DateTime.UtcNow,
                IsRead = false
            };

            _context.ChatMessages.Add(chatMessage);
            await _context.SaveChangesAsync();

            return chatMessage;
        }

        public async Task<List<ChatMessage>> GetChatRoomMessagesAsync(string roomId, int page = 1, int pageSize = 50)
        {
            return await _context.ChatMessages
                .Where(m => m.ChatRoomId == roomId)
                .Include(m => m.Sender)
                .OrderByDescending(m => m.SentAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<int> GetUnreadMessagesCountAsync(string userId)
        {
            return await _context.ChatMessages
                .CountAsync(m => m.ChatRoomId != null &&
                    (m.ChatRoom.EmployerId == userId || m.ChatRoom.ApplicantId == userId) &&
                    m.SenderId != userId &&
                    !m.IsRead);
        }

        public async Task MarkMessagesAsReadAsync(string roomId, string readerId)
        {
            var unreadMessages = await _context.ChatMessages
                .Where(m => m.ChatRoomId == roomId && m.SenderId != readerId && !m.IsRead)
                .ToListAsync();

            foreach (var message in unreadMessages)
            {
                message.IsRead = true;
            }

            await _context.SaveChangesAsync();
        }
        public async Task<(ChatMessage message, ChatFile file)> SaveFileMessageAsync(string roomId, string senderId, IFormFile file, string filePath)
        {
            var message = new ChatMessage
            {
                ChatRoomId = roomId,
                SenderId = senderId,
                EncryptedContent = file.FileName,
                SentAt = DateTime.UtcNow,
                IsRead = false,
                Type = MessageType.File
            };

            var chatFile = new ChatFile
            {
                FileName = file.FileName,
                FileType = Path.GetExtension(file.FileName).ToLowerInvariant(),
                FilePath = filePath,
                FileSize = file.Length
            };

            message.File = chatFile;
            _context.ChatMessages.Add(message);
            await _context.SaveChangesAsync();

            return (message, chatFile);
        }
    }
}
