using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace JobListingWebAPI.Entities
{
    public class JobListing
    {
        [Key]
        public int JobID { get; set; }
        [Required, StringLength(100)]
        public string? Title { get; set; }
        [Required]
        public string? Description { get; set; }
        [StringLength(100)]
        public string? JobCategory { get; set; }
        [StringLength(100)]
        public string? Salary { get; set; }
        [ForeignKey("Company")]
        public int CompanyID { get; set; }
        public Company Company { get; set; }
        [DataType(DataType.Date)]
        public DateTime? UpdatedDate { get; set; }
        public DateTime PostedDate { get; set; }
        [DataType(DataType.Date)]
        public DateTime ClosingDate { get; set; }
        [StringLength(100)]
        public string? Education { get; set; }

        [ForeignKey("JobLevel")]
        public int JobLevelID { get; set; }
        public JobLevel JobLevel { get; set; }

        [ForeignKey("Industry")]
        public int IndustryID { get; set; }
        public Industry Industry { get; set; }

        [StringLength(100)]
        public string? MinimumQualifications { get; set; }
        public int LocationID { get; set; }
        [StringLength(50)]
        public string? PreferredLanguage { get; set; }
        public string? JobDuties { get; set; }
        public bool IsDeleted { get; set; } = false;
        [JsonIgnore]
        public ICollection<Application> Applications { get; set; }
        [JsonIgnore]
        public ICollection<MappingCareer> MappingCareers { get; set; }
    }
}
