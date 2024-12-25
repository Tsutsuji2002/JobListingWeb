namespace JobListingWebAPI.Models
{
    public class CVUploadModel
    {
        public IFormFile File {  get; set; }
        public string UserId { get; set; }
    }
}
