using System.ComponentModel.DataAnnotations;

namespace JobListingWebAPI.Models
{
    public class ExtendJobRequest
    {
        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Số ngày gia hạn phải lớn hơn 0")]
        public int Days { get; set; }
    }
}
