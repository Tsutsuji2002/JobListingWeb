using JobListingWebAPI.Data;
using JobListingWebAPI.Entities;
using JobListingWebAPI.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authentication.Google;
using System.Collections.Concurrent;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Http;
using Google.Apis.Auth;
using MailKit.Net.Smtp;
using MimeKit;
using MimeKit.Text;
using System.Runtime;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.EntityFrameworkCore;

namespace JobListingWebAPI.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IMemoryCache _cache;
        private readonly ILogger<AuthService> _logger;
        private readonly IConfiguration _configuration;
        private readonly IServiceScopeFactory _serviceScopeFactory;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IDistributedCache _distributedCache;
        private readonly GoogleAuthSettings _googleSettings;
        private static readonly ConcurrentDictionary<string, (int attempts, DateTime firstAttempt)>
        _failedLoginAttempts = new();

        public AuthService(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            RoleManager<IdentityRole> roleManager,
            IMemoryCache cache,
            ILogger<AuthService> logger,
            IConfiguration configuration,
            IServiceScopeFactory serviceScopeFactory,
            IHttpContextAccessor httpContextAccessor,
            IDistributedCache distributedCache)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _roleManager = roleManager;
            _cache = cache;
            _logger = logger;
            _configuration = configuration;
            _serviceScopeFactory = serviceScopeFactory;
            _httpContextAccessor = httpContextAccessor;
            _googleSettings = configuration.GetSection("GoogleAuth").Get<GoogleAuthSettings>()
                ?? throw new InvalidOperationException("Google Auth settings are not configured");
            _distributedCache = distributedCache;
        }

        public async Task<IEnumerable<ApplicationUser>> GetAllUsersByTypeAsync(string userType, bool includeSoftDeleted = false)
        {
            var users = await _userManager.Users
                .Where(u => u.UserType == userType)
                .ToListAsync();

            if (!includeSoftDeleted)
            {
                users = users.Where(u => !u.IsDeleted).ToList();
            }

            return users;
        }

        public async Task<IdentityResult> SoftDeleteUserAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return IdentityResult.Failed(new IdentityError { Description = "User not found" });
            }

            user.IsDeleted = true;
            user.ModifiedDate = DateTime.Now;
            return await _userManager.UpdateAsync(user);
        }

        public async Task<IdentityResult> PermanentDeleteUserAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return IdentityResult.Failed(new IdentityError { Description = "User not found" });
            }

            return await _userManager.DeleteAsync(user);
        }

        public async Task<IdentityResult> RestoreSoftDeletedUserAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return IdentityResult.Failed(new IdentityError { Description = "User not found" });
            }

            user.IsDeleted = false;
            user.ModifiedDate = DateTime.Now;
            return await _userManager.UpdateAsync(user);
        }

        public async Task<(bool success, string message, ApplicationUser? user, string? token)>
            HandleGoogleAuthAsync(string idToken)
        {
            try
            {
                // Validate the Google ID token
                var validationSettings = new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new[] { _googleSettings.ClientId }
                };

                var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, validationSettings);

                // Check if user exists
                var user = await _userManager.FindByEmailAsync(payload.Email);

                if (user == null)
                {
                    // Create new user if doesn't exist
                    user = new ApplicantUser // Default to Applicant, can be changed later
                    {
                        UserName = payload.Email,
                        Email = payload.Email,
                        FirstName = payload.GivenName,
                        LastName = payload.FamilyName,
                        EmailConfirmed = payload.EmailVerified,
                        UserType = "Applicant",
                        CreateTime = DateTime.Now,
                        ModifiedDate = DateTime.Now,
                        LastLogin = DateTime.Now
                    };

                    var createResult = await _userManager.CreateAsync(user);
                    if (!createResult.Succeeded)
                    {
                        return (false, "Failed to create user account", null, null);
                    }

                    // Add to Applicant role
                    await _userManager.AddToRoleAsync(user, "Applicant");

                    // Add Google login info
                    var addLoginResult = await _userManager.AddLoginAsync(user, new UserLoginInfo(
                        "Google", payload.Subject, "Google"));

                    if (!addLoginResult.Succeeded)
                    {
                        return (false, "Failed to add Google login information", null, null);
                    }
                }

                // Generate JWT token
                var token = await GenerateJwtToken(user);

                // Update last login
                user.LastLogin = DateTime.Now;
                await _userManager.UpdateAsync(user);

                return (true, "Google authentication successful", user, token);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during Google authentication");
                return (false, "Google authentication failed", null, null);
            }
        }

        private bool IsIpBlocked(string ipAddress)
        {
            if (_failedLoginAttempts.TryGetValue(ipAddress, out var failedAttempt))
            {
                // Reset after 15 minutes
                if (DateTime.Now - failedAttempt.firstAttempt > TimeSpan.FromMinutes(15))
                {
                    _failedLoginAttempts.TryRemove(ipAddress, out _);
                    return false;
                }

                // Block if more than 5 failed attempts in 15 minutes
                return failedAttempt.attempts >= 5;
            }
            return false;
        }

        private void RecordFailedAttempt(string ipAddress)
        {
            _failedLoginAttempts.AddOrUpdate(
                ipAddress,
                // Specify the key parameter explicitly
                key => new(1, DateTime.Now),
                // Update existing value
                (key, existing) => new(existing.attempts + 1, existing.firstAttempt)
            );
        }

        private async Task<string> GenerateJwtToken(ApplicationUser user)
        {
            var userClaims = await _userManager.GetClaimsAsync(user);
            var userRoles = await _userManager.GetRolesAsync(user);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}"),
                new Claim("UserType", user.UserType),
                new Claim("userId", user.Id)

            };

            // Add roles to claims
            foreach (var role in userRoles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var secret = _configuration["JWT:Secret"];
            var key = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(secret));
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

        public async Task<(bool success, string message, ApplicantUser? user, string? token)> LoginApplicantAsync(ApplicantLoginModel model, string ipAddress)
        {
            try
            {
                // Check if IP is blocked (similar to Employer method)
                if (IsIpBlocked(ipAddress))
                {
                    _logger.LogWarning($"Blocked login attempt from IP: {ipAddress}");
                    return (false, "Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút", null, null);
                }

                // Try to get cached user to reduce DB hits
                var cacheKey = $"user_{model.Email}";
                var user = await _cache.GetOrCreateAsync(cacheKey, async entry =>
                {
                    entry.SetAbsoluteExpiration(TimeSpan.FromMinutes(5));
                    return await _userManager.FindByEmailAsync(model.Email);
                });

                if (user == null || user.UserType != "Applicant")
                {
                    RecordFailedAttempt(ipAddress);
                    return (false, "Email hoặc mật khẩu không hợp lệ", null, null);
                }

                if (user.IsDeleted)
                {
                    return (false, "Tài khoản này đã bị xóa", null, null);
                }

                // Check for account lockout before password validation
                if (await _userManager.IsLockedOutAsync(user))
                {
                    return (false, "Tài khoản đã bị khóa. Vui lòng thử lại sau", null, null);
                }

                var result = await _signInManager.PasswordSignInAsync(
                    user,
                    model.Password,
                    model.RememberMe,
                    lockoutOnFailure: true
                );

                if (result.Succeeded)
                {
                    // Remove from failed attempts if exists
                    _failedLoginAttempts.TryRemove(ipAddress, out _);

                    var token = await GenerateJwtToken(user);

                    // Update LastLogin asynchronously
                    _ = Task.Run(async () =>
                    {
                        using (var scope = _serviceScopeFactory.CreateScope())
                        {
                            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
                            var context = scope.ServiceProvider.GetRequiredService<JobListingWebDbContext>();

                            user.LastLogin = DateTime.Now;
                            await userManager.UpdateAsync(user);
                        }
                    });

                    return (true, "Đăng nhập thành công", user as ApplicantUser, token);
                }

                if (result.IsLockedOut)
                {
                    return (false, "Tài khoản đã bị khóa. Vui lòng thử lại sau", null, null);
                }

                // Record failed attempt
                RecordFailedAttempt(ipAddress);
                return (false, "Email hoặc mật khẩu không chính xác", null, null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login process");
                return (false, "Có lỗi xảy ra trong quá trình đăng nhập", null, null);
            }
        }

        public async Task<(bool success, string message, EmployerUser? user, string? token)>
        LoginEmployerAsync(EmployerLoginModel model, string ipAddress)
        {
            try
            {
                // Check if IP is blocked
                if (IsIpBlocked(ipAddress))
                {
                    _logger.LogWarning($"Blocked login attempt from IP: {ipAddress}");
                    return (false, "Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút", null, null);
                }

                // Try to get cached user to reduce DB hits
                var cacheKey = $"user_{model.Email}";
                var user = await _cache.GetOrCreateAsync(cacheKey, async entry =>
                {
                    entry.SetAbsoluteExpiration(TimeSpan.FromMinutes(5));
                    return await _userManager.FindByEmailAsync(model.Email);
                });

                if (user == null || user.UserType != "Employer")
                {
                    RecordFailedAttempt(ipAddress);
                    return (false, "Email không hợp lệ", null, null);
                }

                if (user.IsDeleted)
                {
                    return (false, "Tài khoản này đã bị xóa", null, null);
                }

                // Check for account lockout before password validation
                if (await _userManager.IsLockedOutAsync(user))
                {
                    return (false, "Tài khoản đã bị khóa. Vui lòng thử lại sau", null, null);
                }

                var result = await _signInManager.PasswordSignInAsync(
                    user,
                    model.Password,
                    model.RememberMe,
                    lockoutOnFailure: true
                );

                if (result.Succeeded)
                {
                    // Remove from failed attempts if exists
                    _failedLoginAttempts.TryRemove(ipAddress, out _);

                    var token = await GenerateJwtToken(user);

                    // Update LastLogin asynchronously
                    _ = Task.Run(async () =>
                    {
                        using (var scope = _serviceScopeFactory.CreateScope())
                        {
                            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
                            var context = scope.ServiceProvider.GetRequiredService<JobListingWebDbContext>();

                            user.LastLogin = DateTime.Now;
                            await userManager.UpdateAsync(user);
                        }
                    });

                    return (true, "Đăng nhập thành công", user as EmployerUser, token);
                }

                if (result.IsLockedOut)
                {
                    return (false, "Tài khoản đã bị khóa. Vui lòng thử lại sau", null, null);
                }

                // Record failed attempt
                RecordFailedAttempt(ipAddress);
                return (false, "Email hoặc mật khẩu không chính xác", null, null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login process");
                return (false, "Có lỗi xảy ra trong quá trình đăng nhập", null, null);
            }
        }

        public async Task<string> GetUserRedirectUrl(ApplicationUser user)
        {
            return user.UserType switch
            {
                "Admin" => "/Admin/Dashboard",
                "Applicant" => "/",
                "Employer" => "/Employer/Dashboard",
                _ => "/"
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

        public async Task<(bool success, string message, AdminUser? user, string? token)> LoginAdminAsync(AdminLoginModel model, string ipAddress)
        {
            try
            {
                // Check if IP is blocked (similar to Employer method)
                if (IsIpBlocked(ipAddress))
                {
                    _logger.LogWarning($"Blocked login attempt from IP: {ipAddress}");
                    return (false, "Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút", null, null);
                }

                // Try to get cached user to reduce DB hits
                var cacheKey = $"user_{model.Email}";
                var user = await _cache.GetOrCreateAsync(cacheKey, async entry =>
                {
                    entry.SetAbsoluteExpiration(TimeSpan.FromMinutes(5));
                    return await _userManager.FindByEmailAsync(model.Email);
                });

                if (user == null || user.UserType != "Admin")
                {
                    RecordFailedAttempt(ipAddress);
                    return (false, "Email hoặc mật khẩu không hợp lệ", null, null);
                }

                if (user.IsDeleted)
                {
                    return (false, "Tài khoản này đã bị xóa", null, null);
                }

                // Check for account lockout before password validation
                if (await _userManager.IsLockedOutAsync(user))
                {
                    return (false, "Tài khoản đã bị khóa. Vui lòng thử lại sau", null, null);
                }

                var result = await _signInManager.PasswordSignInAsync(
                    user,
                    model.Password,
                    false,
                    lockoutOnFailure: true
                );

                if (result.Succeeded)
                {
                    // Remove from failed attempts if exists
                    _failedLoginAttempts.TryRemove(ipAddress, out _);

                    var token = await GenerateJwtToken(user);

                    // Update LastLogin asynchronously
                    _ = Task.Run(async () =>
                    {
                        using (var scope = _serviceScopeFactory.CreateScope())
                        {
                            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
                            var context = scope.ServiceProvider.GetRequiredService<JobListingWebDbContext>();

                            user.LastLogin = DateTime.Now;
                            await userManager.UpdateAsync(user);
                        }
                    });

                    return (true, "Đăng nhập thành công", user as AdminUser, token);
                }

                if (result.IsLockedOut)
                {
                    return (false, "Tài khoản đã bị khóa. Vui lòng thử lại sau", null, null);
                }

                // Record failed attempt
                RecordFailedAttempt(ipAddress);
                return (false, "Email hoặc mật khẩu không chính xác", null, null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login process");
                return (false, "Có lỗi xảy ra trong quá trình đăng nhập", null, null);
            }
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
            user.Email = model.Email;
            user.PhoneNumber = model.PhoneNumber;
            user.ModifiedDate = DateTime.Now;
            user.Gender = model.Gender;

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
        public async Task SendEmailVerificationCodeAsync(string userId, string newEmail)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                _logger.LogError(userId);
                throw new ApplicationException("User not found");
            }

            if (string.IsNullOrEmpty(newEmail) || !IsValidEmail(newEmail))
            {
                _logger.LogError(newEmail);
                throw new ApplicationException("Invalid email address");
            }

            var existingUser = await _userManager.FindByEmailAsync(newEmail);
            if (existingUser != null)
            {
                throw new ApplicationException("Email address is already in use");
            }

            var smtpSettings = _configuration.GetSection("EmailSettings");

            var verificationCode = GenerateVerificationCode();
            await StoreVerificationCodeAsync(userId, newEmail, verificationCode);

            var email = new MimeMessage();
            email.From.Add(new MailboxAddress(smtpSettings["FromName"], smtpSettings["FromEmail"]));
            email.To.Add(MailboxAddress.Parse(newEmail));
            email.Subject = "Email Verification Code";

            email.Body = new TextPart(TextFormat.Html)
            {
                Text = $@"
                <html>
                <body>
                    <h2>Email Verification</h2>
                    <p>Your verification code is:</p>
                    <h1 style='letter-spacing: 10px; color: #007bff;'>{verificationCode}</h1>
                    <p>This code will expire in 15 minutes.</p>
                </body>
                </html>"
            };

            using (var smtp = new SmtpClient())
            {
                await smtp.ConnectAsync(smtpSettings["SmtpHost"], int.Parse(smtpSettings["SmtpPort"]), MailKit.Security.SecureSocketOptions.StartTls);
                await smtp.AuthenticateAsync(smtpSettings["SmtpUsername"], smtpSettings["SmtpPassword"]);
                await smtp.SendAsync(email);
                await smtp.DisconnectAsync(true);   
            }
        }

        private bool IsValidEmail(string email)
        {
            try
            {
                var addr = new System.Net.Mail.MailAddress(email);
                return addr.Address == email;
            }
            catch
            {
                return false;
            }
        }

        private string GenerateVerificationCode()
        {
            // Generate a 6-digit numeric code
            var random = new Random();
            return random.Next(100000, 999999).ToString();
        }

        public async Task StoreVerificationCodeAsync(string userId, string newEmail, string verificationCode)
        {
            var cacheKey = $"email_verification_{userId}";
            var cacheEntry = new EmailVerificationCache
            {
                NewEmail = newEmail,
                VerificationCode = verificationCode
            };

            var options = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(15)
            };

            await _distributedCache.SetStringAsync(
                cacheKey,
                JsonSerializer.Serialize(cacheEntry),
                options
            );
        }

        public async Task<IdentityResult> ChangeEmailAsync(string userId, string newEmail, string inputCode)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                throw new ApplicationException("User not found");
            }

            // Retrieve and validate the verification code
            var cacheKey = $"email_verification_{userId}";
            var cachedEntryString = await _distributedCache.GetStringAsync(cacheKey);

            if (string.IsNullOrEmpty(cachedEntryString))
            {
                throw new ApplicationException("Verification code expired or not found");
            }

            // Deserialize using the concrete type
            var cachedEntry = JsonSerializer.Deserialize<EmailVerificationCache>(cachedEntryString);

            if (cachedEntry == null)
            {
                throw new ApplicationException("Invalid cache data format");
            }

            // Validate the new email matches the cached email
            if (cachedEntry.NewEmail != newEmail)
            {
                throw new ApplicationException($"Email mismatch. Expected: {cachedEntry.NewEmail}, Received: {newEmail}");
            }

            // Validate the verification code
            if (cachedEntry.VerificationCode != inputCode)
            {
                throw new ApplicationException("Invalid verification code");
            }

            // Remove the cache entry after successful verification
            await _distributedCache.RemoveAsync(cacheKey);

            // Change the email
            var token = await _userManager.GenerateChangeEmailTokenAsync(user, newEmail);
            var result = await _userManager.ChangeEmailAsync(user, newEmail, token);

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new ApplicationException($"Error changing email: {errors}");
            }

            return result;
        }
        public async Task SendPasswordVerificationCodeAsync(string userId, string currentPassword, string newPassword)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                _logger.LogError($"User not found: {userId}");
                throw new ApplicationException("User not found");
            }

            // Verify current password
            if (!await _userManager.CheckPasswordAsync(user, currentPassword))
            {
                throw new ApplicationException("Current password is incorrect");
            }

            // Validate new password
            var passwordValidator = new PasswordValidator<ApplicationUser>();
            var passwordResult = await passwordValidator.ValidateAsync(_userManager, user, newPassword);
            if (!passwordResult.Succeeded)
            {
                var errors = string.Join(", ", passwordResult.Errors.Select(e => e.Description));
                throw new ApplicationException($"Invalid new password: {errors}");
            }

            var verificationCode = GenerateVerificationCode();
            await StorePasswordVerificationCodeAsync(userId, newPassword, verificationCode);

            // Get user's email for verification
            var userEmail = await _userManager.GetEmailAsync(user);
            var smtpSettings = _configuration.GetSection("EmailSettings");

            var email = new MimeMessage();
            email.From.Add(new MailboxAddress(smtpSettings["FromName"], smtpSettings["FromEmail"]));
            email.To.Add(MailboxAddress.Parse(userEmail));
            email.Subject = "Password Change Verification Code";

            email.Body = new TextPart(TextFormat.Html)
            {
                Text = $@"
        <html>
        <body>
            <h2>Password Change Verification</h2>
            <p>You have requested to change your password. Use the following code to verify this change:</p>
            <h1 style='letter-spacing: 10px; color: #007bff;'>{verificationCode}</h1>
            <p>This code will expire in 15 minutes.</p>
            <p>If you did not request this change, please ignore this email and ensure your account is secure.</p>
        </body>
        </html>"
            };

            using (var smtp = new SmtpClient())
            {
                await smtp.ConnectAsync(smtpSettings["SmtpHost"], int.Parse(smtpSettings["SmtpPort"]), MailKit.Security.SecureSocketOptions.StartTls);
                await smtp.AuthenticateAsync(smtpSettings["SmtpUsername"], smtpSettings["SmtpPassword"]);
                await smtp.SendAsync(email);
                await smtp.DisconnectAsync(true);
            }
        }

        private async Task StorePasswordVerificationCodeAsync(string userId, string newPassword, string verificationCode)
        {
            var cacheKey = $"password_verification_{userId}";
            var cacheEntry = new PasswordVerificationCache
            {
                NewPassword = newPassword,
                VerificationCode = verificationCode,
                Timestamp = DateTime.UtcNow
            };

            var options = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(15)
            };

            await _distributedCache.SetStringAsync(
                cacheKey,
                JsonSerializer.Serialize(cacheEntry),
                options
            );
        }

        public async Task<IdentityResult> ChangePasswordAsync(string userId, string currentPassword, string newPassword, string verificationCode)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                throw new ApplicationException("User not found");
            }

            // Retrieve and validate the verification code
            var cacheKey = $"password_verification_{userId}";
            var cachedEntryString = await _distributedCache.GetStringAsync(cacheKey);

            if (string.IsNullOrEmpty(cachedEntryString))
            {
                throw new ApplicationException("Verification code expired or not found");
            }

            var cachedEntry = JsonSerializer.Deserialize<PasswordVerificationCache>(cachedEntryString);

            if (cachedEntry == null || cachedEntry.VerificationCode != verificationCode)
            {
                throw new ApplicationException("Invalid verification code");
            }

            if (cachedEntry.NewPassword != newPassword)
            {
                throw new ApplicationException("Password mismatch with verification request");
            }

            // Remove the cache entry after successful verification
            await _distributedCache.RemoveAsync(cacheKey);

            // Change the password
            var result = await _userManager.ChangePasswordAsync(user, currentPassword, newPassword);

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new ApplicationException($"Error changing password: {errors}");
            }

            // Log the password change
            _logger.LogInformation($"Password changed successfully for user {userId}");

            return result;
        }
    }
}
