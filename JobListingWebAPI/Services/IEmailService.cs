namespace JobListingWebAPI.Services
{
    public interface IEmailService
    {
        Task SendEmailAsync(string to, string subject, string body);
        Task SendTemplatedEmailAsync(string to, string templateName, object model);
    }
}
