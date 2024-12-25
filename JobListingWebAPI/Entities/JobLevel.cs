using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace JobListingWebAPI.Entities
{
    public class JobLevel
    {
        [Key]
        public int JobLevelID { get; set; }
        [Required, StringLength(100)]
        public string? Description { get; set; }
        public bool IsDeleted { get; set; } = false;
        [JsonIgnore]
        public ICollection<JobListing> JobListings { get; set; }
        public ICollection<Subscriber> Subscribers { get; set; } = new List<Subscriber>();


    }
}
