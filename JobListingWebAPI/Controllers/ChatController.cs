using JobListingWebAPI.Repositories;
using JobListingWebAPI.Services;
using JobListingWebAPI.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using JobListingWebAPI.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;

namespace JobListingWebAPI.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ChatController : ControllerBase
    {
        private readonly IChatService _chatService;
        private readonly IEncryptionService _encryptionService;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IWebHostEnvironment _environment;

        public ChatController(
            IChatService chatService,
            IEncryptionService encryptionService,
            UserManager<ApplicationUser> userManager,
            IWebHostEnvironment environment)
        {
            _chatService = chatService;
            _encryptionService = encryptionService;
            _userManager = userManager;
            _environment = environment;
        }

        [HttpPost("rooms")]
        public async Task<IActionResult> CreateChatRoom([FromQuery] string employerId)
        {
            var currentUser = await _userManager.GetUserAsync(User);
            if (currentUser is not ApplicantUser)
                return BadRequest("Only applicants can initiate chats");

            var chatRoom = await _chatService.CreateChatRoomAsync(employerId, currentUser.Id);
            return Ok(chatRoom);
        }

        [HttpGet("rooms")]
        public async Task<IActionResult> GetChatRooms()
        {
            var currentUser = await _userManager.GetUserAsync(User);
            var rooms = await _chatService.GetUserChatRoomsAsync(currentUser.Id);

            return Ok(rooms.Select(room => new
            {
                room.Id,
                room.CreatedAt,
                room.LastMessageAt,
                Employer = new { room.Employer.Id, room.Employer.CompanyName },
                Applicant = new { room.Applicant.Id, room.Applicant.FirstName, room.Applicant.LastName },
                LastMessage = room.Messages?.FirstOrDefault() != null ? new
                {
                    Content = _encryptionService.DecryptMessage(
                        room.Messages.First().EncryptedContent,
                        room.Messages.First().InitializationVector
                    ),
                    room.Messages.First().SentAt,
                    room.Messages.First().IsRead,
                    room.Messages.First().Type
                } : null
            }));
        }

        [HttpPut("rooms/{roomId}/archive")]
        public async Task<IActionResult> ArchiveChatRoom(string roomId)
        {
            var currentUser = await _userManager.GetUserAsync(User);
            var result = await _chatService.ArchiveChatRoomAsync(roomId, currentUser.Id);
            return Ok(result);
        }

        [HttpDelete("rooms/{roomId}")]
        public async Task<IActionResult> DeleteChatRoom(string roomId)
        {
            var currentUser = await _userManager.GetUserAsync(User);
            await _chatService.DeleteChatRoomAsync(roomId, currentUser.Id);
            return Ok();
        }

        [HttpPost("messages")]
        public async Task<IActionResult> SendMessage([FromBody] SendMessageDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var currentUser = await _userManager.GetUserAsync(User);
            var message = await _chatService.SendMessageAsync(
                dto.ChatRoomId,
                currentUser.Id,
                dto.Content,
                dto.Type
            );

            return Ok(new
            {
                message.Id,
                Content = _encryptionService.DecryptMessage(message.EncryptedContent, message.InitializationVector),
                message.SentAt,
                message.IsRead,
                message.Type,
                Sender = new { currentUser.Id, currentUser.FirstName, currentUser.LastName }
            });
        }

        [HttpGet("messages/{roomId}")]
        public async Task<IActionResult> GetMessages(string roomId, [FromQuery] DateTime? lastFetch)
        {
            var currentUser = await _userManager.GetUserAsync(User);
            var messages = await _chatService.GetMessagesAsync(roomId, lastFetch);

            await _chatService.MarkMessagesAsReadAsync(roomId, currentUser.Id);

            return Ok(messages.Select(m => new
            {
                m.Id,
                Content = _encryptionService.DecryptMessage(m.EncryptedContent, m.InitializationVector),
                m.SentAt,
                m.IsRead,
                m.Type,
                Sender = new { m.Sender.Id, m.Sender.FirstName, m.Sender.LastName }
            }));
        }

        [HttpDelete("messages/{messageId}")]
        public async Task<IActionResult> DeleteMessage(string messageId)
        {
            var currentUser = await _userManager.GetUserAsync(User);
            await _chatService.DeleteMessageAsync(messageId, currentUser.Id);
            return Ok();
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadFile([FromForm] IFormFile file, [FromForm] string chatRoomId)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded");

            var currentUser = await _userManager.GetUserAsync(User);
            if (currentUser == null)
                return Unauthorized();

            // Create uploads directory if it doesn't exist
            var uploadsPath = Path.Combine(_environment.WebRootPath, "uploads", "chat");
            Directory.CreateDirectory(uploadsPath);

            // Generate unique filename
            var fileName = $"{Guid.NewGuid()}_{file.FileName}";
            var filePath = Path.Combine(uploadsPath, fileName);

            // Save file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Save file info to database
            var chatFile = new ChatFile
            {
                FileName = file.FileName,
                FilePath = $"/uploads/chat/{fileName}",
                FileSize = file.Length,
                ContentType = file.ContentType,
                UploadedBy = currentUser.Id,
                ChatRoomId = chatRoomId
            };

            await _chatService.SaveChatFileAsync(chatFile);

            return Ok(new
            {
                fileUrl = chatFile.FilePath,
                fileId = chatFile.Id,
                fileName = chatFile.FileName,
                fileSize = chatFile.FileSize
            });
        }
    }

    public class SendMessageDto
    {
        public string? ChatRoomId { get; set; }
        public string? Content { get; set; }
        public MessageType Type { get; set; } = MessageType.Text;
    }
}
