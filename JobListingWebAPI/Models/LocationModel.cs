using JobListingWebAPI.Entities;
using System.ComponentModel.DataAnnotations;

namespace JobListingWebAPI.Models
{
    public class LocationModel
    {
        [Required, StringLength(100)]
        public string? Name { get; set; }
        [StringLength(50)]
        public string? State { get; set; }
        [StringLength(50)]
        public string? Country { get; set; }
        [StringLength(20)]
        public string? PostalCode { get; set; }
    }
}
