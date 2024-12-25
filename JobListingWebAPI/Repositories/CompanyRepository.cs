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

        /// <summary>
        /// Lấy toàn bộ công ty
        /// </summary>
        /// <returns></returns>
        public async Task<IEnumerable<Company>> GetAllCompaniesAsync()
        {
            return await _context.Companies
                .Where(c => !c.IsDeleted)
                .Include(c => c.MappingLocations).ThenInclude(ml => ml.Location)
                .Include(c => c.MappingIndustries).ThenInclude(mi => mi.Industry)
                .Include(c => c.User)
                .Include(c => c.JobListings)
                .ToListAsync();
        }

        /// <summary>
        /// Lấy toàn bộ công ty kể cả đã xóa
        /// </summary>
        /// <returns></returns>
        public async Task<IEnumerable<Company>> Admin_GetAllCompaniesAsync()
        {
            return await _context.Companies
                .Include(c => c.MappingLocations)
                .Include(c => c.MappingIndustries)
                .Include(c => c.User)
                .ToListAsync();
        }

        /// <summary>
        /// Lấy công ty qua id
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        /// <exception cref="Exception"></exception>
        public async Task<Company> GetCompanyByIdAsync(int id)
        {
            var company = await _context.Companies
                .Where(c => c.CompanyID == id)
                .Include(c => c.MappingLocations).ThenInclude(ml => ml.Location)
                .Include(c => c.MappingIndustries).ThenInclude(mi => mi.Industry)
                .Include(c => c.User)
                .Include(c => c.JobListings).ThenInclude(mi => mi.Industry)
                .Include(c => c.JobListings).ThenInclude(ml => ml.Location)
                .FirstOrDefaultAsync();

            if (company == null)
            {
                throw new Exception($"Không tìm thấy công ty có ID {id}.");
            }

            return company;
        }

        /// <summary>
        /// Thêm công ty
        /// </summary>
        /// <param name="company"></param>
        /// <returns></returns>
        public async Task<Company> AddCompanyAsync(Company company)
        {
            _context.Companies.Add(company);
            await _context.SaveChangesAsync();
            return company;
        }

        /// <summary>
        /// Cập nhật công ty
        /// </summary>
        /// <param name="company"></param>
        /// <returns></returns>
        public async Task<Company> UpdateCompanyAsync(Company company)
        {
            _context.Entry(company).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return company;
        }

        /// <summary>
        /// Khôi phục công ty đã xóa
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<bool> RestoreCompanyAsync(int id)
        {
            var company = await _context.Companies.FindAsync(id);
            if (company == null)
                return false;

            company.IsDeleted = false;
            await _context.SaveChangesAsync();
            return true;
        }

        /// <summary>
        /// Xóa công ty tạm thời
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<bool> DeleteCompanyAsync(int id)
        {
            var company = await _context.Companies.FindAsync(id);
            if (company == null)
                return false;

            company.IsDeleted = true;
            await _context.SaveChangesAsync();
            return true;
        }

        /// <summary>
        /// Xóa công ty vĩnh viễn
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<bool> PermanentDeleteCompanyAsync(int id)
        {
            try
            {
                var company = await _context.Companies
                    .Include(c => c.JobListings)
                    .Include(c => c.MappingLocations)
                    .Include(c => c.MappingIndustries)
                    .FirstOrDefaultAsync(c => c.CompanyID == id);

                if (company == null)
                    return false;

                _context.JobListings.RemoveRange(company.JobListings);
                _context.MappingLocations.RemoveRange(company.MappingLocations);
                _context.MappingIndustries.RemoveRange(company.MappingIndustries);

                _context.Companies.Remove(company);

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        /// <summary>
        /// Kiểm tra công ty tồn tại
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<bool> CompanyExistsAsync(int id)
        {
            return await _context.Companies.AnyAsync(c => c.CompanyID == id && !c.IsDeleted);
        }

        /// <summary>
        /// Kiểm tra công ty đã xóa
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<bool> CompanyDeletedAsync(int id)
        {
            return await _context.Companies.AnyAsync(c => c.CompanyID == id && c.IsDeleted);
        }

        /// <summary>
        /// Lọc các công ty theo ngành
        /// </summary>
        /// <param name="industryId"></param>
        /// <returns></returns>
        public async Task<IEnumerable<Company>> GetCompaniesByIndustryAsync(int industryId)
        {
            return await _context.Companies
                .Where(c => !c.IsDeleted && c.MappingIndustries.Any(mi => mi.IndustryID == industryId))
                .Include(c => c.MappingLocations)
                .Include(c => c.MappingIndustries)
                .ToListAsync();
        }

        /// <summary>
        /// Lọc các công ty theo địa điểm
        /// </summary>
        /// <param name="locationId"></param>
        /// <returns></returns>
        public async Task<IEnumerable<Company>> GetCompaniesByLocationAsync(int locationId)
        {
            return await _context.Companies
                .Where(c => !c.IsDeleted && c.MappingLocations.Any(ml => ml.LocationID == locationId))
                .Include(c => c.MappingLocations)
                .Include(c => c.MappingIndustries)
                .ToListAsync();
        }

        /// <summary>
        /// Tìm kiếm công ty theo tên hoặc mô tả
        /// </summary>
        /// <param name="searchTerm"></param>
        /// <returns></returns>
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

        /// <summary>
        /// Tìm công ty của employer(theo userId)
        /// </summary>
        /// <param name="userId"></param>
        /// <returns></returns>
        /// <exception cref="ArgumentException"></exception>
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

        /// <summary>
        /// Lấy các công ty nổi bật
        /// </summary>
        /// <returns></returns>
        public async Task<IEnumerable<Company>> GetFeaturedCompanies()
        {
            return await _context.Companies
                .Where(c => !c.IsDeleted && c.IsFeature)
                .Include(c => c.MappingLocations)
                .Include(c => c.MappingIndustries)
                .OrderByDescending(c => c.CreatedDate)
                .ToListAsync();
        }

        /// <summary>
        /// Chuyển đổi trạng thái đặc trưng của công ty(đặc trưng => không đặc trưng và ngược lại)
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<bool> ToggleFeatureCompanyAsync(int id)
        {
            var company = await _context.Companies.FindAsync(id);
            if (company == null)
                return false;

            // Toggle the IsFeature status
            company.IsFeature = !company.IsFeature;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
