using JobListingWebAPI.Models;
using JobListingWebAPI.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace JobListingWebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CareerController : ControllerBase
    {
        private readonly ICareerRepository _careerRepository;

        public CareerController(ICareerRepository careerRepository)
        {
            _careerRepository = careerRepository;
        }

        // GET: api/Career
        [HttpGet]
        public async Task<IActionResult> GetAllCareers()
        {
            var careers = await _careerRepository.GetAllCareersAsync();
            return Ok(careers);
        }

        // GET: api/Career/{careerId}
        [HttpGet("{careerId}")]
        public async Task<IActionResult> GetCareerById(int careerId)
        {
            var career = await _careerRepository.GetCareerByIdAsync(careerId);
            if (career == null)
                return NotFound($"Career with ID {careerId} not found.");

            return Ok(career);
        }

        // POST: api/Career
        [HttpPost]
        public async Task<IActionResult> AddCareer([FromBody] CareerModel careerModel)
        {
            if (careerModel == null)
                return BadRequest("Career data is required.");

            var createdCareer = await _careerRepository.AddCareerAsync(careerModel);
            return CreatedAtAction(nameof(GetCareerById), new { careerId = createdCareer.Name }, createdCareer);
        }

        // PUT: api/Career/{careerId}
        [HttpPut("{careerId}")]
        public async Task<IActionResult> UpdateCareer(int careerId, [FromBody] CareerModel careerModel)
        {
            if (careerModel == null)
                return BadRequest("Career data is required.");

            var isUpdated = await _careerRepository.UpdateCareerAsync(careerId, careerModel);
            if (!isUpdated)
                return NotFound($"Career with ID {careerId} not found or already deleted.");

            return NoContent();
        }

        // DELETE: api/Career/{careerId}
        [HttpDelete("{careerId}")]
        public async Task<IActionResult> DeleteCareer(int careerId)
        {
            var isDeleted = await _careerRepository.DeleteCareerAsync(careerId);
            if (!isDeleted)
                return NotFound($"Career with ID {careerId} not found or already deleted.");

            return NoContent();
        }

        // GET: api/Career/{careerId}/mappings
        [HttpGet("{careerId}/mappings")]
        public async Task<IActionResult> GetMappingsByCareerId(int careerId)
        {
            var mappings = await _careerRepository.GetMappingsByCareerIdAsync(careerId);
            return Ok(mappings);
        }

        // GET: api/Career/mappings/job/{jobId}
        [HttpGet("mappings/job/{jobId}")]
        public async Task<IActionResult> GetMappingsByJobId(int jobId)
        {
            var mappings = await _careerRepository.GetMappingsByJobIdAsync(jobId);
            return Ok(mappings);
        }

        // POST: api/Career/mappings
        [HttpPost("mappings")]
        public async Task<IActionResult> AddMapping([FromBody] MappingCareerModel mappingModel)
        {
            if (mappingModel == null)
                return BadRequest("Mapping data is required.");

            var createdMapping = await _careerRepository.AddMappingAsync(mappingModel);
            return CreatedAtAction(nameof(GetMappingsByCareerId), new { careerId = createdMapping.CareerID }, createdMapping);
        }

        // DELETE: api/Career/mappings/{mapId}
        [HttpDelete("mappings/{mapId}")]
        public async Task<IActionResult> DeleteMapping(int mapId)
        {
            var isDeleted = await _careerRepository.DeleteMappingAsync(mapId);
            if (!isDeleted)
                return NotFound($"Mapping with ID {mapId} not found.");

            return NoContent();
        }
    }
}
