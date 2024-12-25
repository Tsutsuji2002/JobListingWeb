namespace JobListingWebAPI.Models
{
    public class ApplicationSubmissionModel
    {
        public int JobID { get; set; }
        public int? CVID { get; set; }
        public string? CoverLetter { get; set; }
        public string? UserId { get; set; }
        public string? Status { get; set; }
    }
}
