using JobListingWebAPI.Entities;
using JobListingWebAPI.Models;

namespace JobListingWebAPI.Repositories
{
    public interface IIndustryRepository
    {
        Task<IEnumerable<Industry>> GetAllIndustriesAsync();
        Task<Industry> GetIndustryByIdAsync(int id);
        Task<IndustryModel> AddIndustryAsync(IndustryModel industryModel);
        Task<IndustryModel> UpdateIndustryAsync(int id, IndustryModel industryModel);
        Task<bool> DeleteIndustryAsync(int id);
        Task<bool> IndustryExistsAsync(int id);
        Task<IEnumerable<Industry>> SearchIndustriesAsync(string searchTerm);
    }
}
