using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace JobListingWebAPI.Entities
{
    public class CV
    {
        [Key]
        public int CVID { get; set; }
        public string? FileName { get; set; }
        public string? FileUrl { get; set; }
        public string? ContentType { get; set; }
        public DateTime UploadDate { get; set; }
        public bool IsDeleted { get; set; } = false;
        [ForeignKey("User")]
        public string? UserId { get; set; }
        public ApplicantUser User { get; set; }
        public ICollection<Application> Applications { get; set; }

    }
}
