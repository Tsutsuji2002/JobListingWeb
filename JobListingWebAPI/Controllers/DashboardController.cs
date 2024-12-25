using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JobListingWebAPI.Entities;
using JobListingWebAPI.Data;

namespace JobListingWebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly JobListingWebDbContext _context;

        public DashboardController(JobListingWebDbContext context)
        {
            _context = context;
        }

        // GET: api/Dashboard
        [HttpGet]
        public async Task<IActionResult> GetDashboardOverview()
        {
            try
            {
                // Total number of job listings (excluding deleted)
                var totalJobListings = await _context.Set<JobListing>()
                    .CountAsync(j => !j.IsDeleted);

                // Total number of unapproved job listings (excluding deleted)
                var totalUnapprovedJobListings = await _context.Set<JobListing>()
                    .CountAsync(j => !j.IsDeleted && j.Status == 3);

                // Total number of companies (excluding deleted)
                var totalCompanies = await _context.Set<Company>()
                    .CountAsync(c => !c.IsDeleted);

                // Total number of registered users (excluding deleted)
                var totalUsers = await _context.Set<ApplicantUser>()
                    .CountAsync(u => !u.IsDeleted);

                // Total number of blog posts (excluding deleted)
                var totalPosts = await _context.Set<Blog>()
                    .CountAsync(b => !b.IsDeleted);

                // Build response object
                var dashboardData = new
                {
                    TotalJobListings = totalJobListings,
                    TotalUnapprovedJobListings = totalUnapprovedJobListings,
                    TotalCompanies = totalCompanies,
                    TotalUsers = totalUsers,
                    TotalPosts = totalPosts
                };

                return Ok(dashboardData);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        [HttpGet("EmployerDashboard/{userId}")]
        public async Task<IActionResult> GetEmployerDashboard(string userId)
        {
            try
            {
                // Ensure the user ID is provided
                if (string.IsNullOrEmpty(userId))
                {
                    return BadRequest("User ID is required.");
                }

                // Get the company associated with the current user
                var company = await _context.Set<Company>()
                    .FirstOrDefaultAsync(c => c.UserId == userId && !c.IsDeleted);

                if (company == null)
                {
                    return NotFound("Company not found for the current user.");
                }

                var companyId = company.CompanyID;

                // Total jobs posted by the company
                var totalJobsPosted = await _context.Set<JobListing>()
                    .CountAsync(j => j.CompanyID == companyId && !j.IsDeleted);

                // Total applications for the company's jobs
                var totalApplications = await _context.Set<Application>()
                    .CountAsync(a => a.JobListing.CompanyID == companyId);

                // Applications pending approval
                var pendingApplications = await _context.Set<Application>()
                    .CountAsync(a => a.JobListing.CompanyID == companyId && a.Status == "Chờ duyệt");

                // Jobs that have expired (status == 0)
                var expiredJobs = await _context.Set<JobListing>()
                    .Where(j => j.CompanyID == companyId && j.Status == 0 && !j.IsDeleted)
                    .Select(j => new
                    {
                        j.JobID,
                        j.Title,
                        j.ClosingDate
                    })
                    .ToListAsync();

                // Build the response object
                var dashboardData = new
                {
                    TotalJobsPosted = totalJobsPosted,
                    TotalApplications = totalApplications,
                    PendingApplications = pendingApplications,
                    ExpiredJobs = expiredJobs
                };

                return Ok(dashboardData);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
