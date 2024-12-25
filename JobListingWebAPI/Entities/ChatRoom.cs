using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace JobListingWebAPI.Entities
{
    public class ChatRoom
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string? EmployerId { get; set; }
        public string? ApplicantId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime LastMessageAt { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;

        [ForeignKey("EmployerId")]
        public EmployerUser? Employer { get; set; }

        [ForeignKey("ApplicantId")]
        public ApplicantUser? Applicant { get; set; }

        public ICollection<ChatMessage>? Messages { get; set; }
    }
}
