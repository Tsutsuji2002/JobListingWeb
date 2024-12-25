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

        /// <summary>
        /// Lấy toàn bộ các địa điểm
        /// </summary>
        /// <returns></returns>
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

        /// <summary>
        /// Lấy toàn bộ các địa điểm kể cả đã xóa
        /// </summary>
        /// <returns></returns>
        [HttpGet("admin")]
        public async Task<ActionResult<IEnumerable<LocationModel>>> Admin_GetAllLocations()
        {
            try
            {
                var locations = await _locationRepository.Admin_GetAllLocationsAsync();
                return Ok(locations);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while retrieving locations.");
            }
        }

        /// <summary>
        /// Lấy địa điểm với id
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
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

        /// <summary>
        /// Tìm địa điểm
        /// </summary>
        /// <param name="searchTerm"></param>
        /// <returns></returns>
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


        /// <summary>
        /// Thêm địa điểm
        /// </summary>
        /// <param name="locationModel"></param>
        /// <returns></returns>
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

        /// <summary>
        /// Cập nhật địa điểm
        /// </summary>
        /// <param name="id"></param>
        /// <param name="locationModel"></param>
        /// <returns></returns>
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

        /// <summary>
        /// Xóa địa điểm tạm thời
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
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

        /// <summary>
        /// Khôi phục địa điểm
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpPut("restore/{id}")]
        public async Task<ActionResult> RestoreLocation(int id)
        {
            try
            {
                if (!await _locationRepository.LocationDeletedAsync(id))
                {
                    return NotFound($"Location deleted with ID {id} not found.");
                }

                var result = await _locationRepository.RestoreLocationAsync(id);
                if (!result)
                {
                    return NotFound($"Location with ID {id} not found.");
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while restoring the location.");
            }
        }

        /// <summary>
        /// Xóa địa điểm vĩnh viễn
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpDelete("permanent/{id}")]
        public async Task<ActionResult> DeleteLocationPermanently(int id)
        {
            try
            {
                var result = await _locationRepository.DeleteLocationPermanentlyAsync(id);
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
