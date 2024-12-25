using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace JobListingWebAPI.Entities
{
    public class MappingLocation
    {
        [Key]
        public int MapID { get; set; }
        [ForeignKey("Company")]
        public int CompanyID { get; set; }
        [JsonIgnore]
        public Company Company { get; set; }
        [ForeignKey("Location")]
        public int LocationID { get; set; }
        //[JsonIgnore]
        public Location Location { get; set; }

        public string? Address { get; set; } = null;
    }
}
