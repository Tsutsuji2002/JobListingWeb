using JobListingWebAPI.Data;
using JobListingWebAPI.Entities;
using Microsoft.EntityFrameworkCore;

namespace JobListingWebAPI.Repositories
{
    public class CompanyRepository : ICompanyRepository
    {
        private readonly JobListingWebDbContext _context;

        public CompanyRepository(JobListingWebDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Company>> GetAllCompaniesAsync()
        {
            return await _context.Companies
                .Where(c => !c.IsDeleted)
                .Include(c => c.MappingLocations)
                .Include(c => c.MappingIndustries)
                .ToListAsync();
        }

        public async Task<Company> GetCompanyByIdAsync(int id)
        {
            var company = await _context.Companies
                .Where(c => c.CompanyID == id && !c.IsDeleted)
                .Include(c => c.MappingLocations)
                .Include(c => c.MappingIndustries)
                .FirstOrDefaultAsync();

            if (company == null)
            {
                throw new Exception($"Không tìm thấy công ty có ID {id}.");
            }

            return company;
        }

        public async Task<Company> AddCompanyAsync(Company company)
        {
            _context.Companies.Add(company);
            await _context.SaveChangesAsync();
            return company;
        }

        public async Task<Company> UpdateCompanyAsync(Company company)
        {
            _context.Entry(company).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return company;
        }

        public async Task<bool> DeleteCompanyAsync(int id)
        {
            var company = await _context.Companies.FindAsync(id);
            if (company == null)
                return false;

            company.IsDeleted = true;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> CompanyExistsAsync(int id)
        {
            return await _context.Companies.AnyAsync(c => c.CompanyID == id && !c.IsDeleted);
        }

        public async Task<IEnumerable<Company>> GetCompaniesByIndustryAsync(int industryId)
        {
            return await _context.Companies
                .Where(c => !c.IsDeleted && c.MappingIndustries.Any(mi => mi.IndustryID == industryId))
                .Include(c => c.MappingLocations)
                .Include(c => c.MappingIndustries)
                .ToListAsync();
        }

        public async Task<IEnumerable<Company>> GetCompaniesByLocationAsync(int locationId)
        {
            return await _context.Companies
                .Where(c => !c.IsDeleted && c.MappingLocations.Any(ml => ml.LocationID == locationId))
                .Include(c => c.MappingLocations)
                .Include(c => c.MappingIndustries)
                .ToListAsync();
        }

        public async Task<IEnumerable<Company>> SearchCompaniesAsync(string searchTerm)
        {
            return await _context.Companies
                .Where(c => !c.IsDeleted &&
                    ((c.Name != null && c.Name.Contains(searchTerm)) ||
                     (c.Description != null && c.Description.Contains(searchTerm))))
                .Include(c => c.MappingLocations)
                .Include(c => c.MappingIndustries)
                .ToListAsync();
        }
        public async Task<Company?> GetCompanyByUserIdAsync(string userId)
        {
            if (string.IsNullOrEmpty(userId))
            {
                throw new ArgumentException("User ID cannot be null or empty.", nameof(userId));
            }

            return await _context.Companies
                .Where(c => c.UserId == userId && !c.IsDeleted)
                .Include(c => c.MappingLocations)
                .Include(c => c.MappingIndustries)
                .FirstOrDefaultAsync();
        }
    }
}
