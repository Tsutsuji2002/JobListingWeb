using System.ComponentModel.DataAnnotations;

namespace JobListingWebAPI.Entities
{
    public class Career
    {
        [Key]
        public int CareerID { get; set; }
        [Required, StringLength(100)]
        public string? Name { get; set; }
        [StringLength(500)]
        public string? Description { get; set; }
        public bool IsDeleted { get; set; } = false;
        public ICollection<MappingCareer> MappingCareers { get; set; }

    }
}
