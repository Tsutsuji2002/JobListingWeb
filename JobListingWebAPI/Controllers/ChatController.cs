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
    //[Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ChatController : ControllerBase
    {
        private readonly IChatService _chatService;
        private readonly IEncryptionService _encryptionService;
        private readonly UserManager<ApplicationUser> _userManager;

        public ChatController(
            IChatService chatService,
            IEncryptionService encryptionService,
            UserManager<ApplicationUser> userManager)
        {
            _chatService = chatService;
            _encryptionService = encryptionService;
            _userManager = userManager;
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
    }

    public class SendMessageDto
    {
        public string? ChatRoomId { get; set; }
        public string? Content { get; set; }
        public MessageType Type { get; set; } = MessageType.Text;
    }
}
