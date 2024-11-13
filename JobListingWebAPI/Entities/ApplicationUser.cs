using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobListingWebAPI.Entities
{
    public class ApplicationUser : IdentityUser
    {
        [MaxLength(100)]
        public string? FirstName { get; set; }
        [MaxLength(100)]
        public string? LastName { get; set; }
        [StringLength(50)]
        public string? City { get; set; }

        [StringLength(50)]
        public string? District { get; set; }
        public bool Gender { get; set; }// true = nam
        [Column(TypeName = "datetime")]
        public DateTime CreateTime { get; set; }
        [Column(TypeName = "datetime")]
        public DateTime ModifiedDate { get; set; }
        [Column(TypeName = "datetime")]
        public DateTime LastLogin { get; set; }
        [Column(TypeName = "datetime")]
        public DateTime LastTimeLogin { get; set; } = DateTime.Now;
        public bool IsDeleted { get; set; }
        public string UserType { get; set; }  // "Admin", "Applicant", or "Employer"
    }

    public class AdminUser : ApplicationUser
    {
        public string? AdminLevel { get; set; }
    }

    // Applicant specific properties
    public class ApplicantUser : ApplicationUser
    {
        public ICollection<Comment> Comments { get; set; }
    }

    // Employer specific properties
    public class EmployerUser : ApplicationUser
    {
        public string? IdentificationCardNumber { get; set; }
        public string? CompanyName { get; set; }
        public ICollection<Blog> Blogs { get; set; }
        public ICollection<Company> Companies { get; set; }

    }
}
