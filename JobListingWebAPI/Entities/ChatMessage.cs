using Microsoft.Extensions.AI;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace JobListingWebAPI.Entities
{
    public class ChatMessage
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string? ChatRoomId { get; set; }
        public string? SenderId { get; set; }
        public string? EncryptedContent { get; set; }
        public string? InitializationVector { get; set; }
        public DateTime SentAt { get; set; } = DateTime.UtcNow;
        public bool IsRead { get; set; }
        public MessageType Type { get; set; } = MessageType.Text;

        [ForeignKey("ChatRoomId")]
        public ChatRoom? ChatRoom { get; set; }

        [ForeignKey("SenderId")]
        public ApplicationUser? Sender { get; set; }

        public ChatFile? File { get; set; }
    }
    public enum MessageType
    {
        Text = 0,
        Image = 1,
        File = 2,
    }
}
