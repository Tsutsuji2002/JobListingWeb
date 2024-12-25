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

        /// <summary>
        /// Lấy toàn bộ ngành
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Industry>>> GetAllIndustries()
        {
            var industries = await _industryRepository.GetAllIndustriesAsync();
            return Ok(industries);
        }

        /// <summary>
        /// Lấy toàn bộ ngành kể cả đã xóa
        /// </summary>
        /// <returns></returns>
        [HttpGet("admin")]
        public async Task<ActionResult<IEnumerable<Industry>>> Admin_GetAllIndustries()
        {
            var industries = await _industryRepository.Admin_GetAllIndustriesAsync();
            return Ok(industries);
        }

        /// <summary>
        /// Thêm ngành mới
        /// </summary>
        /// <param name="industryModel"></param>
        /// <returns></returns>
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

        /// <summary>
        /// Cập nhật ngành
        /// </summary>
        /// <param name="id"></param>
        /// <param name="industryModel"></param>
        /// <returns></returns>
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

        /// <summary>
        /// Lấy ngành với id
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
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

        /// <summary>
        /// Khôi phục ngành đã xóa
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpPut("restore/{id}")]
        public async Task<ActionResult> RestoreIndustry(int id)
        {
            var success = await _industryRepository.RestoreIndustryAsync(id);
            if (!success)
            {
                return NotFound($"Không tìm thấy ngành có ID {id}.");
            }
            return NoContent();
        }

        /// <summary>
        /// Xóa ngành tạm thời
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
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

        /// <summary>
        /// Xóa ngành vĩnh viễn
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpDelete("permanent/{id}")]
        public async Task<ActionResult> DeleteIndustryPermanently(int id)
        {
            var success = await _industryRepository.DeleteIndustryPermanentlyAsync(id);
            if (!success)
            {
                return NotFound($"Không tìm thấy ngành có ID {id}.");
            }
            return NoContent();
        }

        /// <summary>
        /// Kiểm tra ngành tồn tại
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet("exists/{id}")]
        public async Task<ActionResult<bool>> IndustryExists(int id)
        {
            var exists = await _industryRepository.IndustryExistsAsync(id);
            return Ok(exists);
        }

        /// <summary>
        /// Tìm kiếm ngành
        /// </summary>
        /// <param name="searchTerm"></param>
        /// <returns></returns>
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<Industry>>> SearchIndustries(string searchTerm)
        {
            var industries = await _industryRepository.SearchIndustriesAsync(searchTerm);
            return Ok(industries);
        }
    }
}
