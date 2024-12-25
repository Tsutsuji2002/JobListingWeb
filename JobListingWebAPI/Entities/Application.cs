using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace JobListingWebAPI.Entities
{
    public class Application
    {
        [Key]
        public int ApplicationID { get; set; }
        [ForeignKey("JobListing")]
        public int JobID { get; set; }
        public JobListing JobListing { get; set; }

        [DataType(DataType.DateTime)]
        public DateTime ApplicationDate { get; set; }
        public string? Status { get; set; }

        [ForeignKey("User")]
        public string? UserId { get; set; }
        public ApplicantUser User { get; set; }
        public string? CoverLeter { get; set; }
        [ForeignKey("CV")]
        public int? CVID { get; set; }
        public CV CV { get; set; }
    }
}
