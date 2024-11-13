using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace JobListingWebAPI.Entities
{
    public class MappingIndustry
    {
        [Key]
        public int MapID { get; set; }
        [ForeignKey("Company")]
        public int CompanyID { get; set; }
        public Company Company { get; set; }
        [ForeignKey("Industry")]
        public int IndustryID { get; set; }
        public Industry Industry { get; set; }
    }
}
