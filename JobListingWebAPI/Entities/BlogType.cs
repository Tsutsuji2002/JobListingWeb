using System.ComponentModel.DataAnnotations;

namespace JobListingWebAPI.Entities
{
    public class BlogType
    {
        [Key]
        public int BlogTypeID { get; set; }
        [Required, StringLength(100)]
        public string? Name { get; set; }
        public bool IsDeleted { get; set; } = false;
        public ICollection<MappingType> MappingTypes { get; set; }

    }
}
