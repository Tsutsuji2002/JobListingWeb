using System.ComponentModel.DataAnnotations;

namespace JobListingWebAPI.Models
{
    public class IndustryModel
    {
        [Required, StringLength(100)]
        public string? Name { get; set; }
        [StringLength(500)]
        public string? Description { get; set; }
    }
}
