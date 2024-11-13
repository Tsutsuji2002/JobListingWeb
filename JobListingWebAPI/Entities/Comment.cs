using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace JobListingWebAPI.Entities
{
    public class Comment
    {
        [Key]
        public int CommentID { get; set; }
        [ForeignKey("Blog")]
        public int BlogID { get; set; }
        public required Blog Blog { get; set; }
        [Required]
        public string? Content { get; set; }
        public int? CommentLikes { get; set; }
        [DataType(DataType.DateTime)]
        public DateTime CreatedDate { get; set; }

        [ForeignKey("User")]
        public string? UserId { get; set; }
        public ApplicantUser User { get; set; }
    }
}
