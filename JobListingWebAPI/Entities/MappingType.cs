using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace JobListingWebAPI.Entities
{
    public class MappingType
    {
        [Key]
        public int MapID { get; set; }
        [ForeignKey("Blog")]
        public int BlogID { get; set; }
        [JsonIgnore]
        public Blog Blog { get; set; }
        [ForeignKey("BlogType")]
        public int BlogTypeID { get; set; }
        //[JsonIgnore]
        public BlogType BlogType { get; set; }
    }
}
