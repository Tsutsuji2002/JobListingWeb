using JobListingWebAPI.Entities;
using JobListingWebAPI.Models;
using JobListingWebAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using System.Security.Claims;

namespace JobListingWebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AccountController> _logger;
        private readonly IMemoryCache _cache;
        private readonly IConfiguration _configuration;

        public AccountController(IAuthService authService, ILogger<AccountController> logger, IMemoryCache cache, IConfiguration configuration)
        {
            _authService = authService;
            _logger = logger;
            _cache = cache;
            _configuration = configuration;
        }

        [HttpGet("users/{userType}")]
        public async Task<IActionResult> GetAllUsersByType(string userType, [FromQuery] bool includeSoftDeleted = false)
        {
            var users = await _authService.GetAllUsersByTypeAsync(userType, includeSoftDeleted);
            return Ok(users);
        }

        [HttpDelete("soft-delete/{userId}")]
        public async Task<IActionResult> SoftDeleteUser(string userId)
        {
            var result = await _authService.SoftDeleteUserAsync(userId);
            if (result.Succeeded)
            {
                return Ok();
            }
            return BadRequest(result.Errors);
        }

        [HttpDelete("permanent-delete/{userId}")]
        public async Task<IActionResult> PermanentDeleteUser(string userId)
        {
            var result = await _authService.PermanentDeleteUserAsync(userId);
            if (result.Succeeded)
            {
                return Ok();
            }
            return BadRequest(result.Errors);
        }

        [HttpPut("restore/{userId}")]
        public async Task<IActionResult> RestoreSoftDeletedUser(string userId)
        {
            var result = await _authService.RestoreSoftDeletedUserAsync(userId);
            if (result.Succeeded)
            {
                return Ok();
            }
            return BadRequest(result.Errors);
        }

        /// <summary>
        /// Handles Google Sign-In
        /// </summary>
        [HttpPost("google-login")]
        [ProducesResponseType(typeof(AuthResponseModel), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> GoogleLoginAsync([FromBody] GoogleLoginRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.IdToken))
                {
                    return BadRequest(new ErrorResponse { Message = "ID Token is required" });
                }

                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
                var result = await _authService.HandleGoogleAuthAsync(request.IdToken);

                if (!result.success)
                {
                    _logger.LogWarning("Google login failed for IP: {IpAddress}, Message: {Message}",
                        ipAddress, result.message);
                    return BadRequest(new ErrorResponse { Message = result.message });
                }

                if (result.user == null || result.token == null)
                {
                    return BadRequest(new ErrorResponse { Message = "Authentication failed" });
                }

                // Get redirect URL based on user type
                var redirectUrl = await _authService.GetUserRedirectUrl(result.user);

                var response = new AuthResponseModel
                {
                    Success = true,
                    Message = result.message,
                    Token = result.token,
                    RedirectUrl = redirectUrl,
                    User = new UserViewModel
                    {
                        Id = result.user.Id,
                        Email = result.user.Email,
                        FirstName = result.user.FirstName,
                        LastName = result.user.LastName,
                        UserType = result.user.UserType
                    }
                };

                _logger.LogInformation("Successful Google login for user: {Email}", result.user.Email);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during Google login");
                return StatusCode(500, new ErrorResponse
                {
                    Message = "An error occurred during authentication"
                });
            }
        }

        /// <summary>
        /// Gets Google authentication configuration
        /// </summary>
        [HttpGet("google-config")]
        [ProducesResponseType(typeof(GoogleConfigResponse), StatusCodes.Status200OK)]
        public IActionResult GetGoogleConfig()
        {
            try
            {
                var clientId = _configuration["GoogleAuth:ClientId"];

                if (string.IsNullOrEmpty(clientId))
                {
                    _logger.LogError("Google ClientId is not configured");
                    return StatusCode(500, new ErrorResponse
                    {
                        Message = "Google authentication is not properly configured"
                    });
                }

                return Ok(new GoogleConfigResponse { ClientId = clientId });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving Google configuration");
                return StatusCode(500, new ErrorResponse
                {
                    Message = "Error retrieving Google configuration"
                });
            }
        }

        [HttpPost("register/applicant")]
        public async Task<IActionResult> RegisterApplicant([FromBody] ApplicantRegisterModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (await _authService.ValidatePasswordStrength(model.Password))
            {
                var result = await _authService.RegisterApplicantAsync(model);
                return result.success
                    ? Ok(new { message = result.message })
                    : BadRequest(new { message = result.message });
            }

            return BadRequest(new { message = "Mật khẩu không đủ mạnh. Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt." });
        }

        [HttpPost("register/employer")]
        public async Task<IActionResult> RegisterEmployer([FromBody] EmployerRegisterModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (await _authService.ValidatePasswordStrength(model.Password))
            {
                var result = await _authService.RegisterEmployerAsync(model);
                return result.success
                    ? Ok(new { message = result.message })
                    : BadRequest(new { message = result.message });
            }

            return BadRequest(new { message = "Mật khẩu không đủ mạnh. Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt." });
        }

        [HttpPost("login/applicant")]
        public async Task<IActionResult> LoginApplicant([FromBody] ApplicantLoginModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                // Get client IP address
                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString()
                    ?? "unknown";

                var result = await _authService.LoginApplicantAsync(model, ipAddress);
                if (result.success)
                {
                    var response = new
                    {
                        message = result.message,
                        userId = result.user.Id,
                        userName = $"{result.user.FirstName} {result.user.LastName}",
                        email = result.user.Email,
                        roles = await _authService.GetUserRolesAsync(result.user.Id),
                        token = result.token
                    };

                    // Log successful login
                    _logger.LogInformation($"Successful login for user {model.Email} from IP {ipAddress}");

                    return Ok(response);
                }

                // Log failed login attempt
                _logger.LogWarning($"Failed login attempt for user {model.Email} from IP {ipAddress}");
                return BadRequest(new { message = result.message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "System error during login process");
                return StatusCode(500, new { message = "Đã xảy ra lỗi hệ thống" });
            }
        }

        [HttpPost("login/employer")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
        public async Task<IActionResult> LoginEmployer([FromBody] EmployerLoginModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                // Get client IP address
                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString()
                    ?? "unknown";

                var result = await _authService.LoginEmployerAsync(model, ipAddress);
                if (result.success)
                {
                    var response = new
                    {
                        message = result.message,
                        userId = result.user.Id,
                        userName = $"{result.user.FirstName} {result.user.LastName}",
                        email = result.user.Email,
                        companyName = result.user.CompanyName,
                        roles = await _authService.GetUserRolesAsync(result.user.Id),
                        token = result.token
                    };

                    // Log successful login
                    _logger.LogInformation($"Successful login for user {model.Email} from IP {ipAddress}");

                    return Ok(response);
                }

                // Log failed login attempt
                _logger.LogWarning($"Failed login attempt for user {model.Email} from IP {ipAddress}");
                return BadRequest(new { message = result.message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "System error during login process");
                return StatusCode(500, new { message = "Đã xảy ra lỗi hệ thống" });
            }
        }

        [HttpPost("login/admin")]
        public async Task<IActionResult> LoginAdmin([FromBody] AdminLoginModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                // Get client IP address
                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString()
                    ?? "unknown";

                var result = await _authService.LoginAdminAsync(model, ipAddress);
                if (result.success)
                {
                    var response = new
                    {
                        message = result.message,
                        userId = result.user.Id,
                        fullName = $"{result.user.FirstName} {result.user.LastName}",
                        userName = result.user.UserName,
                        phoneNumber = result.user.PhoneNumber,
                        email = result.user.Email,
                        roles = await _authService.GetUserRolesAsync(result.user.Id),
                        token = result.token
                    };

                    // Log successful login
                    _logger.LogInformation($"Successful admin login for user {model.Email} from IP {ipAddress}");

                    return Ok(response);
                }

                // Log failed login attempt
                _logger.LogWarning($"Failed admin login attempt for user {model.Email} from IP {ipAddress}");
                return BadRequest(new { message = result.message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "System error during admin login process");
                return StatusCode(500, new { message = "Đã xảy ra lỗi hệ thống" });
            }
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await _authService.LogoutAsync();
            return Ok(new { message = "Đăng xuất thành công" });
        }

        [HttpGet("profile")]
        [Authorize]
        public async Task<IActionResult> GetProfile()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "Không được phép truy cập" });
            }

            var user = await _authService.GetUserProfileAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "Không tìm thấy người dùng" });
            }

            var roles = await _authService.GetUserRolesAsync(userId);
            var isLocked = await _authService.IsAccountLocked(userId);

            // Return user profile based on user type
            switch (user)
            {
                case ApplicantUser applicant:
                    return Ok(new
                    {
                        userId = applicant.Id,
                        userName = $"{applicant.FirstName} {applicant.LastName}",
                        firstName = applicant.FirstName,
                        lastName = applicant.LastName,
                        email = applicant.Email,
                        emailConfirmed = applicant.EmailConfirmed,
                        roles = roles,
                        phoneNumber = applicant.PhoneNumber,
                        phoneNumberConfirmed = applicant.PhoneNumberConfirmed,
                        city = applicant.City,
                        district = applicant.District,
                        gender = applicant.Gender,
                        isLocked = isLocked,
                        lastLogin = applicant.LastLogin,
                        createTime = applicant.CreateTime,
                        isPasswordNull = applicant.PasswordHash == null ? true : false
                    });
                case EmployerUser employer:
                    return Ok(new
                    {
                        userId = employer.Id,
                        firstName = employer.FirstName,
                        lastName = employer.LastName,
                        email = employer.Email,
                        emailConfirmed = employer.EmailConfirmed,
                        companyName = employer.CompanyName,
                        identificationCardNumber = employer.IdentificationCardNumber,
                        phoneNumber = employer.PhoneNumber,
                        phoneNumberConfirmed = employer.PhoneNumberConfirmed,
                        city = employer.City,
                        district = employer.District,
                        gender = employer.Gender,
                        roles = roles,
                        isLocked = isLocked,
                        lastLogin = employer.LastLogin,
                        createTime = employer.CreateTime,
                        isPasswordNull = employer.PasswordHash == null ? true : false
                    });
                case AdminUser admin:
                    return Ok(new
                    {
                        userId = admin.Id,
                        firstName = admin.FirstName,
                        lastName = admin.LastName,
                        userName = admin.UserName,
                        email = admin.Email,
                        phoneNumber = admin.PhoneNumber,
                        adminLevel = admin.AdminLevel,
                        roles = roles,
                        isLocked = isLocked,
                        lastLogin = admin.LastLogin
                    });
                default:
                    return BadRequest(new { message = "Loại người dùng không hợp lệ" });
            }
        }

        [HttpPut("profile")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileModel model)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "Không được phép truy cập" });
            }

            var result = await _authService.UpdateUserProfileAsync(userId, model);
            return result.success
                ? Ok(new { message = result.message })
                : BadRequest(new { message = userId });
        }

        [HttpPost("password/reset")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordModel model)
        {
            if (!await _authService.ValidatePasswordStrength(model.NewPassword))
            {
                return BadRequest(new { message = "Mật khẩu mới không đủ mạnh" });
            }

            var result = await _authService.ResetPasswordAsync(model.Email, model.Token, model.NewPassword);
            return result.success
                ? Ok(new { message = result.message })
                : BadRequest(new { message = result.message });
        }

        [HttpPost("password/forgot")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordModel model)
        {
            var result = await _authService.ForgotPasswordAsync(model.Email);
            return result.success
                ? Ok(new { message = result.message })
                : BadRequest(new { message = result.message });
        }

        // New endpoints
        [HttpPost("email/update")]
        [Authorize]
        public async Task<IActionResult> UpdateEmail([FromBody] UpdateEmailModel model)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "Không được phép truy cập" });
            }

            var result = await _authService.UpdateEmailAsync(userId, model.NewEmail);
            return result.success
                ? Ok(new { message = result.message })
                : BadRequest(new { message = result.message });
        }

        [HttpPost("account/deactivate")]
        [Authorize]
        public async Task<IActionResult> DeactivateAccount()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "Không được phép truy cập" });
            }

            var result = await _authService.DeactivateAccountAsync(userId);
            return result.success
                ? Ok(new { message = result.message })
                : BadRequest(new { message = result.message });
        }

        [HttpPost("account/reactivate")]
        [Authorize]
        public async Task<IActionResult> ReactivateAccount([FromBody] string userId)
        {
            // Only admins should be able to reactivate accounts
            if (!User.IsInRole("Admin"))
            {
                return Forbid();
            }

            var result = await _authService.ReactivateAccountAsync(userId);
            return result.success
                ? Ok(new { message = result.message })
                : BadRequest(new { message = result.message });
        }

        [HttpGet("roles")]
        [Authorize]
        public async Task<IActionResult> GetUserRoles(string userId)
        {
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest(new { message = "User ID is required." });
            }

            try
            {
                var roles = await _authService.GetUserRolesAsync(userId);

                if (roles == null || !roles.Any())
                {
                    return NotFound(new { message = "No roles found for the specified user." });
                }

                return Ok(new { userId, roles });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving roles for user {userId}");
                return StatusCode(500, new { message = "An error occurred while retrieving user roles." });
            }
        }

        [HttpPost("roles/add")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AddUserToRole([FromBody] UserRoleModel model)
        {
            var result = await _authService.AddToRoleAsync(model.UserId, model.RoleName);
            return result.success
                ? Ok(new { message = result.message })
                : BadRequest(new { message = result.message });
        }

        [HttpPost("roles/remove")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RemoveUserFromRole([FromBody] UserRoleModel model)
        {
            var result = await _authService.RemoveFromRoleAsync(model.UserId, model.RoleName);
            return result.success
                ? Ok(new { message = result.message })
                : BadRequest(new { message = result.message });
        }

        [HttpPost("send-email-verification")]
        [Authorize]
        public async Task<IActionResult> SendEmailVerification([FromBody] SendEmailVerificationRequest request)
        {
            await _authService.SendEmailVerificationCodeAsync(request.UserId, request.NewEmail);
            return Ok();
        }

        [HttpPost("change-email")]
        [Authorize]
        public async Task<IActionResult> ChangeEmail([FromBody] ChangeEmailRequest request)
        {
            try
            {
                var result = await _authService.ChangeEmailAsync(
                    request.UserId,
                    request.NewEmail,
                    request.Code
                );

                if (!result.Succeeded)
                {
                    return BadRequest(new { errors = result.Errors });
                }

                return Ok(new { message = "Email changed successfully" });
            }
            catch (ApplicationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
        [HttpPost("send-password-verification")]
        [Authorize]
        public async Task<IActionResult> SendPasswordVerification([FromBody] SendPasswordVerificationRequest request)
        {
            try
            {
                await _authService.SendPasswordVerificationCodeAsync(
                    request.UserId,
                    request.CurrentPassword,
                    request.NewPassword
                );
                return Ok(new { message = "Verification code sent successfully" });
            }
            catch (ApplicationException ex)
            {
                _logger.LogError($"Error sending password verification code: {ex.Message}");
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            try
            {
                var result = await _authService.ChangePasswordAsync(
                    request.UserId,
                    request.CurrentPassword,
                    request.NewPassword,
                    request.VerificationCode
                );

                if (!result.Succeeded)
                {
                    return BadRequest(new { errors = result.Errors });
                }

                return Ok(new { message = "Password changed successfully" });
            }
            catch (ApplicationException ex)
            {
                _logger.LogError($"Error changing password: {ex.Message}");
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}