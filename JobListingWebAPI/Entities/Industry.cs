using System.ComponentModel.DataAnnotations;

namespace JobListingWebAPI.Entities
{
    public class Industry
    {
        [Key]
        public int IndustryID { get; set; }
        [Required, StringLength(100)]
        public string? Name { get; set; }
        [StringLength(500)]
        public string? Description { get; set; }
        public bool IsDeleted { get; set; } = false;
        public ICollection<MappingIndustry> MappingIndustries { get; set; }
        public ICollection<JobListing> JobListings { get; set; }


    }
}
