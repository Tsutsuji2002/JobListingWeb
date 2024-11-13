using JobListingWebAPI.Entities;
using JobListingWebAPI.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

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

        [HttpGet]
        public async Task<ActionResult<IEnumerable<JobListing>>> GetAllJobListings()
        {
            var jobListings = await _jobListingRepository.GetAllJobListingsAsync();
            return Ok(jobListings);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<JobListing>> GetJobListingById(int id)
        {
            var jobListing = await _jobListingRepository.GetJobListingByIdAsync(id);
            if (jobListing == null)
            {
                return NotFound($"Không tìm thấy danh sách việc làm có ID {id}.");
            }
            return Ok(jobListing);
        }

        [HttpPost]
        public async Task<ActionResult<JobListing>> AddJob(JobListing jobListing)
        {
            var createdJobListing = await _jobListingRepository.AddJobListingAsync(jobListing);
            return CreatedAtAction(nameof(GetJobListingById), new { id = createdJobListing.JobID }, createdJobListing);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateJob(int id, JobListing jobListing)
        {
            if (id != jobListing.JobID)
            {
                return BadRequest("Job Listing ID mismatch.");
            }

            var existingJobListing = await _jobListingRepository.GetJobListingByIdAsync(id);
            if (existingJobListing == null)
            {
                return NotFound($"Không tìm thấy danh sách việc làm có ID {id}.");
            }

            await _jobListingRepository.UpdateJobListingAsync(jobListing);
            return NoContent();
        }

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

        [HttpGet("exists/{id}")]
        public async Task<ActionResult<bool>> JobExists(int id)
        {
            var exists = await _jobListingRepository.JobListingExistsAsync(id);
            return Ok(exists);
        }

        [HttpGet("company/{companyId}")]
        public async Task<ActionResult<IEnumerable<JobListing>>> GetJobListingsByCompany(int companyId)
        {
            var jobListings = await _jobListingRepository.GetJobListingsByCompanyAsync(companyId);
            return Ok(jobListings);
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<JobListing>>> SearchJobListings(string searchTerm)
        {
            var jobListings = await _jobListingRepository.SearchJobListingsAsync(searchTerm);
            return Ok(jobListings);
        }
    }
}
