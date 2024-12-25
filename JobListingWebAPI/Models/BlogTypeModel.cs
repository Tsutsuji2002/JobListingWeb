using System.ComponentModel.DataAnnotations;

namespace JobListingWebAPI.Models
{
    public class BlogTypeCreateModel
    {
        [Required, StringLength(100)]
        public string? Name { get; set; }
    }

    public class BlogTypeUpdateModel
    {
        [Required, StringLength(100)]
        public string? Name { get; set; }
    }
}
