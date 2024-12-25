using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace JobListingWebAPI.Entities
{
    public class MappingIndustry
    {
        [Key]
        public int MapID { get; set; }
        [ForeignKey("Company")]
        public int CompanyID { get; set; }
        [JsonIgnore]
        public Company Company { get; set; }
        [ForeignKey("Industry")]
        public int IndustryID { get; set; }
        //[JsonIgnore]
        public Industry Industry { get; set; }
    }
}
