using Google;
using JobListingWebAPI.Entities;
using JobListingWebAPI.Models;
using JobListingWebAPI.Data;
using JobListingWebAPI.Services;
using Microsoft.EntityFrameworkCore;
using JobListingWebAPI.Exceptions;

namespace JobListingWebAPI.Services
{
    public class SubscriptionService : ISubscriptionService
    {
        private readonly JobListingWebDbContext _context;
        private readonly IEmailService _emailService;
        private readonly ILogger<SubscriptionService> _logger;

        public SubscriptionService(
            JobListingWebDbContext context,
            IEmailService emailService,
            ILogger<SubscriptionService> logger)
        {
            _context = context;
            _emailService = emailService;
            _logger = logger;
        }

        public async Task<IEnumerable<SubscriptionResponse>> GetSubscriptionsAsync(string email)
        {
            if (string.IsNullOrEmpty(email))
                throw new ArgumentNullException(nameof(email));

            return await _context.Subscribers
                .Include(s => s.PreferredIndustry)
                .Include(s => s.PreferredLocation)
                .Include(s => s.PreferredJobLevel)
                .Where(s => s.Email == email && s.IsActive)
                .Select(s => new SubscriptionResponse
                {
                    Id = s.Id,
                    Email = s.Email,
                    PreferredIndustryId = s.PreferredIndustryId,
                    IndustryName = s.PreferredIndustry.Name,
                    PreferredLocationId = s.PreferredLocationId,
                    LocationName = s.PreferredLocation.Name,
                    PreferredJobLevelId = s.PreferredJobLevelId,
                    JobLevelName = s.PreferredJobLevel.Description,
                    IsActive = s.IsActive
                })
                .ToListAsync();
        }

        public async Task SubscribeAsync(SubscriptionRequest request)
        {
            // Check if a subscription with exact same preferences already exists
            var existingSubscription = await _context.Subscribers
                .FirstOrDefaultAsync(s =>
                    s.Email == request.Email &&
                    s.IsActive &&
                    s.PreferredIndustryId == request.PreferredIndustryId &&
                    s.PreferredLocationId == request.PreferredLocationId &&
                    s.PreferredJobLevelId == request.PreferredJobLevelId);

            if (existingSubscription != null)
            {
                _logger.LogInformation("Subscription with identical preferences already exists for email: {email}", request.Email);
                return; // Skip creating duplicate subscription
            }

            var subscriber = new Subscriber
            {
                Email = request.Email,
                PreferredIndustryId = request.PreferredIndustryId,
                PreferredLocationId = request.PreferredLocationId,
                PreferredJobLevelId = request.PreferredJobLevelId,
                IsActive = true,
                CreatedDate = DateTime.UtcNow
            };

            _context.Subscribers.Add(subscriber);
            await _context.SaveChangesAsync();

            // Check if this is the first subscription for this email
            var isFirstSubscription = await _context.Subscribers
                .Where(s => s.Email == request.Email && s.IsActive)
                .CountAsync() == 1;

            if (isFirstSubscription)
            {
                await SendWelcomeEmailAsync(request.Email);
            }
            else
            {
                await SendAdditionalSubscriptionEmailAsync(request.Email);
            }
        }

        public async Task UpdatePreferencesAsync(SubscriptionRequest request)
        {
            var subscriber = await _context.Subscribers
                .FirstOrDefaultAsync(s => s.Email == request.Email && s.IsActive);

            if (subscriber == null)
                throw new SubscriptionNotFoundException();

            subscriber.PreferredIndustryId = request.PreferredIndustryId;
            subscriber.PreferredLocationId = request.PreferredLocationId;
            subscriber.PreferredJobLevelId = request.PreferredJobLevelId;
            subscriber.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            await SendPreferencesUpdatedEmailAsync(request.Email);
        }

        public async Task DeleteSubscriptionAsync(int id)
        {
            var subscription = await _context.Subscribers
                .FirstOrDefaultAsync(s => s.Id == id);

            if (subscription == null)
                throw new SubscriptionNotFoundException();

            var email = subscription.Email;

            _context.Subscribers.Remove(subscription);
            await _context.SaveChangesAsync();
            await SendDeletionConfirmationEmailAsync(email);
        }

        public async Task UnsubscribeAsync(string email)
        {
            var subscriber = await _context.Subscribers
                .FirstOrDefaultAsync(s => s.Email == email);

            if (subscriber == null || !subscriber.IsActive)
                throw new SubscriptionNotFoundException();

            subscriber.IsActive = false;
            subscriber.UnsubscribedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            await SendUnsubscribeConfirmationAsync(email);
        }

        private Task SendWelcomeEmailAsync(string email) =>
            _emailService.SendEmailAsync(
                email,
                "Chào mừng bạn đến với thông báo việc làm!",
                "Cảm ơn bạn đã đăng ký nhận thông báo việc làm. Bạn sẽ nhận được cập nhật hàng ngày về các công việc phù hợp với sở thích của bạn."
            );

        private Task SendWelcomeBackEmailAsync(string email) =>
            _emailService.SendEmailAsync(
                email,
                "Chào mừng bạn trở lại!",
                "Đăng ký nhận thông báo việc làm của bạn đã được kích hoạt lại. Bạn sẽ bắt đầu nhận được cập nhật hàng ngày."
            );

        private Task SendUnsubscribeConfirmationAsync(string email) =>
            _emailService.SendEmailAsync(
                email,
                "Xác nhận hủy đăng ký",
                "Bạn đã hủy đăng ký nhận thông báo việc làm thành công. Chúng tôi rất tiếc khi thấy bạn ra đi!"
            );

        private Task SendPreferencesUpdatedEmailAsync(string email) =>
            _emailService.SendEmailAsync(
                email,
                "Cập nhật tùy chọn thành công",
                "Tùy chọn nhận thông báo việc làm của bạn đã được cập nhật thành công."
            );

        private Task SendDeletionConfirmationEmailAsync(string email) =>
            _emailService.SendEmailAsync(
                email,
                "Xóa đăng ký thành công",
                "Đăng ký nhận thông báo việc làm của bạn đã được xóa thành công."
            );
        private Task SendAdditionalSubscriptionEmailAsync(string email) =>
        _emailService.SendEmailAsync(
            email,
            "Đăng ký thêm thông báo việc làm mới",
            "Bạn đã đăng ký thêm một thông báo việc làm mới. Bạn sẽ nhận được thông báo cho các tiêu chí tìm kiếm mới này."
        );
    }
}
