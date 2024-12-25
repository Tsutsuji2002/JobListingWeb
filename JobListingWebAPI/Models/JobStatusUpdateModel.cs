using System.ComponentModel.DataAnnotations;

namespace JobListingWebAPI.Models
{
    public class JobStatusUpdateModel
    {
        [Required]
        [Range(0, int.MaxValue, ErrorMessage = "Trạng thái không hợp lệ")]
        public int Status { get; set; }
    }
}
