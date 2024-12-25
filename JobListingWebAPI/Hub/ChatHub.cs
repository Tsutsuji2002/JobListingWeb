using Microsoft.AspNetCore.SignalR;
using JobListingWebAPI.Entities;
using JobListingWebAPI.Services;
using System.Security.Claims;
using JobListingWebAPI.Repositories;
using Microsoft.AspNetCore.Authorization;

namespace JobListingWebAPI.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly IChatRoomRepository _chatRoomRepository;
        private readonly IChatEncryptionService _encryptionService;
        private readonly Dictionary<string, HashSet<string>> _userConnections = new();

        public ChatHub(
            IChatRoomRepository chatRoomRepository,
            IChatEncryptionService encryptionService)
        {
            _chatRoomRepository = chatRoomRepository;
            _encryptionService = encryptionService;
        }

        public async Task CreateOrJoinRoom(string employerId, string applicantId)
        {
            var room = await _chatRoomRepository.CreateChatRoomAsync(employerId, applicantId);
            await Groups.AddToGroupAsync(Context.ConnectionId, room.Id);
        }

        public async Task SendMessage(string roomId, string message)
        {
            if (Context.User == null)
            {
                throw new HubException("User context is null");
            }

            var senderId = Context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(senderId))
            {
                throw new HubException("User not authenticated");
            }

            var (encryptedMessage, iv) = _encryptionService.EncryptMessage(message);

            var savedMessage = await _chatRoomRepository.SaveMessageAsync(roomId, senderId, message);

            await Clients.Group(roomId).SendAsync("ReceiveMessage", new
            {
                roomId,
                messageId = savedMessage.Id,
                senderId,
                message = encryptedMessage,
                iv,
                timestamp = savedMessage.SentAt,
                type = "text"
            });
        }

        public override async Task OnConnectedAsync()
        {
            if (Context.User == null)
            {
                await base.OnConnectedAsync();
                return;
            }

            var userId = Context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(userId))
            {
                if (!_userConnections.ContainsKey(userId))
                {
                    _userConnections[userId] = new HashSet<string>();
                }
                _userConnections[userId].Add(Context.ConnectionId);

                var userRooms = await _chatRoomRepository.GetUserChatRoomsAsync(userId);
                foreach (var room in userRooms)
                {
                    await Groups.AddToGroupAsync(Context.ConnectionId, room.Id);
                }
            }
            await base.OnConnectedAsync();
        }

        public async Task MarkMessagesAsRead(string roomId)
        {
            if (Context.User == null)
            {
                throw new HubException("User context is null");
            }

            var readerId = Context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(readerId))
            {
                await _chatRoomRepository.MarkMessagesAsReadAsync(roomId, readerId);
                await Clients.Group(roomId).SendAsync("MessagesMarkedAsRead", new
                {
                    roomId,
                    readerId
                });
            }
        }
    }
}
