using System.ComponentModel.DataAnnotations;

namespace JobListingWebAPI.Models
{
    public class SubscriptionResponse
    {
        public int Id { get; set; }
        public string? Email { get; set; }
        public int? PreferredIndustryId { get; set; }
        public string? IndustryName { get; set; }
        public int? PreferredLocationId { get; set; }
        public string? LocationName { get; set; }
        public int? PreferredJobLevelId { get; set; }
        public string? JobLevelName { get; set; }
        public bool IsActive { get; set; }
    }
}
