using JobListingWebAPI.Entities;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace JobListingWebAPI.Models
{
    public class MappingLocationModel
    {
        public int LocationId { get; set; }
        public string? Address { get; set; }
        public override string ToString()
        {
            return $"LocationId: {LocationId}, Address: {Address}";
        }
    }
}
