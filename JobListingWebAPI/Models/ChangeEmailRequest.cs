namespace JobListingWebAPI.Models
{
    public class ChangeEmailRequest
    {
        public string? UserId { get; set; }
        public string? NewEmail { get; set; }
        public string? Code { get; set; }
    }
    public class SendEmailVerificationRequest
    {
        public string? UserId { get; set; }
        public string? NewEmail { get; set; }
    }
    public class EmailVerificationCache
    {
        public string? NewEmail { get; set; }
        public string? VerificationCode { get; set; }
    }
}
