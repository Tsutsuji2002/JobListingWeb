using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobListingWebAPI.Entities
{

    public class BlogTag
    {
        [Key]
        public int MapId { get; set; }
        [ForeignKey("Blog")]
        public int BlogID { get; set; }
        public Blog? Blog { get; set; }
        [ForeignKey("Tag")]
        public int TagID { get; set; }
        public Tag? Tag { get; set; }
    }
}
