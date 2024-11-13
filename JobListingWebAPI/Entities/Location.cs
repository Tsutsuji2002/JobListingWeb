using System.ComponentModel.DataAnnotations;

namespace JobListingWebAPI.Entities
{
    public class Location
    {
        [Key]
        public int LocationID { get; set; }
        [Required, StringLength(100)]
        public string? Name { get; set; }
        [StringLength(50)]
        public string? State { get; set; }
        [StringLength(50)]
        public string? Country { get; set; }
        [StringLength(20)]
        public string? PostalCode { get; set; }
        public bool IsDeleted { get; set; } = false;
        public ICollection<MappingLocation> MappingLocations { get; set; }

    }
}
