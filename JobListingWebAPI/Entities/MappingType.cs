using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace JobListingWebAPI.Entities
{
    public class MappingType
    {
        [Key]
        public int MapID { get; set; }
        [ForeignKey("Blog")]
        public int BlogID { get; set; }
        public Blog Blog { get; set; }
        [ForeignKey("BlogType")]
        public int BlogTypeID { get; set; }
        public BlogType BlogType { get; set; }
    }
}
