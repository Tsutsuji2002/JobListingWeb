using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobListingWebAPI.Entities
{
    public class Subscriber
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        [ForeignKey("Industry")]
        public int? PreferredIndustryId { get; set; }
        public Industry? PreferredIndustry { get; set; }
        [ForeignKey("Location")]
        public int? PreferredLocationId { get; set; }
        public Location? PreferredLocation { get; set; }
        [ForeignKey("JobLevel")]
        public int? PreferredJobLevelId { get; set; }
        public JobLevel? PreferredJobLevel { get; set; }

        public bool IsActive { get; set; } = true;
        public DateTime CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public DateTime? UnsubscribedDate { get; set; }
    }
}
