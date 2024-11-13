using JobListingWebAPI.Data;
using JobListingWebAPI.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JobListingWebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ImageController : ControllerBase
    {
        public ImageController(IWebHostEnvironment environment)
        {
            _environment = environment;
        }

        private readonly IWebHostEnvironment _environment;

        [HttpGet("{folder}/{filename}")]
        public async Task<IActionResult> GetImageAsync(string folder, string filename)
        {
            var imagePath = Path.Combine(_environment.ContentRootPath, folder, filename);

            if (!System.IO.File.Exists(imagePath))
            {
                return NotFound();
            }

            var fileExtension = Path.GetExtension(filename).ToLowerInvariant();
            var contentType = fileExtension switch
            {
                ".jpg" or ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                ".gif" => "image/gif",
                ".bmp" => "image/bmp",
                _ => "application/octet-stream"
            };

            var imageBytes = await System.IO.File.ReadAllBytesAsync(imagePath);

            // Set cache control headers
            HttpContext.Response.Headers.Append("Cache-Control", "public,max-age=31536000");

            return File(imageBytes, contentType);
        }
    }
}
