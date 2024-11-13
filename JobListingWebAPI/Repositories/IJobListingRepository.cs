using JobListingWebAPI.Entities;

namespace JobListingWebAPI.Repositories
{
    public interface IJobListingRepository
    {
        Task<IEnumerable<JobListing>> GetAllJobListingsAsync();
        Task<JobListing> GetJobListingByIdAsync(int id);
        Task<JobListing> AddJobListingAsync(JobListing jobListing);
        Task<JobListing> UpdateJobListingAsync(JobListing jobListing);
        Task<bool> DeleteJobListingAsync(int id);
        Task<bool> JobListingExistsAsync(int id);
        Task<IEnumerable<JobListing>> GetJobListingsByCompanyAsync(int companyId);
        Task<IEnumerable<JobListing>> SearchJobListingsAsync(string searchTerm);
    }
}
