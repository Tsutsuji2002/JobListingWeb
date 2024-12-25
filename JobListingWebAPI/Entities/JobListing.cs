using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using System.ComponentModel;

namespace JobListingWebAPI.Entities
{
    public class JobListing
    {
        [Key]
        public int JobID { get; set; }
        [Required, StringLength(100)]
        public string? Title { get; set; }
        [Required]
        [StringLength(10000)]
        public string? Description { get; set; }
        [StringLength(100)]
        public string? Salary { get; set; }
        public int? NumberofRecruitment { get; set; }

        [ForeignKey("Company")]
        public int CompanyID { get; set; }
        public Company Company { get; set; }
        [StringLength(100)]

        [ForeignKey("JobLevel")]
        public int JobLevelID { get; set; }
        public JobLevel JobLevel { get; set; }

        [ForeignKey("Industry")]
        public int IndustryID { get; set; }
        public Industry Industry { get; set; }
        [ForeignKey("Location")]
        public int LocationID { get; set; }
        public Location Location { get; set; }

        [StringLength(10000)]
        public string? MinimumQualifications { get; set; }
        [StringLength(100)]
        public string? Education { get; set; }
        [StringLength(5000)]
        public string? Benefits { get; set; }
        [StringLength(50)]
        public string? PreferredLanguage { get; set; }
        [StringLength(10000)]
        public string? JobDuties { get; set; }
        [DataType(DataType.Date)]
        public DateTime? UpdatedDate { get; set; }
        public DateTime PostedDate { get; set; }
        [DataType(DataType.Date)]
        public DateTime ClosingDate { get; set; }
        [DefaultValue(1)]
        public int Status { get; set; }  //0: Hết hạn; 1: Hoạt động; 2: Tạm dừng; 3: Chờ duyệt;
        public bool IsUrgent { get; set; } = false;
        public bool IsDeleted { get; set; } = false;
        public bool IsFeatured { get; set; } = false;

        //[JsonIgnore]
        public ICollection<Application> Applications { get; set; }
        [JsonIgnore]
        public ICollection<MappingCareer> MappingCareers { get; set; }
        public ICollection<FavoriteJob> FavoriteJobs { get; set; }
    }
}
