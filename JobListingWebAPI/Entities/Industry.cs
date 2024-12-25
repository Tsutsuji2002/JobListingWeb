using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

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
        //[JsonIgnore]
        public ICollection<MappingIndustry> MappingIndustries { get; set; }
        //[JsonIgnore]
        public ICollection<JobListing> JobListings { get; set; }
        public ICollection<Subscriber> Subscribers { get; set; } = new List<Subscriber>();

    }
}
