using JobListingWebAPI.Data;
using JobListingWebAPI.Entities;
using JobListingWebAPI.Models;
using JobListingWebAPI.Repositories;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Authorization;

namespace JobListingWebAPI.Controllers
{
    [Authorize(Roles = "Admin")]
    [Route("api/[controller]")]
    [ApiController]
    public class BlogController : ControllerBase
    {
        private readonly IBlogRepository _blogRepository;
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<BlogController> _logger;

        public BlogController(IBlogRepository blogRepository, IWebHostEnvironment environment, ILogger<BlogController> logger)
        {
            _blogRepository = blogRepository ?? throw new ArgumentNullException(nameof(blogRepository));
            _environment = environment ?? throw new ArgumentNullException(nameof(environment));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        // Blog Endpoints
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<Blog>>> GetBlogs([FromQuery] bool includeDeleted = false)
        {
            var blogs = await _blogRepository.GetAllBlogsAsync(includeDeleted);
            return Ok(blogs);
        }

        [HttpGet("newest/{limit}")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<Blog>>> GetNewestBlogs(int limit)
        {
            var blogs = await _blogRepository.GetNewestBlogsAsync(limit);
            return Ok(blogs);
        }

        [HttpGet("byType/{blogTypeId}")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<Blog>>> GetBlogsByType(int blogTypeId, [FromQuery] bool includeDeleted = false)
        {
            var blogs = await _blogRepository.GetBlogsByTypeAsync(blogTypeId, includeDeleted);
            return Ok(blogs);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<Blog>> GetBlog(int id)
        {
            var blog = await _blogRepository.GetBlogByIdAsync(id);
            if (blog == null)
            {
                _logger.LogWarning("Blog with id={BlogId} not found", id);
                return NotFound();
            }
            return Ok(blog);
        }

        [HttpPost]
        public async Task<ActionResult<Blog>> CreateBlog([FromBody] BlogCreateModel model)
        {
            var blog = new Blog
            {
                Title = model.Title,
                Content = await ProcessBlogContent(model.Content),
                IsPublished = model.IsPublished,
                Publication = DateTime.UtcNow,
                UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            };

            // Handle tags
            blog.BlogTags = model.TagIds.Select(tagId => new BlogTag
            {
                TagID = tagId
            }).ToList();

            // Handle blog types
            blog.MappingTypes = model.BlogTypeIds.Select(typeId => new MappingType
            {
                BlogTypeID = typeId
            }).ToList();

            var createdBlog = await _blogRepository.CreateBlogAsync(blog);
            _logger.LogInformation("Blog created successfully with id={BlogId}", createdBlog.BlogID);
            return CreatedAtAction(nameof(GetBlog), new { id = createdBlog.BlogID }, createdBlog);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<Blog>> UpdateBlog(int id, [FromBody] BlogUpdateModel model)
        {
            var existingBlog = await _blogRepository.GetBlogByIdAsync(id);
            if (existingBlog == null)
            {
                _logger.LogWarning("Blog with id={BlogId} not found", id);
                return NotFound();
            }

            existingBlog.Title = model.Title;
            existingBlog.Content = await ProcessBlogContent(model.Content);
            existingBlog.IsPublished = model.IsPublished;

            // Update tags
            existingBlog.BlogTags.Clear();
            existingBlog.BlogTags = model.TagIds.Select(tagId => new BlogTag
            {
                BlogID = id,
                TagID = tagId
            }).ToList();

            // Update blog types
            existingBlog.MappingTypes.Clear();
            existingBlog.MappingTypes = model.BlogTypeIds.Select(typeId => new MappingType
            {
                BlogID = id,
                BlogTypeID = typeId
            }).ToList();

            var updatedBlog = await _blogRepository.UpdateBlogAsync(existingBlog);
            _logger.LogInformation("Blog updated successfully with id={BlogId}", id);
            return Ok(updatedBlog);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> SoftDeleteBlog(int id)
        {
            var result = await _blogRepository.SoftDeleteBlogAsync(id);
            if (!result)
            {
                _logger.LogWarning("Blog with id={BlogId} not found for soft delete", id);
                return NotFound();
            }
            _logger.LogInformation("Blog soft deleted successfully with id={BlogId}", id);
            return NoContent();
        }

        [HttpDelete("{id}/permanent")]
        public async Task<ActionResult> DeleteBlogPermanently(int id)
        {
            var result = await _blogRepository.DeleteBlogPermanentlyAsync(id);
            if (!result)
            {
                _logger.LogWarning("Blog with id={BlogId} not found for permanent delete", id);
                return NotFound();
            }
            _logger.LogInformation("Blog permanently deleted successfully with id={BlogId}", id);
            return NoContent();
        }

        [HttpPut("{id}/restore")]
        public async Task<IActionResult> RestoreBlog(int id)
        {
            try
            {
                var result = await _blogRepository.RestoreBlogAsync(id);
                if (!result)
                {
                    _logger.LogWarning("Blog with id={BlogId} not found for restore", id);
                    return NotFound();
                }
                _logger.LogInformation("Blog restored successfully with id={BlogId}", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while restoring the blog with id={BlogId}", id);
                return StatusCode(500, "An error occurred while restoring the blog.");
            }
        }

        // BlogType Endpoints
        [HttpGet("type")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<BlogType>>> GetBlogTypes([FromQuery] bool includeDeleted = false)
        {
            var types = await _blogRepository.GetAllBlogTypesAsync(includeDeleted);
            return Ok(types);
        }

        [HttpPost("type")]
        public async Task<ActionResult<BlogType>> CreateBlogType([FromBody] BlogTypeModel model)
        {
            var blogType = new BlogType
            {
                Name = model.Name,
                Description = model.Description
            };

            var createdType = await _blogRepository.CreateBlogTypeAsync(blogType);
            _logger.LogInformation("Blog type created successfully with id={BlogTypeId}", createdType.BlogTypeID);
            return CreatedAtAction(nameof(GetBlogTypes), new { id = createdType.BlogTypeID }, createdType);
        }

        [HttpPut("{id}/publish")]
        public async Task<ActionResult<Blog>> PublishBlog(int id)
        {
            try
            {
                var blog = await _blogRepository.PublishBlogAsync(id);
                if (blog == null)
                {
                    _logger.LogWarning("Blog with id={BlogId} not found for publishing", id);
                    return NotFound();
                }
                _logger.LogInformation("Blog published successfully with id={BlogId}", id);
                return Ok(blog);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while publishing the blog with id={BlogId}", id);
                return StatusCode(500, "An error occurred while publishing the blog.");
            }
        }

        [HttpPut("{id}/unpublish")]
        public async Task<ActionResult<Blog>> UnpublishBlog(int id)
        {
            try
            {
                var blog = await _blogRepository.UnpublishBlogAsync(id);
                if (blog == null)
                {
                    _logger.LogWarning("Blog with id={BlogId} not found for unpublishing", id);
                    return NotFound();
                }
                _logger.LogInformation("Blog unpublished successfully with id={BlogId}", id);
                return Ok(blog);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while unpublishing the blog with id={BlogId}", id);
                return StatusCode(500, "An error occurred while unpublishing the blog.");
            }
        }

        [HttpPut("{id}/increment-view")]
        [AllowAnonymous]
        public async Task<IActionResult> IncrementViewCount(int id)
        {
            try
            {
                await _blogRepository.IncrementViewCountAsync(id);
                _logger.LogInformation("View count incremented successfully for blog with id={BlogId}", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while incrementing the view count for blog with id={BlogId}", id);
                return StatusCode(500, "An error occurred while incrementing the view count.");
            }
        }

        // Tag Endpoints
        [HttpGet("tags")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<Tag>>> GetTags()
        {
            var tags = await _blogRepository.GetAllTagsAsync();
            return Ok(tags);
        }

        [HttpPost("tags")]
        public async Task<ActionResult<Tag>> CreateTag([FromBody] TagModel model)
        {
            var tag = new Tag
            {
                TagName = model.Name
            };

            var createdTag = await _blogRepository.CreateTagAsync(tag);
            _logger.LogInformation("Tag created successfully with id={TagId}", createdTag.TagID);
            return CreatedAtAction(nameof(GetTags), new { id = createdTag.TagID }, createdTag);
        }

        private async Task<string> ProcessBlogContent(string content)
        {
            var baseUrl = "/api/Image";
            var regex = new Regex(@"src=""(.*?)""");
            var matches = regex.Matches(content);

            foreach (Match match in matches)
            {
                var imageUrl = match.Groups[1].Value;

                if (imageUrl.StartsWith("data:image"))
                {
                    var newImagePath = await SaveBase64Image(imageUrl);
                    content = content.Replace(imageUrl, $"{baseUrl}{newImagePath}");
                }
                else if (imageUrl.Contains("/uploads/temp-"))
                {
                    var newImagePath = await MoveTempImageToPermanent(imageUrl);
                    content = content.Replace(imageUrl, $"{baseUrl}{newImagePath}");
                }
                else if (imageUrl.StartsWith("/uploads/") && !imageUrl.StartsWith(baseUrl))
                {
                    content = content.Replace(imageUrl, $"{baseUrl}{imageUrl}");
                }
            }

            return content;
        }


        private async Task<string> MoveTempImageToPermanent(string tempImagePath)
        {
            var fileName = Path.GetFileName(tempImagePath);
            var tempFolder = Path.Combine(_environment.ContentRootPath, "uploads", "temp");
            var permanentFolder = Path.Combine(_environment.ContentRootPath, "uploads", "blog-images");

            // Ensure permanent folder exists
            Directory.CreateDirectory(permanentFolder);

            var tempFilePath = Path.Combine(tempFolder, fileName);
            var permanentFileName = $"{Guid.NewGuid()}_{fileName}";
            var permanentFilePath = Path.Combine(permanentFolder, permanentFileName);

            // Move file
            System.IO.File.Move(tempFilePath, permanentFilePath);

            return $"/uploads/blog-images/{permanentFileName}";
        }

        private List<string> ExtractImageUrls(string content)
        {
            var urls = new List<string>();
            var regex = new Regex(@"src=""(.*?)""");
            var matches = regex.Matches(content);
            foreach (Match match in matches)
            {
                urls.Add(match.Groups[1].Value);
            }
            return urls;
        }

        private async Task<string> SaveBase64Image(string base64String)
        {
            var imageData = base64String.Split(',')[1];
            var bytes = Convert.FromBase64String(imageData);
            var fileName = $"{Guid.NewGuid()}.jpg";
            var filePath = Path.Combine(_environment.ContentRootPath, "uploads", fileName);

            Directory.CreateDirectory(Path.Combine(_environment.ContentRootPath, "uploads"));
            await System.IO.File.WriteAllBytesAsync(filePath, bytes);

            return $"/uploads/{fileName}";
        }
    }
}
