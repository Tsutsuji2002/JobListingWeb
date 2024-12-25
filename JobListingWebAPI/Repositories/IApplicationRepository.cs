using JobListingWebAPI.Entities;

namespace JobListingWebAPI.Repositories
{
    public interface IApplicationRepository
    {
        Task<IEnumerable<Application>> GetAllApplicationsAsync();
        Task<Application> GetApplicationByIdAsync(int id);
        Task<IEnumerable<Application>> GetApplicationsByUserIdAsync(string userId);
        Task<IEnumerable<JobListing>> GetApplicatedJobsByUserIdAsync(string userId);
        Task<IEnumerable<Application>> GetApplicationsByJobIdAsync(int jobId);
        Task<Application> CreateApplicationAsync(Application application);
        Task<Application> UpdateApplicationAsync(Application application);
        Task<bool> DeleteApplicationAsync(int id);
        Task<bool> ApplicationExistsAsync(int id);
        Task<bool> HasUserAppliedToJobAsync(string userId, int jobId);
    }
}
