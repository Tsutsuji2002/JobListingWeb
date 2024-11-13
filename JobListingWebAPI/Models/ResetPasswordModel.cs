using System.ComponentModel.DataAnnotations;

namespace JobListingWebAPI.Models
{
    public class ResetPasswordModel
    {
        [Required]
        [EmailAddress]
        public string? Email { get; set; }

        [Required]
        public string? Token { get; set; }

        [Required]
        [StringLength(100, ErrorMessage = "The {0} must be at least {2} characters long.", MinimumLength = 6)]
        public string? NewPassword { get; set; }

        [Compare("NewPassword", ErrorMessage = "The new password and confirmation password do not match.")]
        public string? ConfirmPassword { get; set; }
    }
}
