using Microsoft.AspNetCore.Mvc.ModelBinding;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobListingWebAPI.Entities
{
    public class NavigationExtend
    {
        [Key]
        public int NavID { get; set; }
        [Required, StringLength(100)]
        public string Name { get; set; }
        [Required, StringLength(255)]
        public string Link { get; set; }
        [ForeignKey("Navigation")]
        public int ParentNavID { get; set; }
        public Navigation Navigations { get; set; }
    }
}
