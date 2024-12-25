using JobListingWebAPI.Entities;

namespace JobListingWebAPI.Models
{
    public class CVModel
    {
        public string? FileName { get; set; }
        public string? FileUrl { get; set; }
        public string? ContentType { get; set; }
        public DateTime UploadDate { get; set; }
        public string? UserId { get; set; }
        public bool IsDeleted { get; set; }

        public static CVModel FromCV(CV cv)
        {
            return new CVModel
            {
                FileName = cv.FileName,
                FileUrl = cv.FileUrl,
                ContentType = cv.ContentType,
                UploadDate = cv.UploadDate,
                UserId = cv.UserId,
                IsDeleted = cv.IsDeleted
            };
        }
    }
}
