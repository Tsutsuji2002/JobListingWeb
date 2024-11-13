using System.ComponentModel.DataAnnotations;

namespace JobListingWebAPI.Entities
{
    public class JobLevel
    {
        [Key]
        public int JobLevelID { get; set; }
        [Required, StringLength(100)]
        public string? Description { get; set; }
        public bool IsDeleted { get; set; } = false;
        public ICollection<JobListing> JobListings { get; set; }

    }
}
