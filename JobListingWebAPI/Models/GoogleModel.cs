using System.ComponentModel.DataAnnotations;

namespace JobListingWebAPI.Models
{
    public class GoogleLoginRequest
    {
        [Required]
        public string IdToken { get; set; } = string.Empty;
    }

    public class GoogleConfigResponse
    {
        public string ClientId { get; set; } = string.Empty;
    }

    public class AuthResponseModel
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
        public string RedirectUrl { get; set; } = string.Empty;
        public UserViewModel User { get; set; } = new();
    }

    public class UserViewModel
    {
        public string Id { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string UserType { get; set; } = string.Empty;
    }

    public class ErrorResponse
    {
        public string Message { get; set; } = string.Empty;
    }
}
