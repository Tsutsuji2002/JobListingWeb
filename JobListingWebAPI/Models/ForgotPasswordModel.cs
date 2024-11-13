using System.ComponentModel.DataAnnotations;

namespace JobListingWebAPI.Models
{
    public class ForgotPasswordModel
    {
        [Required]
        [EmailAddress]
        public string? Email { get; set; }
    }
}
