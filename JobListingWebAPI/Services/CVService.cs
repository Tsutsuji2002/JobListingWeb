//using Azure.Storage.Blobs;
//using Azure.Storage.Blobs.Models;
using JobListingWebAPI.Data;
using JobListingWebAPI.Entities;
using JobListingWebAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace JobListingWebAPI.Services
{
    //---Local Development
    public class CVService : ICVService
    {
        private readonly JobListingWebDbContext _context;
        private readonly ILogger<CVService> _logger;
        private readonly string _uploadDirectory;
        private readonly IWebHostEnvironment _environment;

        public CVService(
            JobListingWebDbContext context,
            ILogger<CVService> logger,
            IWebHostEnvironment environment)
        {
            _context = context;
            _logger = logger;
            _environment = environment;

            // Create uploads directory in wwwroot
            _uploadDirectory = Path.Combine(_environment.ContentRootPath, "uploads", "cvs");
            if (!Directory.Exists(_uploadDirectory))
            {
                Directory.CreateDirectory(_uploadDirectory);
            }
        }

        public async Task<CV> UploadCVAsync(IFormFile file, string userId)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("No file uploaded");

            // Validate file type
            var allowedTypes = new[] {
                "application/pdf",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            };

            if (!allowedTypes.Contains(file.ContentType))
                throw new ArgumentException("Invalid file type. Only PDF and Word documents are allowed.");

            // Validate file size (e.g., 10MB limit)
            const int maxFileSize = 10 * 1024 * 1024; // 10MB
            if (file.Length > maxFileSize)
                throw new ArgumentException("File size exceeds the limit of 10MB");

            try
            {
                // Create unique filename
                var fileName = $"{userId}-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
                var filePath = Path.Combine(_uploadDirectory, fileName);

                // Save file to disk
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Create relative URL for the file
                var fileUrl = $"/uploads/cvs/{fileName}";

                // Create CV record
                var cv = new CV
                {
                    FileName = file.FileName,
                    FileUrl = fileUrl,
                    ContentType = file.ContentType,
                    UploadDate = DateTime.UtcNow,
                    UserId = userId,
                    IsDeleted = false,
                };

                _context.CVs.Add(cv);
                await _context.SaveChangesAsync();

                return cv;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading CV for user {UserId}", userId);
                throw new Exception("Failed to upload CV", ex);
            }
        }

        public async Task<CV> GetCVAsync(int cvId)
        {
            var cv = await _context.CVs
                .Include(c => c.User)
                .FirstOrDefaultAsync(c => c.CVID == cvId);

            if (cv == null)
                return null;

            try
            {
                var filePath = Path.Combine(_environment.ContentRootPath, cv.FileUrl.TrimStart('/'));
                if (!File.Exists(filePath))
                {
                    _logger.LogWarning("CV file not found for CVID: {CvId}", cvId);
                    return null;
                }

                return cv;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving CV {CvId}", cvId);
                throw new Exception("Failed to retrieve CV", ex);
            }
        }

        public async Task<IEnumerable<CV>> GetUserCVsAsync(string userId)
        {
            try
            {
                var cvs = await _context.CVs
                    .Where(c => c.UserId == userId && !c.IsDeleted)
                    .OrderByDescending(c => c.UploadDate)
                    .ToListAsync();

                // Verify files still exist and filter out any that don't
                var validCVs = new List<CV>();

                foreach (var cv in cvs)
                {
                    var filePath = Path.Combine(_environment.ContentRootPath, cv.FileUrl.TrimStart('/'));
                    if (File.Exists(filePath))
                    {
                        validCVs.Add(cv);
                    }
                    else
                    {
                        _logger.LogWarning("CV file not found for CVID: {CvId}", cv.CVID);
                    }
                }

                return validCVs;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving CVs for user {UserId}", userId);
                throw new Exception("Failed to retrieve user CVs", ex);
            }
        }

        public async Task<bool> DeleteCVAsync(int cvId)
        {
            var cv = await _context.CVs.FindAsync(cvId);
            if (cv == null)
                return false;

            try
            {
                // Delete physical file
                var filePath = Path.Combine(_environment.ContentRootPath, cv.FileUrl.TrimStart('/'));
                if (File.Exists(filePath))
                {
                    File.Delete(filePath);
                }

                // Delete database record
                _context.CVs.Remove(cv);
                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting CV {CvId}", cvId);
                throw new Exception("Failed to delete CV", ex);
            }
        }
        public async Task<bool> SoftDeleteCVAsync(int cvId)
        {
            var cv = await _context.CVs.FindAsync(cvId);
            if (cv == null)
                return false;

            try
            {
                cv.IsDeleted = true;
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting CV {CvId}", cvId);
                throw new Exception("Failed to delete CV", ex);
            }
        }
        public async Task<Stream> DownloadCVAsync(int cvId)
        {
            var cv = await _context.CVs.FindAsync(cvId);
            if (cv == null)
                throw new ArgumentException("CV not found");

            try
            {
                var filePath = Path.Combine(_environment.ContentRootPath, cv.FileUrl.TrimStart('/'));
                if (!File.Exists(filePath))
                {
                    throw new FileNotFoundException("CV file not found");
                }

                return new FileStream(filePath, FileMode.Open, FileAccess.Read);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error downloading CV {CvId}", cvId);
                throw new Exception("Failed to download CV", ex);
            }
        }

        public async Task<string> GenerateCVPreviewUrlAsync(int cvId)
        {
            var cv = await _context.CVs.FindAsync(cvId);
            if (cv == null)
                throw new ArgumentException("CV not found");

            try
            {
                var filePath = Path.Combine(_environment.ContentRootPath, cv.FileUrl.TrimStart('/'));
                if (!File.Exists(filePath))
                {
                    throw new FileNotFoundException("CV file not found");
                }

                // For PDF files, we can directly use the file URL
                if (cv.ContentType == "application/pdf")
                {
                    return cv.FileUrl;
                }

                // For Word documents, we might want to convert to PDF first
                // This is a placeholder - you'd need to implement actual conversion
                // For now, we'll return the original file URL
                return cv.FileUrl;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating CV preview {CvId}", cvId);
                throw new Exception("Failed to generate CV preview", ex);
            }
        }
    }

    //---Azure Deploy upload

    //public class CVService : ICVService
    //{
    //    private readonly JobListingWebDbContext _context;
    //    private readonly BlobServiceClient _blobServiceClient;
    //    private readonly string _containerName;
    //    private readonly ILogger<CVService> _logger;

    //    public CVService(
    //        JobListingWebDbContext context,
    //        IConfiguration configuration,
    //        ILogger<CVService> logger)
    //    {
    //        _context = context;
    //        _logger = logger;

    //        // Check if using Azurite for local development
    //        var useLocalStorage = configuration.GetValue<bool>("AzureStorage:UseLocalStorage");
    //        var connectionString = useLocalStorage ?
    //            "UseDevelopmentStorage=true" :
    //            configuration["AzureStorage:ConnectionString"];

    //        _blobServiceClient = new BlobServiceClient(connectionString);
    //        _containerName = configuration.GetValue<string>("AzureStorage:ContainerName") ?? "cvs";
    //    }

    //    public async Task<CV> UploadCVAsync(IFormFile file, string userId)
    //    {
    //        if (file == null || file.Length == 0)
    //            throw new ArgumentException("No file uploaded");

    //        // Validate file type
    //        var allowedTypes = new[] {
    //        "application/pdf",
    //        "application/msword",
    //        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    //    };

    //        if (!allowedTypes.Contains(file.ContentType))
    //            throw new ArgumentException("Invalid file type. Only PDF and Word documents are allowed.");

    //        // Validate file size (e.g., 10MB limit)
    //        const int maxFileSize = 10 * 1024 * 1024; // 10MB
    //        if (file.Length > maxFileSize)
    //            throw new ArgumentException("File size exceeds the limit of 10MB");

    //        try
    //        {
    //            // Create unique filename
    //            var fileName = $"{userId}-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";

    //            // Ensure container exists
    //            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
    //            await containerClient.CreateIfNotExistsAsync();

    //            // Set container public access level (optional)
    //            await containerClient.SetAccessPolicyAsync(PublicAccessType.Blob);

    //            var blobClient = containerClient.GetBlobClient(fileName);

    //            // Upload file with metadata
    //            var blobHttpHeaders = new BlobHttpHeaders
    //            {
    //                ContentType = file.ContentType
    //            };

    //            var metadata = new Dictionary<string, string>
    //        {
    //            { "OriginalFileName", file.FileName },
    //            { "UploadedBy", userId },
    //            { "UploadDate", DateTime.UtcNow.ToString("O") }
    //        };

    //            using var stream = file.OpenReadStream();
    //            await blobClient.UploadAsync(stream, new BlobUploadOptions
    //            {
    //                HttpHeaders = blobHttpHeaders,
    //                Metadata = metadata
    //            });

    //            // Create CV record
    //            var cv = new CV
    //            {
    //                FileName = file.FileName,
    //                FileUrl = blobClient.Uri.ToString(),
    //                ContentType = file.ContentType,
    //                UploadDate = DateTime.UtcNow,
    //                UserId = userId
    //            };

    //            _context.CVs.Add(cv);
    //            await _context.SaveChangesAsync();

    //            return cv;
    //        }
    //        catch (Exception ex)
    //        {
    //            _logger.LogError(ex, "Error uploading CV for user {UserId}", userId);
    //            throw new Exception("Failed to upload CV", ex);
    //        }
    //    }

    //    public async Task<CV> GetCVAsync(int cvId)
    //    {
    //        var cv = await _context.CVs
    //            .Include(c => c.User)
    //            .FirstOrDefaultAsync(c => c.CVID == cvId);

    //        if (cv == null)
    //            return null;

    //        try
    //        {
    //            // Verify blob still exists
    //            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
    //            var blobName = new Uri(cv.FileUrl).Segments.Last();
    //            var blobClient = containerClient.GetBlobClient(blobName);

    //            var exists = await blobClient.ExistsAsync();
    //            if (!exists)
    //            {
    //                _logger.LogWarning("CV blob not found for CVID: {CvId}", cvId);
    //                return null;
    //            }

    //            return cv;
    //        }
    //        catch (Exception ex)
    //        {
    //            _logger.LogError(ex, "Error retrieving CV {CvId}", cvId);
    //            throw new Exception("Failed to retrieve CV", ex);
    //        }
    //    }

    //    public async Task<IEnumerable<CV>> GetUserCVsAsync(string userId)
    //    {
    //        try
    //        {
    //            var cvs = await _context.CVs
    //                .Where(c => c.UserId == userId)
    //                .OrderByDescending(c => c.UploadDate)
    //                .ToListAsync();

    //            // Verify blobs still exist and filter out any that don't
    //            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
    //            var validCVs = new List<CV>();

    //            foreach (var cv in cvs)
    //            {
    //                var blobName = new Uri(cv.FileUrl).Segments.Last();
    //                var blobClient = containerClient.GetBlobClient(blobName);

    //                if (await blobClient.ExistsAsync())
    //                {
    //                    validCVs.Add(cv);
    //                }
    //                else
    //                {
    //                    _logger.LogWarning("CV blob not found for CVID: {CvId}", cv.CVID);
    //                }
    //            }

    //            return validCVs;
    //        }
    //        catch (Exception ex)
    //        {
    //            _logger.LogError(ex, "Error retrieving CVs for user {UserId}", userId);
    //            throw new Exception("Failed to retrieve user CVs", ex);
    //        }
    //    }

    //    public async Task<bool> DeleteCVAsync(int cvId)
    //    {
    //        var cv = await _context.CVs.FindAsync(cvId);
    //        if (cv == null)
    //            return false;

    //        try
    //        {
    //            // Delete blob
    //            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
    //            var blobName = new Uri(cv.FileUrl).Segments.Last();
    //            var blobClient = containerClient.GetBlobClient(blobName);

    //            await blobClient.DeleteIfExistsAsync();

    //            // Delete database record
    //            _context.CVs.Remove(cv);
    //            await _context.SaveChangesAsync();

    //            return true;
    //        }
    //        catch (Exception ex)
    //        {
    //            _logger.LogError(ex, "Error deleting CV {CvId}", cvId);
    //            throw new Exception("Failed to delete CV", ex);
    //        }
    //    }

    //    public async Task<Stream> DownloadCVAsync(int cvId)
    //    {
    //        var cv = await _context.CVs.FindAsync(cvId);
    //        if (cv == null)
    //            throw new ArgumentException("CV not found");

    //        try
    //        {
    //            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
    //            var blobName = new Uri(cv.FileUrl).Segments.Last();
    //            var blobClient = containerClient.GetBlobClient(blobName);

    //            var response = await blobClient.DownloadStreamingAsync();
    //            return response.Value.Content;
    //        }
    //        catch (Exception ex)
    //        {
    //            _logger.LogError(ex, "Error downloading CV {CvId}", cvId);
    //            throw new Exception("Failed to download CV", ex);
    //        }
    //    }


    //}
}
