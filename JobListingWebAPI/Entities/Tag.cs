using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobListingWebAPI.Entities
{
    public class Tag
    {
        [Key]
        public int TagID { get; set; }
        public string? TagName { get; set; }
        public ICollection<BlogTag>? BlogTags { get; set; }
    }
}
