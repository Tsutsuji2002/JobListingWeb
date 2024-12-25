using JobListingWebAPI.Entities;

namespace JobListingWebAPI.Repositories
{
    public interface ICompanyRepository
    {
        /// <summary>
        /// Lấy toàn bộ công ty
        /// </summary>
        /// <returns></returns>
        Task<IEnumerable<Company>> GetAllCompaniesAsync();
        /// <summary>
        /// Lấy toàn bộ công ty kể cả đã xóa
        /// </summary>
        /// <returns></returns>
        Task<IEnumerable<Company>> Admin_GetAllCompaniesAsync();
        /// <summary>
        /// Lấy công ty qua id
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        /// <exception cref="Exception"></exception>
        Task<Company> GetCompanyByIdAsync(int id);
        /// <summary>
        /// Thêm công ty
        /// </summary>
        /// <param name="company"></param>
        /// <returns></returns>
        Task<Company> AddCompanyAsync(Company company);
        /// <summary>
        /// Cập nhật công ty
        /// </summary>
        /// <param name="company"></param>
        /// <returns></returns>
        Task<Company> UpdateCompanyAsync(Company company);
        /// <summary>
        /// Khôi phục công ty đã xóa
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        Task<bool> RestoreCompanyAsync(int id);
        /// <summary>
        /// Xóa công ty tạm thời
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        Task<bool> DeleteCompanyAsync(int id);
        /// <summary>
        /// Xóa công ty vĩnh viễn
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        Task<bool> PermanentDeleteCompanyAsync(int id);
        /// <summary>
        /// Kiểm tra công ty tồn tại
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        Task<bool> CompanyExistsAsync(int id);
        /// <summary>
        /// Kiểm tra công ty đã xóa
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        Task<bool> CompanyDeletedAsync(int id);
        /// <summary>
        /// Lọc các công ty theo ngành
        /// </summary>
        /// <param name="industryId"></param>
        /// <returns></returns>
        Task<IEnumerable<Company>> GetCompaniesByIndustryAsync(int industryId);
        /// <summary>
        /// Lọc các công ty theo địa điểm
        /// </summary>
        /// <param name="locationId"></param>
        /// <returns></returns>
        Task<IEnumerable<Company>> GetCompaniesByLocationAsync(int locationId);
        /// <summary>
        /// Tìm kiếm công ty theo tên hoặc mô tả
        /// </summary>
        /// <param name="searchTerm"></param>
        /// <returns></returns>
        Task<IEnumerable<Company>> SearchCompaniesAsync(string searchTerm);
        /// <summary>
        /// Tìm công ty của employer(theo userId)
        /// </summary>
        /// <param name="userId"></param>
        /// <returns></returns>
        /// <exception cref="ArgumentException"></exception>
        Task<Company?> GetCompanyByUserIdAsync(string userId);
        /// <summary>
        /// Lấy các công ty nổi bật
        /// </summary>
        /// <returns></returns>
        Task<IEnumerable<Company>> GetFeaturedCompanies();
        /// <summary>
        /// Chuyển đổi trạng thái đặc trưng của công ty(đặc trưng => không đặc trưng và ngược lại)
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        Task<bool> ToggleFeatureCompanyAsync(int id);
    }
}
