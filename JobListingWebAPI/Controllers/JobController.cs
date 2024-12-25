using JobListingWebAPI.Entities;
using JobListingWebAPI.Models;
using JobListingWebAPI.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;

namespace JobListingWebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class JobController : ControllerBase
    {
        private readonly IJobListingRepository _jobListingRepository;

        public JobController(IJobListingRepository jobListingRepository)
        {
            _jobListingRepository = jobListingRepository;
        }

        /// <summary>
        /// Lấy danh sách tất cả công việc
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<JobListing>>> GetAllJobListings()
        {
            var jobListings = await _jobListingRepository.GetAllJobListingsAsync();
            return Ok(jobListings);
        }

        /// <summary>
        /// Lấy danh sách tất cả công việc kể cả đã xóa
        /// </summary>
        /// <returns></returns>
        [HttpGet("admin")]
        public async Task<ActionResult<IEnumerable<JobListing>>> Admin_GetAllJobListings()
        {
            var jobListings = await _jobListingRepository.Admin_GetAllJobListingsAsync();
            return Ok(jobListings);
        }

        [HttpGet("unapproved")]
        public async Task<ActionResult<IEnumerable<JobListing>>> Admin_GetAllUnApprovedJobListings()
        {
            var jobListings = await _jobListingRepository.Admin_GetAllUnApprovedJobListingsAsync();
            return Ok(jobListings);
        }

        /// <summary>
        /// Lấy công việc theo id
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<JobListing>> GetJobListingById(int id)
        {
            var jobListing = await _jobListingRepository.GetJobListingByIdAsync(id);
            if (jobListing == null)
            {
                return NotFound($"Không tìm thấy danh sách việc làm có ID {id}.");
            }
            var response = jobListing;

            return Ok(response);
        }

        /// <summary>
        /// Lấy danh sách cấp độ công việc
        /// </summary>
        /// <returns></returns>
        [HttpGet("levels")]
        public async Task<ActionResult<IEnumerable<JobLevel>>> GetJobLevels()
        {
            try
            {
                var jobLevels = await _jobListingRepository.GetAllJobLevelsAsync();
                return Ok(jobLevels);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        /// <summary>
        /// Thêm công việc mới
        /// </summary>
        /// <param name="jobModel"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult<JobListing>> AddJob([FromBody] JobModel jobModel)
        {

            try
            {
                var jobListing = new JobListing
                {
                    Title = jobModel.Title,
                    Description = jobModel.Description,
                    Benefits = jobModel.Benefits,
                    Salary = jobModel.Salary,
                    CompanyID = jobModel.CompanyID,
                    Education = jobModel.Education,
                    JobLevelID = jobModel.JobLevelID,
                    IndustryID = jobModel.IndustryID,
                    MinimumQualifications = jobModel.MinimumQualifications,
                    NumberofRecruitment = jobModel.NumberofRecruitment,
                    LocationID = jobModel.LocationID,
                    PreferredLanguage = jobModel.PreferredLanguage,
                    JobDuties = jobModel.JobDuties,
                    ClosingDate = jobModel.ClosingDate,
                    IsUrgent = jobModel.IsUrgent,
                    Status = 3,
                    PostedDate = DateTime.UtcNow,
                };
                var created_jobListing = await _jobListingRepository.AddJobListingAsync(jobListing);
                return CreatedAtAction(
                    nameof(GetJobListingById),
                    new { id = created_jobListing.JobID },
                    created_jobListing
                );
            }
            catch (Exception ex)
            {
                // Log the exception
                return StatusCode(500, ex.Message);
            }
        }

        /// <summary>
        /// Cập nhật công việc
        /// </summary>
        /// <param name="id"></param>
        /// <param name="model"></param>
        /// <returns></returns>
        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateJob(int id, UpdateJobModel model)
        {
            try
            {
                var existingJob = await _jobListingRepository.GetJobListingByIdAsync(id);
                if (existingJob == null)
                {
                    return NotFound($"Không tìm thấy danh sách việc làm có ID {id}.");
                }

                existingJob.Title = model.Title;
                existingJob.Description = model.Description;
                existingJob.Benefits = model.Benefits;
                existingJob.Salary = model.Salary;
                existingJob.NumberofRecruitment = model.NumberofRecruitment;
                existingJob.JobLevelID = model.JobLevelID;
                existingJob.IndustryID = model.IndustryID;
                existingJob.MinimumQualifications = model.MinimumQualifications;
                existingJob.LocationID = model.LocationID;
                existingJob.PreferredLanguage = model.PreferredLanguage;
                existingJob.JobDuties = model.JobDuties;
                existingJob.ClosingDate = model.ClosingDate;
                existingJob.Education = model.Education;
                existingJob.UpdatedDate = DateTime.UtcNow;
                existingJob.IsUrgent = model.IsUrgent;

                await _jobListingRepository.UpdateJobListingAsync(existingJob);
                return Ok(new { message = "Job updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating the job", error = ex.Message });
            }
        }

        /// <summary>
        /// Khôi phục công việc đã xóa
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpPut("restore/{id}")]
        public async Task<ActionResult> RestoreJob(int id)
        {
            var success = await _jobListingRepository.RestoreJobListingAsync(id);
            if (!success)
            {
                return NotFound($"Không tìm thấy công việc có ID {id}.");
            }
            return Ok(new
            {
                message = $"Đã khôi phục công việc có ID {id} thành công.",
                jobId = id
            });
        }

        /// <summary>
        /// Xóa công việc tạm thời
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteJob(int id)
        {
            var success = await _jobListingRepository.DeleteJobListingAsync(id);
            if (!success)
            {
                return NotFound($"Không tìm thấy danh sách việc làm có ID {id}.");
            }
            return NoContent();
        }

        /// <summary>
        /// Xóa công việc vĩnh viễn
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpDelete("permanent/{id}")]
        public async Task<ActionResult> DeleteJobPermanently(int id)
        {
            var success = await _jobListingRepository.DeleteJobListingPermanentlyAsync(id);
            if (!success)
            {
                return NotFound($"Không tìm thấy danh sách việc làm có ID {id}.");
            }
            return NoContent();
        }

        /// <summary>
        /// Kiểm tra việc làm tồn tại
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet("exists/{id}")]
        public async Task<ActionResult<bool>> JobExists(int id)
        {
            var exists = await _jobListingRepository.JobListingExistsAsync(id);
            return Ok(exists);
        }

        /// <summary>
        /// Lấy danh sách công việc theo công ty
        /// </summary>
        /// <param name="companyId"></param>
        /// <returns></returns>
        [HttpGet("company/{companyId}")]
        public async Task<ActionResult<IEnumerable<JobListing>>> GetJobListingsByCompany(int companyId)
        {
            var jobListings = await _jobListingRepository.GetJobListingsByCompanyAsync(companyId);
            return Ok(jobListings);
        }

        /// <summary>
        /// Lấy danh sách công việc theo công ty kể cả đã xóa
        /// </summary>
        /// <param name="companyId"></param>
        /// <returns></returns>
        [HttpGet("admin/company/{companyId}")]
        public async Task<ActionResult<IEnumerable<JobListing>>> Admin_GetJobListingsByCompany(int companyId)
        {
            var jobListings = await _jobListingRepository.Admin_GetJobListingsByCompanyAsync(companyId);
            return Ok(jobListings);
        }

        /// <summary>
        /// Tìm kiếm công việc
        /// </summary>
        /// <param name="searchTerm"></param>
        /// <returns></returns>
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<JobListing>>> SearchJobListings(string searchTerm)
        {
            var jobListings = await _jobListingRepository.SearchJobListingsAsync(searchTerm);
            return Ok(jobListings);
        }

        /// <summary>
        /// Cập nhật trạng thái công việc
        /// </summary>
        /// <param name="id"></param>
        /// <param name="model"></param>
        /// <returns></returns>
        [HttpPut("{id}/status")]
        public async Task<ActionResult<JobListing>> UpdateJobStatus(int id, [FromBody] JobStatusUpdateModel model)
        {
            try
            {
                var jobListing = await _jobListingRepository.GetJobListingByIdAsync(id);
                if (jobListing == null)
                {
                    return NotFound($"Không tìm thấy việc làm có ID {id}.");
                }

                var updatedJob = await _jobListingRepository.UpdateJobStatusAsync(id, model.Status);

                // Convert the response to include string status
                var response = new
                {
                    updatedJob.JobID,
                    updatedJob.Title,
                    updatedJob.Description,
                    updatedJob.Status,
                    updatedJob.PostedDate,
                    updatedJob.CompanyID,
                    // Add other relevant properties
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi khi cập nhật trạng thái việc làm: {ex.Message}");
            }
        }

        /// <summary>
        /// Gia hạn thời hạn ứng tuyển
        /// </summary>
        /// <param name="id"></param>
        /// <param name="request"></param>
        /// <returns></returns>
        [HttpPut("{id}/extend")]
        public async Task<IActionResult> ExtendJob(int id, [FromBody] ExtendJobRequest request)
        {
            try
            {
                var result = await _jobListingRepository.ExtendJobAsync(id, request.Days);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Có lỗi xảy ra khi gia hạn công việc: {ex.Message}");
            }
        }

        /// <summary>
        /// Lấy danh sách công việc đặc trưng
        /// </summary>
        /// <returns></returns>
        [HttpGet("featured")]
        public async Task<ActionResult<IEnumerable<JobListing>>> GetFeaturedJobListings()
        {
            var jobListings = await _jobListingRepository.GetFeaturedJobListings();
            return Ok(jobListings);
        }

        /// <summary>
        /// Chuyển đổi trạng thái đặc trưng của công việc(đặc trưng => không đặc trưng và ngược lại)
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpPut("toggle-feature/{id}")]
        public async Task<ActionResult> ToggleFeatureCompany(int id)
        {
            var success = await _jobListingRepository.ToggleFeatureJobAsync(id);
            if (!success)
            {
                return NotFound($"Không tìm thấy công việc có ID {id}.");
            }
            return Ok(new
            {
                message = $"Đã thay đổi trạng thái nổi bật của công việc có ID {id} thành công.",
                jobId = id
            });
        }
        [HttpPost("add-favorite")]
        public async Task<IActionResult> AddFavoriteJob([FromBody] AddFavoriteJobRequest request)
        {
            var userId = GetUserId(); // Implement this method to get the current user ID
            var favoriteJob = await _jobListingRepository.AddFavoriteJobAsync(userId, request.JobID);

            if (favoriteJob == null)
            {
                return NotFound("Job not found");
            }

            return Ok("Job added to favorites");
        }

        [HttpDelete("remove-favorite/{jobId}")]
        public async Task<IActionResult> RemoveFavoriteJob(int jobId)
        {
            var userId = GetUserId(); // Implement this method to get the current user ID
            await _jobListingRepository.RemoveFavoriteJobAsync(userId, jobId);

            return Ok("Job removed from favorites");
        }

        [HttpGet("favorite-jobs")]
        public async Task<IActionResult> GetFavoriteJobs()
        {
            var userId = GetUserId(); // Implement this method to get the current user ID
            var favoriteJobs = await _jobListingRepository.GetFavoriteJobListingsAsync(userId);

            return Ok(favoriteJobs);
        }

        private string GetUserId()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return "";
            return userId;
        }

    }
}
