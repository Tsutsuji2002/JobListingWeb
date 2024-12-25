using JobListingWebAPI.Entities;

namespace JobListingWebAPI.Services
{
    public interface ICVService
    {
        Task<CV> UploadCVAsync(IFormFile file, string userId);
        Task<CV> GetCVAsync(int cvId);
        Task<IEnumerable<CV>> GetUserCVsAsync(string userId);
        Task<bool> DeleteCVAsync(int cvId);
        Task<bool> SoftDeleteCVAsync(int cvId);
        Task<Stream> DownloadCVAsync(int cvId);
        Task<string> GenerateCVPreviewUrlAsync(int cvId);
    }
}
