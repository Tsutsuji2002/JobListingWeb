using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace JobListingWebAPI.Entities
{
    public class MappingCareer
    {
        [Key]
        public int MapID { get; set; }
        [ForeignKey("Career")]
        public int CareerID { get; set; }
        public Career Career { get; set; }
        [ForeignKey("JobListing")]
        public int JobID { get; set; }
        public JobListing JobListing { get; set; }

    }
}
