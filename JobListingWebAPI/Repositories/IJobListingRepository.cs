using JobListingWebAPI.Entities;
using JobListingWebAPI.Models;
using Microsoft.AspNetCore.Mvc;

namespace JobListingWebAPI.Repositories
{
    public interface IJobListingRepository
    {
        /// <summary>
        /// Lấy danh sách việc làm
        /// </summary>
        /// <returns></returns>
        Task<IEnumerable<JobListing>> GetAllJobListingsAsync();
        /// <summary>
        /// Lấy danh sách việc làm kể cả đã xóa
        /// </summary>
        /// <returns></returns>
        Task<IEnumerable<JobListing>> Admin_GetAllJobListingsAsync();
        Task<IEnumerable<JobListing>> Admin_GetAllUnApprovedJobListingsAsync();
        /// <summary>
        /// Lấy công việc theo id
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        /// <exception cref="Exception"></exception>
        Task<JobListing> GetJobListingByIdAsync(int id);
        /// <summary>
        /// Lấy danh sách công việc theo công ty kể cả đã xóa
        /// </summary>
        /// <param name="companyId"></param>
        /// <returns></returns>
        Task<IEnumerable<JobListing>> Admin_GetJobListingsByCompanyAsync(int companyId);
        /// <summary>
        /// Thêm công việc mới
        /// </summary>
        /// <param name="jobListing"></param>
        /// <returns></returns>
        Task<JobListing> AddJobListingAsync(JobListing jobListing);
        /// <summary>
        /// Cập nhật công việc
        /// </summary>
        /// <param name="jobListing"></param>
        /// <returns></returns>
        /// <exception cref="Exception"></exception>
        Task UpdateJobListingAsync(JobListing jobListing);
        /// <summary>
        /// Khôi phục công việc bị xóa
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        Task<bool> RestoreJobListingAsync(int id);
        /// <summary>
        /// Xóa công việc tạm thời
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        Task<bool> DeleteJobListingAsync(int id);
        /// <summary>
        /// Xóa công việc vĩnh viễn
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        Task<bool> DeleteJobListingPermanentlyAsync(int id);
        /// <summary>
        /// Kiểm tra công việc tồn tại
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        Task<bool> JobListingExistsAsync(int id);
        /// <summary>
        /// Kiểm tra công việc đã xóa
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        Task<bool> JobListingDeletedAsync(int id);
        /// <summary>
        /// Lấy danh sách công việc theo công ty
        /// </summary>
        /// <param name="companyId"></param>
        /// <returns></returns>
        Task<IEnumerable<JobListing>> GetJobListingsByCompanyAsync(int companyId);
        /// <summary>
        /// Tìm kiếm công việc(theo tên và mô tả)
        /// </summary>
        /// <param name="searchTerm"></param>
        /// <returns></returns>
        Task<IEnumerable<JobListing>> SearchJobListingsAsync(string searchTerm);
        /// <summary>
        /// Lấy danh sách các cấp độ công việc
        /// </summary>
        /// <returns></returns>
        Task<IEnumerable<JobLevel>> GetAllJobLevelsAsync();
        /// <summary>
        /// Cập nhật trạng thái công việc
        /// </summary>
        /// <param name="jobId"></param>
        /// <param name="status"></param>
        /// <returns></returns>
        /// <exception cref="KeyNotFoundException"></exception>
        Task<JobListing> UpdateJobStatusAsync(int jobId, int status);
        /// <summary>
        /// Gia hạn thời hạn ứng tuyển công việc
        /// </summary>
        /// <param name="jobId"></param>
        /// <param name="days"></param>
        /// <returns></returns>
        /// <exception cref="KeyNotFoundException"></exception>
        /// <exception cref="ArgumentException"></exception>
        Task<JobListing> ExtendJobAsync(int jobId, int days);
        /// <summary>
        /// Lấy các công việc nổi bật
        /// </summary>
        /// <returns></returns>
        /// <exception cref="Exception"></exception>
        Task<IEnumerable<JobListing>> GetFeaturedJobListings();
        /// <summary>
        /// Chuyển đổi trạng thái đặc trưng của công việc(đặc trưng => không đặc trưng và ngược lại)
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        Task<bool> ToggleFeatureJobAsync(int id);
        Task<FavoriteJob> AddFavoriteJobAsync(string userId, int jobId);
        Task RemoveFavoriteJobAsync(string userId, int jobId);
        Task<List<JobListing>> GetFavoriteJobListingsAsync(string userId);
    }
}
