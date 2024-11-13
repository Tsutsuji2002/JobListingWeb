using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace JobListingWebAPI.Entities
{
    public class MappingLocation
    {
        [Key]
        public int MapID { get; set; }
        [ForeignKey("Company")]
        public int CompanyID { get; set; }
        public Company Company { get; set; }
        [ForeignKey("Location")]
        public int LocationID { get; set; }
        public Location Location { get; set; }

        public string? Address { get; set; } = null;
    }
}
