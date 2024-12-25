using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobListingWebAPI.Entities
{
    public class Blog
    {
        [Key]
        public int BlogID { get; set; }
        [Required, StringLength(100)]
        public string? Title { get; set; }
        [Required]
        public string? Content { get; set; }
        [DataType(DataType.Date)]
        public DateTime Publication { get; set; }
        public bool IsDeleted { get; set; } = false;
        public bool IsPublished { get; set; }
        public int Views { get; set; }

        public ICollection<Comment> Comments { get; set; }
        public ICollection<MappingType> MappingTypes { get; set; }
        public ICollection<BlogTag> BlogTags { get; set; }

        [ForeignKey("User")]
        public string? UserId { get; set; }
        public EmployerUser User { get; set; }
    }
}
