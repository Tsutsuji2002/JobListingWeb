using Microsoft.EntityFrameworkCore;
using JobListingWebAPI.Entities;
using JobListingWebAPI.Data;

namespace JobListingWebAPI.Repositories
{
    public class ApplicationRepository : IApplicationRepository
    {
        private readonly JobListingWebDbContext _context;

        public ApplicationRepository(JobListingWebDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Application>> GetAllApplicationsAsync()
        {
            return await _context.Applications
                .Include(a => a.JobListing)
                .Include(a => a.User)
                .ToListAsync();
        }

        public async Task<Application> GetApplicationByIdAsync(int id)
        {
            return await _context.Applications
                .Include(a => a.JobListing)
                .Include(a => a.User)
                .Include(a => a.CV)
                .FirstOrDefaultAsync(a => a.ApplicationID == id);
        }

        public async Task<IEnumerable<Application>> GetApplicationsByUserIdAsync(string userId)
        {
            return await _context.Applications
                .Include(a => a.JobListing).ThenInclude(j => j.Location)
                .Include(a => a.JobListing).ThenInclude(j => j.Company)
                .Include(a => a.JobListing).ThenInclude(j => j.JobLevel)
                .Include(a => a.JobListing).ThenInclude(j => j.Industry)
                .Include(a => a.JobListing).ThenInclude(j => j.MappingCareers).ThenInclude(mc => mc.Career)
                .Include(a => a.User)
                .Include(a => a.CV)
                .Where(a => a.UserId == userId)
                .ToListAsync();
        }
        public async Task<IEnumerable<JobListing>> GetApplicatedJobsByUserIdAsync(string userId)
        {
            return await _context.JobListings
                .Where(j => j.Applications.Any(a => a.UserId == userId))
                .Where(j => !j.IsDeleted)
                .Include(j => j.Location)
                .Include(j => j.Company)
                .Include(j => j.JobLevel)
                .Include(j => j.Industry)
                .Include(j => j.MappingCareers)
                    .ThenInclude(mc => mc.Career)
                .ToListAsync();
        }

        public async Task<IEnumerable<Application>> GetApplicationsByJobIdAsync(int jobId)
        {
            return await _context.Applications
                .Include(a => a.JobListing)
                .Include(a => a.User)
                .Include(a => a.CV)
                .Where(a => a.JobID == jobId)
                .ToListAsync();
        }

        public async Task<Application> CreateApplicationAsync(Application application)
        {
            application.ApplicationDate = DateTime.UtcNow;
            application.Status = "Chờ duyệt";

            _context.Applications.Add(application);
            await _context.SaveChangesAsync();
            return application;
        }

        public async Task<Application> UpdateApplicationAsync(Application application)
        {
            _context.Entry(application).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return application;
        }

        public async Task<bool> DeleteApplicationAsync(int id)
        {
            var application = await _context.Applications.FindAsync(id);
            if (application == null)
                return false;

            _context.Applications.Remove(application);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ApplicationExistsAsync(int id)
        {
            return await _context.Applications.AnyAsync(a => a.ApplicationID == id);
        }

        public async Task<bool> HasUserAppliedToJobAsync(string userId, int jobId)
        {
            return await _context.Applications
                .AnyAsync(a => a.UserId == userId && a.JobID == jobId);
        }
    }
}
