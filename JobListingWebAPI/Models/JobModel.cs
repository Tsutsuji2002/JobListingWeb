using JobListingWebAPI.Entities;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace JobListingWebAPI.Models
{
    public class JobModel
    {
        [Required, StringLength(100)]
        public string? Title { get; set; }
        [Required, StringLength(10000)]
        public string? Description { get; set; }
        [StringLength(5000)]
        public string? Benefits { get; set; }
        [StringLength(100)]
        public string? Salary { get; set; }
        public int? NumberofRecruitment { get; set; }
        public DateTime ClosingDate { get; set; }

        public int CompanyID { get; set; }
        [StringLength(100)]
        public string? Education { get; set; }
        public int JobLevelID { get; set; }
        public int IndustryID { get; set; }

        [StringLength(10000)]
        public string? MinimumQualifications { get; set; }
        public int LocationID { get; set; }
        [StringLength(50)]
        public string? PreferredLanguage { get; set; }
        [StringLength(10000)]
        public string? JobDuties { get; set; }
        public bool IsUrgent { get; set; }
    }
}
