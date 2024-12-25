using JobListingWebAPI.Models;
using Microsoft.Extensions.Options;
using MailKit.Net.Smtp;
using MimeKit;
using MimeKit.Text;

namespace JobListingWebAPI.Services
{
    public class EmailService : IEmailService
    {
        private readonly ILogger<EmailService> _logger;
        private readonly EmailSettings _settings;

        public EmailService(
            IOptions<EmailSettings> settings,
            ILogger<EmailService> logger)
        {
            _settings = settings.Value;
            _logger = logger;
        }

        public async Task SendEmailAsync(string to, string subject, string body)
        {
            try
            {
                var email = new MimeMessage();
                email.From.Add(new MailboxAddress(_settings.FromName, _settings.FromEmail));
                email.To.Add(MailboxAddress.Parse(to));
                email.Subject = subject;
                email.Body = new TextPart(TextFormat.Html)
                {
                    Text = WrapInTemplate(body)
                };

                using (var smtp = new SmtpClient())
                {
                    await smtp.ConnectAsync(_settings.SmtpHost, _settings.SmtpPort, MailKit.Security.SecureSocketOptions.StartTls);
                    await smtp.AuthenticateAsync(_settings.SmtpUsername, _settings.SmtpPassword);
                    await smtp.SendAsync(email);
                    await smtp.DisconnectAsync(true);
                }

                _logger.LogInformation("Email sent successfully to {email}", to);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {email}", to);
                throw;
            }
        }

        public async Task SendTemplatedEmailAsync(string to, string templateName, object model)
        {
            var template = GetEmailTemplate(templateName);
            var body = PopulateTemplate(template, model);
            await SendEmailAsync(to, GetSubjectForTemplate(templateName), body);
        }

        // The existing methods WrapInTemplate, GetEmailTemplate, GetSubjectForTemplate, and PopulateTemplate
        // can remain the same as in the previous implementation

        private string WrapInTemplate(string content)
        {
            // Same implementation as before
            return $@"
            <html>
                <head>
                    <style>
                        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                        .header {{ background-color: #f8f9fa; padding: 20px; text-align: center; }}
                        .content {{ padding: 20px; }}
                        .footer {{ text-align: center; padding: 20px; font-size: 12px; color: #666; }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h2>Dịch vụ Danh sách Việc làm</h2>
                        </div>
                        <div class='content'>
                            {content}
                        </div>
                        <div class='footer'>
                            <p>Bạn nhận được email này vì đã đăng ký nhận thông báo việc làm.</p>
                            <p>Để hủy đăng ký, nhấp vào <a href='{_settings.UnsubscribeUrl}'>đây</a></p>
                        </div>
                    </div>
                </body>
            </html>";
        }

        private string GetEmailTemplate(string templateName)
        {
            return templateName switch
            {
                "Welcome" => @"
                    <h1>Chào mừng đến với Danh sách Việc làm!</h1>
                    <p>Kính gửi {UserName},</p>
                    <p>Cảm ơn bạn đã đăng ký dịch vụ thông báo việc làm của chúng tôi. Bạn sẽ nhận được các cập nhật hàng ngày về các việc làm mới phù hợp với sở thích của bạn.</p>
                    <p>Sở thích của bạn:</p>
                    <ul>
                        <li>Ngành: {Industry}</li>
                        <li>Địa điểm: {Location}</li>
                        <li>Cấp bậc công việc: {JobLevel}</li>
                        <li>Mức lương tối thiểu: {MinimumSalary}</li>
                    </ul>
                    <p>Bạn có thể cập nhật sở thích của mình bất cứ lúc nào bằng cách truy cập hồ sơ của bạn.</p>",

                "UnsubscribeConfirmation" => @"
                    <h1>Xác nhận Hủy đăng ký</h1>
                    <p>Kính gửi {UserName},</p>
                    <p>Bạn đã hủy đăng ký thành công khỏi thông báo việc làm.</p>
                    <p>Chúng tôi rất tiếc khi bạn rời đi! Nếu bạn đổi ý, bạn luôn có thể đăng ký lại.</p>",

                "PreferencesUpdated" => @"
                    <h1>Sở thích đã được Cập nhật</h1>
                    <p>Kính gửi {UserName},</p>
                    <p>Sở thích thông báo việc làm của bạn đã được cập nhật thành công.</p>
                    <p>Sở thích mới:</p>
                    <ul>
                        <li>Ngành: {Industry}</li>
                        <li>Địa điểm: {Location}</li>
                        <li>Cấp bậc công việc: {JobLevel}</li>
                        <li>Mức lương tối thiểu: {MinimumSalary}</li>
                    </ul>",

                "DailyJobsDigest" => @"
                    <h1>Các Việc làm Khớp với Bạn Hôm nay</h1>
                    <p>Kính gửi {UserName},</p>
                    <p>Đây là danh sách việc làm hôm nay phù hợp với sở thích của bạn:</p>
                    {JobListings}",

                "NoJobMatches" => @"
                    <h1>Cập nhật Tìm kiếm Việc làm Hàng ngày</h1>
                    <p>Kính gửi {UserName},</p>
                    <p>Chúng tôi đã tìm kiếm việc làm phù hợp với sở thích của bạn hôm nay nhưng không tìm thấy kết quả nào mới.</p>
                    <p>Sở thích hiện tại của bạn:</p>
                    <ul>
                        <li>Ngành: {Industry}</li>
                        <li>Địa điểm: {Location}</li>
                        <li>Cấp bậc công việc: {JobLevel}</li>
                    </ul>
                    <p>Mẹo để nhận được nhiều kết quả hơn:</p>
                    <ul>
                        <li>Xem xét mở rộng sở thích ngành nghề</li>
                        <li>Thử mở rộng sở thích địa điểm</li>
                        <li>Điều chỉnh yêu cầu cấp bậc công việc</li>
                    </ul>
                    <p>Chúng tôi sẽ tiếp tục tìm kiếm và thông báo cho bạn ngay khi tìm thấy việc làm phù hợp!</p>",

                _ => throw new ArgumentException($"Email template '{templateName}' not found.")
            };
        }

        private string GetSubjectForTemplate(string templateName)
        {
            return templateName switch
            {
                "Welcome" => "Chào mừng đến với Danh sách Việc làm!",
                "UnsubscribeConfirmation" => "Xác nhận Hủy đăng ký",
                "PreferencesUpdated" => "Sở thích của Bạn đã được Cập nhật",
                "DailyJobsDigest" => $"Việc làm Khớp - {DateTime.Today:dd/MM/yyyy}",
                "NoJobMatches" => $"Cập nhật Tìm kiếm Việc làm - Không có Kết quả Mới Hôm nay",
                _ => throw new ArgumentException($"Subject for template '{templateName}' not found.")
            };
        }

        private string PopulateTemplate(string template, object model)
        {
            var type = model.GetType();
            var properties = type.GetProperties();

            foreach (var prop in properties)
            {
                var value = prop.GetValue(model)?.ToString() ?? "";
                template = template.Replace($"{{{prop.Name}}}", value);
            }

            return template;
        }
    }
}
