using System.ComponentModel.DataAnnotations;

namespace JobListingWebAPI.Models
{
    public class BaseLoginModel
    {
        [Required(ErrorMessage = "Email là bắt buộc")]
        [EmailAddress(ErrorMessage = "Email không hợp lệ")]
        public string? Email { get; set; }

        [Required(ErrorMessage = "Mật khẩu là bắt buộc")]
        public string? Password { get; set; }

        public bool RememberMe { get; set; }
    }

    public class ApplicantLoginModel : BaseLoginModel
    {
    }

    public class EmployerLoginModel : BaseLoginModel
    {
    }
    public class AdminLoginModel : BaseLoginModel
    {
    }
}
