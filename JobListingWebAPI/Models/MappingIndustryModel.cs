using JobListingWebAPI.Entities;
using System.Text.Json.Serialization;

namespace JobListingWebAPI.Models
{
    public class MappingIndustryModel
    {
        public int IndustryId { get; set; }
        public override string ToString()
        {
            return $"IndustryId: {IndustryId}";
        }
    }
}
