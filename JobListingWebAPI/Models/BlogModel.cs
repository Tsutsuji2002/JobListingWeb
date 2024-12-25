using System.ComponentModel.DataAnnotations;

namespace JobListingWebAPI.Models
{
    public class BlogCreateModel
    {
        [Required, StringLength(100)]
        public string? Title { get; set; }
        [Required]
        public string? Content { get; set; }
        public bool IsPublished { get; set; }
        public List<int> TagIds { get; set; } = new List<int>();
        public List<int> BlogTypeIds { get; set; } = new List<int>();
    }

    public class BlogUpdateModel
    {
        [Required, StringLength(100)]
        public string? Title { get; set; }
        [Required]
        public string? Content { get; set; }
        public bool IsPublished { get; set; }
        public List<int> TagIds { get; set; } = new List<int>();
        public List<int> BlogTypeIds { get; set; } = new List<int>();
    }

    public class BlogTypeModel
    {
        [Required, StringLength(100)]
        public string? Name { get; set; }
        public string? Description { get; set; }
    }

    public class TagModel
    {
        [Required, StringLength(50)]
        public string? Name { get; set; }
    }
}