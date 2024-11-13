using JobListingWebAPI.Entities;

namespace JobListingWebAPI.Repositories
{
    public interface ICompanyRepository
    {
        Task<IEnumerable<Company>> GetAllCompaniesAsync();
        Task<Company> GetCompanyByIdAsync(int id);
        Task<Company> AddCompanyAsync(Company company);
        Task<Company> UpdateCompanyAsync(Company company);
        Task<bool> DeleteCompanyAsync(int id);
        Task<bool> CompanyExistsAsync(int id);
        Task<IEnumerable<Company>> GetCompaniesByIndustryAsync(int industryId);
        Task<IEnumerable<Company>> GetCompaniesByLocationAsync(int locationId);
        Task<IEnumerable<Company>> SearchCompaniesAsync(string searchTerm);
        Task<Company?> GetCompanyByUserIdAsync(string userId);
    }
}
