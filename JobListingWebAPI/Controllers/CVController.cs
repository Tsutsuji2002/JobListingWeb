using JobListingWebAPI.Entities;
using JobListingWebAPI.Models;
using JobListingWebAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace JobListingWebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CVController : ControllerBase
    {
        private readonly ICVService _cvService;
        private readonly ILogger<CVController> _logger;

        public CVController(ICVService cvService, ILogger<CVController> logger)
        {
            _cvService = cvService;
            _logger = logger;
        }

        [HttpPost("upload")]
        public async Task<ActionResult<CVModel>> UploadCV([FromForm] CVUploadModel cVUploadModel)
        {

            try
            {
                if (string.IsNullOrEmpty(cVUploadModel.UserId))
                {
                    return Unauthorized();
                }

                var cv = await _cvService.UploadCVAsync(cVUploadModel.File, cVUploadModel.UserId);
                _logger.LogError("CV uploaded successfully");
                return Ok(CVModel.FromCV(cv));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception occurred during upload");
                throw;
            }
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(CVModel), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<CVModel>> GetCV(int id)
        {
            try
            {
                var cv = await _cvService.GetCVAsync(id);
                if (cv == null)
                    return NotFound();

                // Check authorization
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId) || cv.UserId != userId)
                    return Forbid();

                return Ok(CVModel.FromCV(cv));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving CV {Id}", id);
                return StatusCode(500, "Error retrieving CV");
            }
        }

        [HttpGet("{id}/download")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> DownloadCV(int id)
        {
            try
            {
                var cv = await _cvService.GetCVAsync(id);
                if (cv == null)
                    return NotFound();

                // Check authorization
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId) || cv.UserId != userId)
                    return Forbid();

                var stream = await _cvService.DownloadCVAsync(id);
                return File(stream, cv.ContentType, cv.FileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error downloading CV {Id}", id);
                return StatusCode(500, "Error downloading CV");
            }
        }

        [HttpGet("user/{userId}")]
        [ProducesResponseType(typeof(IEnumerable<CV>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<IEnumerable<CV>>> GetUserCVs(string userId)
        {
            try
            {
                //var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized();

                var cvs = await _cvService.GetUserCVsAsync(userId);
                return Ok(cvs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user CVs");
                return StatusCode(500, "Error retrieving CVs");
            }
        }

        [HttpDelete("permanent/{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> DeleteCV(int id)
        {
            try
            {
                var cv = await _cvService.GetCVAsync(id);
                if (cv == null)
                    return NotFound(new { Message = "CV not found." });

                // Check authorization
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId) || cv.UserId != userId)
                    return StatusCode(StatusCodes.Status403Forbidden, new { Message = "You are not authorized to delete this CV." });

                var result = await _cvService.DeleteCVAsync(id);
                if (result)
                    return Ok(new { Message = "CV deleted successfully." });

                return NotFound(new { Message = "Failed to delete CV. It may not exist." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting CV {Id}", id);
                return StatusCode(500, new { Message = "An error occurred while deleting the CV. Please try again later." });
            }
        }
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> SoftDeleteCV(int id)
        {
            try
            {
                var cv = await _cvService.GetCVAsync(id);
                if (cv == null)
                    return NotFound(new { Message = "CV not found." });

                // Check authorization
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId) || cv.UserId != userId)
                    return StatusCode(StatusCodes.Status403Forbidden, new { Message = "You are not authorized to delete this CV." });

                var result = await _cvService.SoftDeleteCVAsync(id);
                if (result)
                    return Ok(new { Message = "CV deleted successfully." });

                return NotFound(new { Message = "Failed to delete CV. It may not exist." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting CV {Id}", id);
                return StatusCode(500, new { Message = "An error occurred while deleting the CV. Please try again later." });
            }
        }

        [HttpGet("preview/{cvId}")]
        public async Task<IActionResult> PreviewCV(int cvId)
        {
            try
            {
                var cv = await _cvService.GetCVAsync(cvId);
                if (cv == null)
                    return NotFound("CV not found");

                // Generate a temporary, signed URL or use a secure serving method
                var previewOptions = new
                {
                    url = Url.Action("ServeCV", "CV", new { cvId }, Request.Scheme),
                    contentType = cv.ContentType
                };

                return Ok(previewOptions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CV preview");
                return StatusCode(500, "An error occurred while generating CV preview");
            }
        }
        [HttpGet("serve/{cvId}")]
        public async Task<IActionResult> ServeCV(int cvId)
        {
            try
            {
                var fileStream = await _cvService.DownloadCVAsync(cvId);
                var cv = await _cvService.GetCVAsync(cvId);

                return File(fileStream, cv.ContentType);
            }
            catch (FileNotFoundException)
            {
                return NotFound("CV file not found");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error serving CV");
                return StatusCode(500, "An error occurred while serving the CV");
            }
        }
    }
}
