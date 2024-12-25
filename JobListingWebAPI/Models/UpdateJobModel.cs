using System.ComponentModel.DataAnnotations;

namespace JobListingWebAPI.Models
{
    public class UpdateJobModel
    {
        [Required, StringLength(100)]
        public string? Title { get; set; }
        [Required]
        public string? Description { get; set; }
        [StringLength(5000)]
        public string? Benefits { get; set; }
        [StringLength(100)]
        public string? Salary { get; set; }
        public int? NumberofRecruitment { get; set; }
        [Required]
        public int JobLevelID { get; set; }
        [Required]
        public int IndustryID { get; set; }
        [StringLength(10000)]
        public string? MinimumQualifications { get; set; }
        public int LocationID { get; set; }
        [StringLength(50)]
        public string? PreferredLanguage { get; set; }
        public string? JobDuties { get; set; }
        [Required]
        [DataType(DataType.Date)]
        public DateTime ClosingDate { get; set; }
        [StringLength(100)]
        public string? Education { get; set; }
        public bool IsUrgent { get; set; }
    }
}
