using JobListingWebAPI.Models;
using JobListingWebAPI.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace JobListingWebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LocationController : ControllerBase
    {
        private readonly ILocationRepository _locationRepository;

        public LocationController(ILocationRepository locationRepository)
        {
            _locationRepository = locationRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<LocationModel>>> GetAllLocations()
        {
            try
            {
                var locations = await _locationRepository.GetAllLocationsAsync();
                return Ok(locations);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while retrieving locations.");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<LocationModel>> GetLocationById(int id)
        {
            try
            {
                var location = await _locationRepository.GetLocationByIdAsync(id);
                return Ok(location);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while retrieving the location.");
            }
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<LocationModel>>> SearchLocations([FromQuery] string searchTerm)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(searchTerm))
                {
                    return BadRequest("Search term cannot be empty.");
                }

                var locations = await _locationRepository.SearchLocationsAsync(searchTerm);
                // Map Location to LocationModel
                var locationModels = locations.Select(l => new LocationModel
                {
                    Name = l.Name,
                    State = l.State,
                    Country = l.Country,
                    PostalCode = l.PostalCode
                });
                return Ok(locationModels);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while searching for locations.");
            }
        }

        [HttpPost]
        public async Task<ActionResult<LocationModel>> CreateLocation(LocationModel locationModel)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var createdLocation = await _locationRepository.AddLocationAsync(locationModel);

                var exists = await _locationRepository.SearchLocationsAsync(locationModel.Name);
                var createdEntity = exists.FirstOrDefault(l =>
                    l.Name == locationModel.Name &&
                    l.State == locationModel.State &&
                    l.Country == locationModel.Country &&
                    l.PostalCode == locationModel.PostalCode);

                if (createdEntity == null)
                {
                    return StatusCode(500, "Created location could not be retrieved.");
                }

                return CreatedAtAction(
                    nameof(GetLocationById),
                    new { id = createdEntity.LocationID },
                    createdLocation
                );
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while creating the location.");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateLocation(int id, LocationModel locationModel)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                if (!await _locationRepository.LocationExistsAsync(id))
                {
                    return NotFound($"Location with ID {id} not found.");
                }

                await _locationRepository.UpdateLocationAsync(id, locationModel);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while updating the location.");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteLocation(int id)
        {
            try
            {
                if (!await _locationRepository.LocationExistsAsync(id))
                {
                    return NotFound($"Location with ID {id} not found.");
                }

                var result = await _locationRepository.DeleteLocationAsync(id);
                if (!result)
                {
                    return NotFound($"Location with ID {id} not found.");
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while deleting the location.");
            }
        }
    }
}
