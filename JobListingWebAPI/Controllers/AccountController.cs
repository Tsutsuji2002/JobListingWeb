using JobListingWebAPI.Entities;
using JobListingWebAPI.Models;
using JobListingWebAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace JobListingWebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AccountController> _logger;

        public AccountController(IAuthService authService, ILogger<AccountController> logger)
        {
            _authService = authService;
            _logger = logger;
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

            var result = await _authService.LoginApplicantAsync(model);
            if (result.success)
            {
                await _authService.UpdateLastLoginAsync(result.user.Id);
                return Ok(new
                {
                    message = result.message,
                    userId = result.user.Id,
                    userName = $"{result.user.FirstName} {result.user.LastName}",
                    email = result.user.Email,
                    roles = await _authService.GetUserRolesAsync(result.user.Id)
                });
            }

            return BadRequest(new { message = result.message });
        }

        [HttpPost("login/employer")]
        public async Task<IActionResult> LoginEmployer([FromBody] EmployerLoginModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _authService.LoginEmployerAsync(model);

            if (result.success)
            {
                return Ok(new
                {
                    message = result.message,
                    userId = result.user.Id,
                    userName = $"{result.user.FirstName} {result.user.LastName}",
                    email = result.user.Email,
                    companyName = result.user.CompanyName,
                    roles = await _authService.GetUserRolesAsync(result.user.Id),
                    token = result.token
                });
            }

            return BadRequest(new { message = result.message });
        }

        [HttpPost("login/admin")]
        public async Task<IActionResult> LoginAdmin([FromBody] AdminLoginModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _authService.LoginAdminAsync(model);
            if (result.success)
            {
                await _authService.UpdateLastLoginAsync(result.user.Id);
                return Ok(new
                {
                    message = result.message,
                    userId = result.user.Id,
                    userName = $"{result.user.FirstName} {result.user.LastName}",
                    email = result.user.Email,
                    adminLevel = result.user.AdminLevel,
                    roles = await _authService.GetUserRolesAsync(result.user.Id)
                });
            }

            return BadRequest(new { message = result.message });
        }

        [HttpPost("logout")]
        [Authorize]
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
                        email = applicant.Email,
                        roles = roles,
                        isLocked = isLocked,
                        lastLogin = applicant.LastLogin
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
                        createTime = employer.CreateTime
                    });
                case AdminUser admin:
                    return Ok(new
                    {
                        userId = admin.Id,
                        userName = $"{admin.FirstName} {admin.LastName}",
                        email = admin.Email,
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
                : BadRequest(new { message = result.message });
        }

        [HttpPost("password/change")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordModel model)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "Không được phép truy cập" });
            }

            if (!await _authService.ValidatePasswordStrength(model.NewPassword))
            {
                return BadRequest(new { message = "Mật khẩu mới không đủ mạnh" });
            }

            var result = await _authService.ChangePasswordAsync(userId, model.CurrentPassword, model.NewPassword);
            return result.success
                ? Ok(new { message = result.message })
                : BadRequest(new { message = result.message });
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
            var roles = await _authService.GetUserRolesAsync(userId);
            return Ok(new { roles = roles });
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
    }
}