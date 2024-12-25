using System.ComponentModel.DataAnnotations;

namespace JobListingWebAPI.Models
{
    public class ChangePasswordRequest
    {
        [Required]
        public string? UserId { get; set; }

        [Required]
        public string? CurrentPassword { get; set; }

        [Required]
        [MinLength(8)]
        public string? NewPassword { get; set; }

        public string? VerificationCode { get; set; }
    }
    public class SendPasswordVerificationRequest
    {
        [Required]
        public string? UserId { get; set; }

        [Required]
        public string? CurrentPassword { get; set; }

        [Required]
        [MinLength(8)]
        public string? NewPassword { get; set; }
    }

    public class PasswordVerificationCache
    {
        public string? NewPassword { get; set; }
        public string? VerificationCode { get; set; }
        public DateTime Timestamp { get; set; }
    }
}
