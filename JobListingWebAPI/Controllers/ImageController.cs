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

        [HttpPost("upload")]
        public async Task<IActionResult> SaveTempImage([FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file uploaded" });

            var uploadPath = Path.Combine(_environment.ContentRootPath, "uploads");
            var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
            var fullPath = Path.Combine(uploadPath, fileName);

            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return Ok(new
            {
                message = "Upload successful",
                url = $"/uploads/{fileName}"
            });
        }

        [HttpGet("temp/{filename}")]
        public async Task<IActionResult> GetTempImageAsync(string filename)
        {
            var tempFolder = Path.Combine(_environment.ContentRootPath, "uploads", "temp");
            var imagePath = Path.Combine(tempFolder, filename);

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
