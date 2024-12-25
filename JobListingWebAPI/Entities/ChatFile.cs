using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace JobListingWebAPI.Entities
{
    public class ChatFile
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string? MessageId { get; set; }
        public string? FileName { get; set; }
        public string? FileType { get; set; }
        public string? FilePath { get; set; }
        public long FileSize { get; set; }

        [ForeignKey("MessageId")]
        public ChatMessage? Message { get; set; }
    }
}
