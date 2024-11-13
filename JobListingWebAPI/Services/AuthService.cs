using JobListingWebAPI.Entities;
using JobListingWebAPI.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;

namespace JobListingWebAPI.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly ILogger<AuthService> _logger;
        private readonly IConfiguration _configuration;

        public AuthService(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            RoleManager<IdentityRole> roleManager,
            ILogger<AuthService> logger,
            IConfiguration configuration)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _roleManager = roleManager;
            _logger = logger;
            _configuration = configuration;
        }

        private async Task<string> GenerateJwtToken(ApplicationUser user)
        {
            var userRoles = await _userManager.GetRolesAsync(user);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}"),
                new Claim("UserType", "Employer")
            };

            // Add roles to claims
            foreach (var role in userRoles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var secret = _configuration["JWT:Secret"];
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["JWT:ValidIssuer"],
                audience: _configuration["JWT:ValidAudience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(30), // Token expires in 30 minutes
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public async Task<(bool success, string message, ApplicationUser? user)> RegisterApplicantAsync(ApplicantRegisterModel model)
        {
            try
            {
                var existingUser = await _userManager.FindByEmailAsync(model.Email);
                if (existingUser != null)
                {
                    return (false, "Email đã được đăng ký", null);
                }

                if (!await _roleManager.RoleExistsAsync("Applicant"))
                {
                    _logger.LogWarning("Vai trò Applicant không tồn tại. Đang tạo vai trò mới.");
                    await _roleManager.CreateAsync(new IdentityRole("Applicant"));
                }

                var user = new ApplicantUser
                {
                    UserName = model.Email,
                    Email = model.Email,
                    FirstName = model.FirstName,
                    LastName = model.LastName,
                    City = model.City,
                    District = model.District,
                    CreateTime = DateTime.Now,
                    ModifiedDate = DateTime.Now,
                    LastLogin = DateTime.Now,
                    UserType = "Applicant",
                };

                var result = await _userManager.CreateAsync(user, model.Password);
                if (!result.Succeeded)
                {
                    var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                    _logger.LogError("Không thể tạo người dùng: {Errors}", errors);
                    return (false, errors, null);
                }

                var roleResult = await _userManager.AddToRoleAsync(user, "Applicant");
                if (!roleResult.Succeeded)
                {
                    var errors = string.Join(", ", roleResult.Errors.Select(e => e.Description));
                    _logger.LogError("Không thể gán vai trò: {Errors}", errors);
                    await _userManager.DeleteAsync(user);
                    return (false, $"Đã tạo người dùng nhưng không thể gán vai trò: {errors}", null);
                }

                return (true, "Đăng ký ứng viên thành công", user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi trong quá trình đăng ký ứng viên");
                return (false, "Đã xảy ra lỗi không mong muốn trong quá trình đăng ký", null);
            }
        }

        public async Task<(bool success, string message, ApplicationUser? user)> RegisterEmployerAsync(EmployerRegisterModel model)
        {
            var existingUser = await _userManager.FindByEmailAsync(model.Email);
            if (existingUser != null)
            {
                return (false, "Email đã được đăng ký", null);
            }

            var user = new EmployerUser
            {
                UserName = model.Email,
                Email = model.Email,
                FirstName = model.FirstName,
                LastName = model.LastName,
                City = model.City,
                District = model.District,
                CreateTime = DateTime.Now,
                ModifiedDate = DateTime.Now,
                LastLogin = DateTime.Now,
                UserType = "Employer",
                CompanyName = model.CompanyName,
                IdentificationCardNumber= model.IdentificationCardNumber,
            };

            var result = await _userManager.CreateAsync(user, model.Password);
            if (!result.Succeeded)
            {
                return (false, string.Join(", ", result.Errors.Select(e => e.Description)), null);
            }

            await _userManager.AddToRoleAsync(user, "Employer");

            return (true, "Đăng ký nhà tuyển dụng thành công", user);
        }

        public async Task<(bool success, string message, ApplicantUser? user)> LoginApplicantAsync(ApplicantLoginModel model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null || user.UserType != "Applicant")
            {
                return (false, "Email hoặc mật khẩu không đúng", null);
            }

            if (user.IsDeleted)
            {
                return (false, "Tài khoản này đã bị xóa", null);
            }

            var result = await _signInManager.PasswordSignInAsync(user, model.Password, model.RememberMe, lockoutOnFailure: true);

            if (result.Succeeded)
            {
                user.LastLogin = DateTime.Now;
                await _userManager.UpdateAsync(user);
                return (true, "Đăng nhập thành công", user as ApplicantUser);
            }

            if (result.IsLockedOut)
            {
                return (false, "Tài khoản đã bị khóa. Vui lòng thử lại sau", null);
            }

            return (false, "Email hoặc mật khẩu không đúng", null);
        }

        public async Task<(bool success, string message, EmployerUser? user, string? token)> LoginEmployerAsync(EmployerLoginModel model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);

            if (user == null || user.UserType != "Employer")
            {
                return (false, "Email không hợp lệ", null, null);
            }

            if (user.IsDeleted)
            {
                return (false, "Tài khoản này đã bị xóa", null, null);
            }

            var result = await _signInManager.PasswordSignInAsync(user, model.Password, model.RememberMe, lockoutOnFailure: true);

            if (result.Succeeded)
            {
                var token = await GenerateJwtToken(user);
                user.LastLogin = DateTime.Now;
                await _userManager.UpdateAsync(user);
                return (true, "Đăng nhập thành công", user as EmployerUser, token);
            }

            if (result.IsLockedOut)
            {
                return (false, "Tài khoản đã bị khóa. Vui lòng thử lại sau", null, null);
            }

            return (false, "Có lỗi xảy ra trong quá trình đăng nhập", null, null);
        }

        public async Task<string> GetUserRedirectUrl(ApplicationUser user)
        {
            return user.UserType switch
            {
                "Admin" => "/Admin/Dashboard",
                "Applicant" => "/Applicant/Dashboard",
                "Employer" => "/Employer/Dashboard",
                _ => "/Home/Index"
            };
        }

        public async Task LogoutAsync()
        {
            await _signInManager.SignOutAsync();
        }

        public async Task<bool> IsEmailAvailable(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            return user == null;
        }

        public async Task<(bool success, string message, AdminUser? user)> LoginAdminAsync(AdminLoginModel model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null || user.UserType != "Admin")
            {
                return (false, "Email hoặc mật khẩu không hợp lệ", null);
            }

            if (user.IsDeleted)
            {
                return (false, "Tài khoản này đã bị xóa", null);
            }

            var result = await _signInManager.PasswordSignInAsync(user, model.Password, model.RememberMe, lockoutOnFailure: true);

            if (result.Succeeded)
            {
                user.LastLogin = DateTime.Now;
                await _userManager.UpdateAsync(user);
                return (true, "Đăng nhập thành công", user as AdminUser);
            }

            if (result.IsLockedOut)
            {
                return (false, "Tài khoản đã bị khóa. Vui lòng thử lại sau", null);
            }

            return (false, "Email hoặc mật khẩu không hợp lệ", null);
        }

        public async Task<ApplicationUser?> GetUserProfileAsync(string userId)
        {
            return await _userManager.FindByIdAsync(userId);
        }

        public async Task<(bool success, string message)> UpdateUserProfileAsync(string userId, UpdateProfileModel model)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return (false, "Không tìm thấy người dùng");
            }

            user.FirstName = model.FirstName;
            user.LastName = model.LastName;
            user.District = model.District;
            user.City = model.City;
            user.ModifiedDate = DateTime.Now;

            // Update user-specific fields based on user type
            switch (user)
            {
                case ApplicantUser applicant:
                    break;
                case EmployerUser employer:
                    employer.CompanyName = model.CompanyName;
                    employer.IdentificationCardNumber = model.IdentificationCardNumber;
                    break;
            }

            var result = await _userManager.UpdateAsync(user);
            if (result.Succeeded)
            {
                return (true, "Hồ sơ đã được cập nhật thành công");
            }
            else
            {
                return (false, string.Join(", ", result.Errors.Select(e => e.Description)));
            }
        }

        public async Task<(bool success, string message)> ChangePasswordAsync(string userId, string currentPassword, string newPassword)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return (false, "Không tìm thấy người dùng");
            }

            var result = await _userManager.ChangePasswordAsync(user, currentPassword, newPassword);
            if (result.Succeeded)
            {
                return (true, "Mật khẩu đã được thay đổi thành công");
            }
            else
            {
                return (false, string.Join(", ", result.Errors.Select(e => e.Description)));
            }
        }

        public async Task<(bool success, string message)> ResetPasswordAsync(string email, string token, string newPassword)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
            {
                return (false, "Không tìm thấy người dùng");
            }

            var result = await _userManager.ResetPasswordAsync(user, token, newPassword);
            if (result.Succeeded)
            {
                return (true, "Mật khẩu đã được thay đổi thành công");
            }
            else
            {
                return (false, string.Join(", ", result.Errors.Select(e => e.Description)));
            }
        }

        public async Task<(bool success, string message)> ForgotPasswordAsync(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
            {
                // Don't reveal that the user does not exist
                return (true, "If your email is registered, you will receive a password reset link shortly.");
            }

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            // Here you would typically send an email with the token
            // For this example, we'll just return the token
            return (true, $"Password reset token: {token}");
        }
        public async Task<(bool success, string message)> DeactivateAccountAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return (false, "Không tìm thấy người dùng");
            }

            user.IsDeleted = true;
            user.ModifiedDate = DateTime.Now;
            var result = await _userManager.UpdateAsync(user);

            if (result.Succeeded)
            {
                return (true, "Đã vô hiệu hóa tài khoản thành công");
            }

            return (false, "Không thể vô hiệu hóa tài khoản");
        }

        public async Task<(bool success, string message)> ReactivateAccountAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return (false, "Không tìm thấy người dùng");
            }

            if (!user.IsDeleted)
            {
                return (false, "Tài khoản đã được kích hoạt");
            }

            user.IsDeleted = false;
            user.ModifiedDate = DateTime.Now;
            var result = await _userManager.UpdateAsync(user);

            if (result.Succeeded)
            {
                return (true, "Đã kích hoạt lại tài khoản thành công");
            }

            return (false, "Không thể kích hoạt lại tài khoản");
        }

        public async Task<(bool success, string message)> UpdateLastLoginAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return (false, "Không tìm thấy người dùng");
            }

            user.LastLogin = DateTime.Now;
            var result = await _userManager.UpdateAsync(user);

            return result.Succeeded
                ? (true, "Đã cập nhật thời gian đăng nhập")
                : (false, "Không thể cập nhật thời gian đăng nhập");
        }

        public async Task<bool> ValidatePasswordStrength(string password)
        {
            var hasNumber = new Regex(@"[0-9]+");
            var hasUpperChar = new Regex(@"[A-Z]+");
            var hasLowerChar = new Regex(@"[a-z]+");
            var hasSymbols = new Regex(@"[!@#$%^&*()_+=\[{\]};:<>|./?,-]");
            var hasMinLength = password.Length >= 8;

            return hasNumber.IsMatch(password) &&
                   hasUpperChar.IsMatch(password) &&
                   hasLowerChar.IsMatch(password) &&
                   hasSymbols.IsMatch(password) &&
                   hasMinLength;
        }

        public async Task<(bool success, string message)> UpdateEmailAsync(string userId, string newEmail)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return (false, "Không tìm thấy người dùng");
            }

            if (await _userManager.FindByEmailAsync(newEmail) != null)
            {
                return (false, "Email đã được sử dụng");
            }

            var token = await _userManager.GenerateChangeEmailTokenAsync(user, newEmail);
            var result = await _userManager.ChangeEmailAsync(user, newEmail, token);

            if (result.Succeeded)
            {
                user.UserName = newEmail; // Update username to match email
                await _userManager.UpdateAsync(user);
                return (true, "Đã cập nhật email thành công");
            }

            return (false, "Không thể cập nhật email");
        }

        public async Task<IList<string>> GetUserRolesAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return new List<string>();
            }

            return await _userManager.GetRolesAsync(user);
        }

        public async Task<(bool success, string message)> AddToRoleAsync(string userId, string roleName)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return (false, "Không tìm thấy người dùng");
            }

            if (!await _roleManager.RoleExistsAsync(roleName))
            {
                return (false, "Vai trò không tồn tại");
            }

            var result = await _userManager.AddToRoleAsync(user, roleName);
            return result.Succeeded
                ? (true, "Đã thêm vai trò thành công")
                : (false, "Không thể thêm vai trò");
        }

        public async Task<(bool success, string message)> RemoveFromRoleAsync(string userId, string roleName)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return (false, "Không tìm thấy người dùng");
            }

            var result = await _userManager.RemoveFromRoleAsync(user, roleName);
            return result.Succeeded
                ? (true, "Đã xóa vai trò thành công")
                : (false, "Không thể xóa vai trò");
        }

        public async Task<bool> IsAccountLocked(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return false;
            }

            return await _userManager.IsLockedOutAsync(user);
        }
    }
}
