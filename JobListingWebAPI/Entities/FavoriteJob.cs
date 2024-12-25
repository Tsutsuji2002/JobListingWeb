using static Betalgo.Ranul.OpenAI.ObjectModels.SharedModels.IOpenAIModels;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace JobListingWebAPI.Entities
{
    public class FavoriteJob
    {
        [Key]
        public int FavoriteJobID { get; set; }

        [ForeignKey("User")]
        public string? UserID { get; set; }
        public ApplicantUser? User { get; set; }

        [ForeignKey("JobListing")]
        public int JobID { get; set; }
        public JobListing? JobListing { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.Now;
    }
}
