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
        private readonly IHubContext<ChatHub> _hubContext;
        private readonly Dictionary<string, HashSet<string>> _userConnections = new();
        private readonly Dictionary<string, string> _connectionToUserMap = new();
        private readonly Dictionary<string, HashSet<string>> _roomUsers = new();
        private readonly Dictionary<string, DateTime> _userTyping = new();

        public ChatHub(
            IChatRoomRepository chatRoomRepository,
            IChatEncryptionService encryptionService,
            IHubContext<ChatHub> hubContext)
        {
            _chatRoomRepository = chatRoomRepository;
            _encryptionService = encryptionService;
            _hubContext = hubContext;
        }

        public async Task CreateOrJoinRoom(string employerId, string applicantId)
        {
            var room = await _chatRoomRepository.CreateChatRoomAsync(employerId, applicantId);
            await Groups.AddToGroupAsync(Context.ConnectionId, room.Id);

            // Track user in room
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(userId))
            {
                if (!_roomUsers.ContainsKey(room.Id))
                {
                    _roomUsers[room.Id] = new HashSet<string>();
                }
                _roomUsers[room.Id].Add(userId);

                // Notify others in room
                await Clients.OthersInGroup(room.Id).SendAsync("UserJoinedRoom", new
                {
                    roomId = room.Id,
                    userId,
                    timestamp = DateTime.UtcNow
                });
            }
        }

        public async Task JoinRoom(string roomId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, roomId);

            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(userId))
            {
                if (!_roomUsers.ContainsKey(roomId))
                {
                    _roomUsers[roomId] = new HashSet<string>();
                }
                _roomUsers[roomId].Add(userId);

                // Notify others in room
                await Clients.OthersInGroup(roomId).SendAsync("UserJoinedRoom", new
                {
                    roomId,
                    userId,
                    timestamp = DateTime.UtcNow
                });
            }
        }

        public async Task LeaveRoom(string roomId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId);

            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(userId) && _roomUsers.ContainsKey(roomId))
            {
                _roomUsers[roomId].Remove(userId);
                if (_roomUsers[roomId].Count == 0)
                {
                    _roomUsers.Remove(roomId);
                }

                // Notify others in room
                await Clients.OthersInGroup(roomId).SendAsync("UserLeftRoom", new
                {
                    roomId,
                    userId,
                    timestamp = DateTime.UtcNow
                });
            }
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

        public async Task SendTyping(string roomId, bool isTyping)
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return;
            }

            if (isTyping)
            {
                _userTyping[userId] = DateTime.UtcNow;
            }
            else
            {
                _userTyping.Remove(userId);
            }

            await Clients.OthersInGroup(roomId).SendAsync("UserTyping", new
            {
                roomId,
                userId,
                isTyping,
                timestamp = DateTime.UtcNow
            });
        }

        public async Task GetOnlineUsers(string roomId)
        {
            if (_roomUsers.ContainsKey(roomId))
            {
                await Clients.Caller.SendAsync("OnlineUsers", new
                {
                    roomId,
                    userIds = _roomUsers[roomId].ToList(),
                    count = _roomUsers[roomId].Count
                });
            }
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
                // Track connection
                if (!_userConnections.ContainsKey(userId))
                {
                    _userConnections[userId] = new HashSet<string>();
                }
                _userConnections[userId].Add(Context.ConnectionId);
                _connectionToUserMap[Context.ConnectionId] = userId;

                // Join existing rooms
                var userRooms = await _chatRoomRepository.GetUserChatRoomsAsync(userId);
                foreach (var room in userRooms)
                {
                    await Groups.AddToGroupAsync(Context.ConnectionId, room.Id);

                    if (!_roomUsers.ContainsKey(room.Id))
                    {
                        _roomUsers[room.Id] = new HashSet<string>();
                    }
                    _roomUsers[room.Id].Add(userId);
                }

                // Notify others that user is online
                await Clients.Others.SendAsync("UserOnline", new
                {
                    userId,
                    timestamp = DateTime.UtcNow
                });
            }
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!string.IsNullOrEmpty(userId))
            {
                // Remove connection tracking
                if (_userConnections.ContainsKey(userId))
                {
                    _userConnections[userId].Remove(Context.ConnectionId);
                    if (_userConnections[userId].Count == 0)
                    {
                        _userConnections.Remove(userId);

                        // Notify others that user is offline
                        await Clients.Others.SendAsync("UserOffline", new
                        {
                            userId,
                            timestamp = DateTime.UtcNow
                        });
                    }
                }

                _connectionToUserMap.Remove(Context.ConnectionId);
                _userTyping.Remove(userId);

                // Remove from all rooms
                foreach (var roomUsers in _roomUsers.Values)
                {
                    roomUsers.Remove(userId);
                }
            }

            await base.OnDisconnectedAsync(exception);
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
