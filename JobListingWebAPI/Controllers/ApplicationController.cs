using JobListingWebAPI.Entities;
using JobListingWebAPI.Models;
using JobListingWebAPI.Repositories;
using JobListingWebAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace JobListingWebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    //[Authorize]
    public class ApplicationController : ControllerBase
    {
        private readonly IApplicationRepository _applicationRepository;
        private readonly ICVService _cvService;
        private readonly IJobListingRepository _jobListingRepository;
        private readonly ILogger<ApplicationController> _logger;
        private readonly UserManager<ApplicationUser> _userManager;

        public ApplicationController(
            IApplicationRepository applicationRepository,
            ICVService cvService,
            IJobListingRepository jobListingRepository,
            ILogger<ApplicationController> logger,
            UserManager<ApplicationUser> userManager)
        {
            _applicationRepository = applicationRepository;
            _cvService = cvService;
            _jobListingRepository = jobListingRepository;
            _logger = logger;
            _userManager = userManager;
        }

        [HttpGet("user")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<IEnumerable<Application>>> GetUserApplications()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            try
            {
                var applications = await _applicationRepository.GetApplicationsByUserIdAsync(userId);
                return Ok(applications);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user applications");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving applications");
            }
        }

        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<Application>> GetApplication(int id)
        {
            try
            {
                var application = await _applicationRepository.GetApplicationByIdAsync(id);

                if (application == null)
                    return NotFound();

                // Ensure user can only access their own applications
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (application.UserId != userId)
                    return Forbid();

                return Ok(application);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving application {ApplicationId}", id);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving the application");
            }
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<ActionResult<Application>> CreateApplication([FromBody] ApplicationSubmissionModel model)
        {
            try
            {
                // Get current user
                var userId = model.UserId;
                var user = await _userManager.FindByIdAsync(userId);

                // Validate job listing
                var jobListing = await _jobListingRepository.GetJobListingByIdAsync(model.JobID);
                if (jobListing == null)
                    return BadRequest("Invalid job listing");

                // Check if job is still open for applications
                if (jobListing.Status != 1) // Assuming 1 means active
                    return BadRequest("Job is no longer accepting applications");

                // Check if user has already applied
                var existingApplication = await _applicationRepository.HasUserAppliedToJobAsync(userId, model.JobID);
                if (existingApplication)
                    return Conflict("Bạn đã nộp đơn xin việc này");

                // Validate CV if provided
                CV cv = null;
                if (model.CVID.HasValue)
                {
                    cv = await _cvService.GetCVAsync(model.CVID.Value);
                    if (cv == null || cv.UserId != userId)
                        return BadRequest("Invalid CV");
                }

                // Create application
                var application = new Application
                {
                    JobID = model.JobID,
                    UserId = userId,
                    CVID = model.CVID,
                    CoverLeter = model.CoverLetter,
                    ApplicationDate = DateTime.UtcNow,
                    Status = "Chờ duyệt"
                };

                var createdApplication = await _applicationRepository.CreateApplicationAsync(application);

                return CreatedAtAction(
                    nameof(GetApplication),
                    new { id = createdApplication.ApplicationID },
                    createdApplication
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating application for job {JobId}", model.JobID);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while creating the application");
            }
        }

        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateApplication(int id, [FromBody] ApplicationSubmissionModel model)
        {
            try
            {
                // Retrieve existing application
                var existingApplication = await _applicationRepository.GetApplicationByIdAsync(id);
                if (existingApplication == null)
                    return NotFound();

                // Check if application can be modified (e.g., not in a final state)
                if (existingApplication.Status != "Chờ duyệt")
                    return BadRequest("Application cannot be modified in its current state");

                // Validate CV if provided
                if (model.CVID.HasValue)
                {
                    var cv = await _cvService.GetCVAsync(model.CVID.Value);
                    if (cv == null || cv.UserId != model.UserId)
                        return BadRequest("Invalid CV");
                }

                // Update application
                existingApplication.CVID = model.CVID;
                existingApplication.CoverLeter = model.CoverLetter;
                existingApplication.Status = model.Status;

                var updatedApplication = await _applicationRepository.UpdateApplicationAsync(existingApplication);

                return Ok(updatedApplication);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating application {ApplicationId}", id);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while updating the application");
            }
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteApplication(int id)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

                // Retrieve existing application
                var existingApplication = await _applicationRepository.GetApplicationByIdAsync(id);
                if (existingApplication == null)
                    return NotFound();

                // Ensure user can only delete their own applications
                if (existingApplication.UserId != userId)
                    return Forbid();

                // Check if application can be deleted (e.g., only pending applications)
                if (existingApplication.Status != "Chờ duyệt")
                    return BadRequest("Application cannot be deleted in its current state");

                var result = await _applicationRepository.DeleteApplicationAsync(id);

                return result ? NoContent() : StatusCode(StatusCodes.Status500InternalServerError, "Failed to delete application");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting application {ApplicationId}", id);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while deleting the application");
            }
        }
        [HttpGet("all")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<IEnumerable<Application>>> GetAllApplications()
        {
            try
            {
                // Ensure only admins can access this
                if (!User.IsInRole("Admin"))
                    return Forbid();

                var applications = await _applicationRepository.GetAllApplicationsAsync();
                return Ok(applications);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all applications");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving applications");
            }
        }

        [HttpGet("job/{jobId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<IEnumerable<Application>>> GetApplicationsByJobId(int jobId)
        {
            try
            {
                var applications = await _applicationRepository.GetApplicationsByJobIdAsync(jobId);
                return Ok(applications);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving applications for job {JobId}", jobId);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving applications");
            }
        }

        [HttpGet("check/{jobId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<bool>> HasUserAppliedToJob(int jobId)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

                var hasApplied = await _applicationRepository.HasUserAppliedToJobAsync(userId, jobId);
                return Ok(hasApplied);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if user {UserId} has applied to job {JobId}", User.FindFirstValue(ClaimTypes.NameIdentifier), jobId);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while checking application status");
            }
        }
    }
}
