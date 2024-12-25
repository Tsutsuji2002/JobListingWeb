using System.ComponentModel.DataAnnotations;

namespace JobListingWebAPI.Models
{
    public class SubscriptionRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        public int? PreferredIndustryId { get; set; }
        public int? PreferredLocationId { get; set; }
        public int? PreferredJobLevelId { get; set; }
    }
}
