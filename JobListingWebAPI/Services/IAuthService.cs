using JobListingWebAPI.Entities;
using JobListingWebAPI.Models;
using Microsoft.AspNetCore.Identity;

namespace JobListingWebAPI.Services
{
    public interface IAuthService
    {
        Task<(bool success, string message, ApplicationUser? user)> RegisterApplicantAsync(ApplicantRegisterModel model);
        Task<(bool success, string message, ApplicationUser? user)> RegisterEmployerAsync(EmployerRegisterModel model);
        Task<(bool success, string message, ApplicantUser? user)> LoginApplicantAsync(ApplicantLoginModel model);
        Task<(bool success, string message, EmployerUser? user, string? token)> LoginEmployerAsync(EmployerLoginModel model);
        Task<(bool success, string message, AdminUser? user)> LoginAdminAsync(AdminLoginModel model);
        Task<string> GetUserRedirectUrl(ApplicationUser user);
        Task LogoutAsync();
        Task<bool> IsEmailAvailable(string email);
        Task<ApplicationUser?> GetUserProfileAsync(string userId);
        Task<(bool success, string message)> UpdateUserProfileAsync(string userId, UpdateProfileModel model);
        Task<(bool success, string message)> ChangePasswordAsync(string userId, string currentPassword, string newPassword);
        Task<(bool success, string message)> ResetPasswordAsync(string email, string token, string newPassword);
        Task<(bool success, string message)> ForgotPasswordAsync(string email);

        // New methods
        Task<(bool success, string message)> DeactivateAccountAsync(string userId);
        Task<(bool success, string message)> ReactivateAccountAsync(string userId);
        Task<(bool success, string message)> UpdateLastLoginAsync(string userId);
        Task<bool> ValidatePasswordStrength(string password);
        Task<(bool success, string message)> UpdateEmailAsync(string userId, string newEmail);
        Task<IList<string>> GetUserRolesAsync(string userId);
        Task<(bool success, string message)> AddToRoleAsync(string userId, string roleName);
        Task<(bool success, string message)> RemoveFromRoleAsync(string userId, string roleName);
        Task<bool> IsAccountLocked(string userId);
    }
}