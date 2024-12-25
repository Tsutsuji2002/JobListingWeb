using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace JobListingWebAPI.Entities
{
    public class MappingCareer
    {
        [Key]
        public int MapID { get; set; }
        [ForeignKey("Career")]
        public int CareerID { get; set; }
        [JsonIgnore]
        public Career Career { get; set; }
        [ForeignKey("JobListing")]
        public int JobID { get; set; }
        [JsonIgnore]
        public JobListing JobListing { get; set; }

    }
}
