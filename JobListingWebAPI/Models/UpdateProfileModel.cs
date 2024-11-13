using System.ComponentModel.DataAnnotations;

namespace JobListingWebAPI.Models
{
    public class UpdateProfileModel
    {
        public string? FirstName { get; set; }

        public string? LastName { get; set; }

        public string? City { get; set; }
        public string? District { get; set; }

        public string? IdentificationCardNumber { get; set; }
        public string? CompanyName { get; set; }
    }
}
