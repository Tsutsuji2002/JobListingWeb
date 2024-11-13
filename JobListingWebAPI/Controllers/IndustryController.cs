using JobListingWebAPI.Data;
using JobListingWebAPI.Entities;
using JobListingWebAPI.Models;
using JobListingWebAPI.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JobListingWebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class IndustryController : ControllerBase
    {
        private readonly IIndustryRepository _industryRepository;
        private readonly JobListingWebDbContext _context;

        public IndustryController(IIndustryRepository industryRepository, JobListingWebDbContext context)
        {
            _industryRepository = industryRepository;
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Industry>>> GetAllIndustries()
        {
            var industries = await _industryRepository.GetAllIndustriesAsync();
            return Ok(industries);
        }

        [HttpPost]
        public async Task<ActionResult<IndustryModel>> AddIndustry(IndustryModel industryModel)
        {
            try
            {
                var createdIndustry = await _industryRepository.AddIndustryAsync(industryModel);

                await Task.Delay(100);

                var createdEntity = await _context.Industries
                    .OrderByDescending(i => i.IndustryID)
                    .FirstOrDefaultAsync(i => i.Name == industryModel.Name
                                         && i.Description == industryModel.Description);

                if (createdEntity == null)
                {
                    return StatusCode(500, "Created industry could not be retrieved. Please try getting the industry list to verify creation.");
                }

                return CreatedAtAction(
                    nameof(GetIndustryById),
                    new { id = createdEntity.IndustryID },
                    createdIndustry
                );
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while creating the industry.");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateIndustry(int id, IndustryModel industryModel)
        {
            try
            {
                var updatedIndustry = await _industryRepository.UpdateIndustryAsync(id, industryModel);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound($"Không tìm thấy ngành có ID {id}.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while updating the industry.");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<IndustryModel>> GetIndustryById(int id)
        {
            try
            {
                var industry = await _context.Industries.FindAsync(id);
                if (industry == null)
                {
                    return NotFound($"Không tìm thấy ngành có ID {id}.");
                }

                return new IndustryModel
                {
                    Name = industry.Name,
                    Description = industry.Description
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while retrieving the industry.");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteIndustry(int id)
        {
            var success = await _industryRepository.DeleteIndustryAsync(id);
            if (!success)
            {
                return NotFound($"Không tìm thấy ngành có ID {id}.");
            }
            return NoContent();
        }

        [HttpGet("exists/{id}")]
        public async Task<ActionResult<bool>> IndustryExists(int id)
        {
            var exists = await _industryRepository.IndustryExistsAsync(id);
            return Ok(exists);
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<Industry>>> SearchIndustries(string searchTerm)
        {
            var industries = await _industryRepository.SearchIndustriesAsync(searchTerm);
            return Ok(industries);
        }
    }
}
