using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace JobListingWebAPI.Entities
{
    public class Company
    {
        [Key]
        public int CompanyID { get; set; }
        [Required, StringLength(100)]
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Benefits { get; set; }
        public string? FoundedYear { get; set; }
        public string? Website { get; set; }
        [StringLength(100)]
        public string? Logo { get; set; }
        [StringLength(100)]
        public string? Background { get; set; }
        public DateTime? CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public bool IsDeleted { get; set; } = false;
        public bool IsFeature { get; set; } = false;

        public ICollection<JobListing> JobListings { get; set; }
        public ICollection<MappingLocation> MappingLocations { get; set; }
        public ICollection<MappingIndustry> MappingIndustries { get; set; }

        [ForeignKey("User")]
        public string? UserId { get; set; }
        public EmployerUser User { get; set; }
    }
}
