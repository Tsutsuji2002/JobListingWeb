using JobListingWebAPI.Entities;
using JobListingWebAPI.Models;

namespace JobListingWebAPI.Repositories
{
    public interface IIndustryRepository
    {
        /// <summary>
        /// Lấy toàn bộ ngành
        /// </summary>
        /// <returns></returns>
        Task<IEnumerable<Industry>> GetAllIndustriesAsync();
        /// <summary>
        /// Lấy toàn bộ ngành kể cả đã xóa
        /// </summary>
        /// <returns></returns>
        Task<IEnumerable<Industry>> Admin_GetAllIndustriesAsync();
        /// <summary>
        /// Lấy ngành theo id
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        /// <exception cref="Exception"></exception>
        Task<Industry> GetIndustryByIdAsync(int id);
        /// <summary>
        /// Thêm ngành mới
        /// </summary>
        /// <param name="industryModel"></param>
        /// <returns></returns>
        Task<IndustryModel> AddIndustryAsync(IndustryModel industryModel);
        /// <summary>
        /// Cập nhật ngành
        /// </summary>
        /// <param name="id"></param>
        /// <param name="industryModel"></param>
        /// <returns></returns>
        /// <exception cref="KeyNotFoundException"></exception>
        Task<IndustryModel> UpdateIndustryAsync(int id, IndustryModel industryModel);
        /// <summary>
        /// Khôi phục ngành đã xóa
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        Task<bool> RestoreIndustryAsync(int id);
        /// <summary>
        /// Xóa ngành tạm thời
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        Task<bool> DeleteIndustryAsync(int id);
        /// <summary>
        /// Xóa ngành vĩnh viễn
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        Task<bool> DeleteIndustryPermanentlyAsync(int id);
        /// <summary>
        /// Kiểm tra ngành có tồn tại
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        Task<bool> IndustryExistsAsync(int id);
        /// <summary>
        /// Kiểm tra ngành đã xóa
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        Task<bool> IndustryDeletedAsync(int id);
        /// <summary>
        /// Tìm kiếm ngành
        /// </summary>
        /// <param name="searchTerm"></param>
        /// <returns></returns>
        Task<IEnumerable<Industry>> SearchIndustriesAsync(string searchTerm);
    }
}
