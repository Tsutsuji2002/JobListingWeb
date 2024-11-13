using System.ComponentModel.DataAnnotations;

namespace JobListingWebAPI.Entities
{
    public class Navigation
    {
        [Key]
        public int NavID { get; set; }
        [Required, StringLength(100)]
        public string? Name { get; set; }
        [Required, StringLength(255)]
        public string? Link { get; set; }
        public ICollection<NavigationExtend> NavigationExtends { get; set; }

    }
}
