using JobListingWebAPI.Entities;
using JobListingWebAPI.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace JobListingWebAPI.Repositories
{
    public interface ILocationRepository
    {
        /// <summary>
        ///  Lấy toàn bộ các địa điểm
        /// </summary>
        /// <returns></returns>
        Task<IEnumerable<Location>> GetAllLocationsAsync();
        /// <summary>
        ///  Lấy toàn bộ các địa điểm kể cả đã xóa
        /// </summary>
        /// <returns></returns>
        Task<IEnumerable<Location>> Admin_GetAllLocationsAsync();
        /// <summary>
        /// Lất địa điểm với id
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        /// <exception cref="KeyNotFoundException"></exception>
        Task<LocationModel> GetLocationByIdAsync(int id);
        /// <summary>
        /// Thêm địa điểm
        /// </summary>
        /// <param name="locationModel"></param>
        /// <returns></returns>
        Task<LocationModel> AddLocationAsync(LocationModel location);
        /// <summary>
        /// Cập nhật địa điểm
        /// </summary>
        /// <param name="id"></param>
        /// <param name="locationModel"></param>
        /// <returns></returns>
        /// <exception cref="KeyNotFoundException"></exception>
        Task<LocationModel> UpdateLocationAsync(int id, LocationModel location);
        /// <summary>
        /// Khôi phục địa điểm đã xóa
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        Task<bool> RestoreLocationAsync(int id);
        /// <summary>
        /// Xóa địa điểm tạm thời
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        Task<bool> DeleteLocationAsync(int id);
        /// <summary>
        /// Xóa địa điểm vĩnh viễn
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        Task<bool> DeleteLocationPermanentlyAsync(int id);
        /// <summary>
        /// Kiểm tra địa điểm tồn tại
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        Task<bool> LocationExistsAsync(int id);
        /// <summary>
        /// Kiểm tra địa điểm đã xóa
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        Task<bool> LocationDeletedAsync(int id);
        /// <summary>
        /// Tìm kiếm địa điểm
        /// </summary>
        /// <param name="searchTerm"></param>
        /// <returns></returns>
        Task<IEnumerable<Location>> SearchLocationsAsync(string searchTerm);
    }
}
