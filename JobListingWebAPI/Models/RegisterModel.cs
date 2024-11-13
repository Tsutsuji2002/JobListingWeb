using System.ComponentModel.DataAnnotations;

namespace JobListingWebAPI.Models
{
    public class BaseRegisterModel
    {
        [Required]
        [EmailAddress]
        public string? Email { get; set; }

        [Required]
        [StringLength(100, ErrorMessage = "The {0} must be at least {2} and at max {1} characters long.", MinimumLength = 6)]
        [DataType(DataType.Password)]
        public string? Password { get; set; }

        [DataType(DataType.Password)]
        [Compare("Password", ErrorMessage = "The password and confirmation password do not match.")]
        public string? ConfirmPassword { get; set; }

        [Required]
        [StringLength(100)]
        public string? FirstName { get; set; }

        [Required]
        [StringLength(100)]
        public string? LastName { get; set; }

        [StringLength(50)]
        public string? City { get; set; }

        [StringLength(50)]
        public string? District { get; set; }

        public bool Gender { get; set; } // true = male, false = female
    }

    public class ApplicantRegisterModel : BaseRegisterModel
    {
        // Additional fields specific to applicants can be added here.
    }

    public class EmployerRegisterModel : BaseRegisterModel
    {
        [Required]
        [StringLength(50)]
        public string? IdentificationCardNumber { get; set; }

        [StringLength(200)]
        public string? CompanyName { get; set; }
    }

    public class AdminRegisterModel : BaseRegisterModel
    {
        [Required]
        [StringLength(50)]
        public string? AdminLevel { get; set; }
    }
}
