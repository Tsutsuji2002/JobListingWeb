using JobListingWebAPI.Entities;
using System.ComponentModel.DataAnnotations;

namespace JobListingWebAPI.Models
{
    public class CompanyModel
    {
        [Required, StringLength(100)]
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Benefits { get; set; }
        public string? FoundedYear { get; set; }
        public string? Website { get; set; }
        public IFormFile? Logo { get; set; }
        public IFormFile? Background { get; set; }
        public string? UserId { get; set; }
        public bool? IsFeature {  get; set; }
    }
}
