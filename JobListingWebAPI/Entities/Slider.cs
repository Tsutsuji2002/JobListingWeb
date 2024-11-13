using System.ComponentModel.DataAnnotations;

namespace JobListingWebAPI.Entities
{
    public class Slider
    {
        [Key]
        public int SliderID { get; set; }
        [Required, StringLength(100)]
        public string? Name { get; set; }
        [Required, StringLength(100)]
        public string? Title { get; set; }
        [StringLength(500)]
        public string? Description { get; set; }
        [Required, StringLength(255)]
        public string? Link { get; set; }
        [DataType(DataType.DateTime)]
        public DateTime CreatedDate { get; set; }
    }
}
