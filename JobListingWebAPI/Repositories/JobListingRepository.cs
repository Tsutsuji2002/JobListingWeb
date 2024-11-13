using JobListingWebAPI.Data;
using JobListingWebAPI.Entities;
using JobListingWebAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace JobListingWebAPI.Repositories
{
    public class JobListingRepository : IJobListingRepository
    {
        private readonly JobListingWebDbContext _context;

        public JobListingRepository(JobListingWebDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<JobListing>> GetAllJobListingsAsync()
        {
            return await _context.JobListings
                .Where(j => !j.IsDeleted)
                .Include(j => j.Company)
                .Include(j => j.JobLevel)
                .Include(j => j.Industry)
                .Include(j => j.MappingCareers)
                    .ThenInclude(mc => mc.Career)
                .ToListAsync();
        }

        public async Task<JobListing> GetJobListingByIdAsync(int id)
        {
            var jobListing = await _context.JobListings
                .Where(j => j.JobID == id && !j.IsDeleted)
                .Include(j => j.Company)
                .Include(j => j.JobLevel)
                .Include(j => j.MappingCareers)
                    .ThenInclude(mc => mc.Career)
                .FirstOrDefaultAsync();

            if (jobListing == null)
            {
                throw new Exception($"Không tìm thấy danh sách việc làm có ID {id}.");
            }

            return jobListing;
        }

        public async Task<JobListing> AddJobListingAsync(JobModel jobModel)
        {
            var jobListing = new JobListing
            {
                Title = jobModel.Title,
                Description = jobModel.Description,
                JobCategory = jobModel.JobCategory,
                Salary = jobModel.Salary,
                CompanyID = jobModel.CompanyID,
                Education = jobModel.Education,
                JobLevelID = jobModel.JobLevelID,
                IndustryID = jobModel.IndustryID,
                MinimumQualifications = jobModel.MinimumQualifications,
                LocationID = jobModel.LocationID,
                PreferredLanguage = jobModel.PreferredLanguage,
                JobDuties = jobModel.JobDuties,
                CreatedDate = DateTime.UtcNow,
                Status = JobStatus.Active  // Assuming you have a default status
            };

            _context.JobListings.Add(jobListing);
            await _context.SaveChangesAsync();
            return jobListing;
        }

        public async Task<JobListing> UpdateJobListingAsync(JobListing jobListing)
        {
            _context.Entry(jobListing).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return jobListing;
        }

        public async Task<bool> DeleteJobListingAsync(int id)
        {
            var jobListing = await _context.JobListings.FindAsync(id);
            if (jobListing == null)
                return false;

            jobListing.IsDeleted = true;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> JobListingExistsAsync(int id)
        {
            return await _context.JobListings.AnyAsync(j => j.JobID == id && !j.IsDeleted);
        }

        public async Task<IEnumerable<JobListing>> GetJobListingsByCompanyAsync(int companyId)
        {
            return await _context.JobListings
                .Where(j => !j.IsDeleted && j.CompanyID == companyId)
                .Include(j => j.Company)
                .Include(j => j.JobLevel)
                .ToListAsync();
        }

        public async Task<IEnumerable<JobListing>> SearchJobListingsAsync(string searchTerm)
        {
            return await _context.JobListings
                .Where(j => !j.IsDeleted &&
                    ((j.Title != null && j.Title.Contains(searchTerm)) ||
                     (j.Description != null && j.Description.Contains(searchTerm))))
                .Include(j => j.Company)
                .Include(j => j.JobLevel)
                .ToListAsync();
        }
    }
}
