using JobListingWebAPI.Entities;
using JobListingWebAPI.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace JobListingWebAPI.Repositories
{
    public interface ILocationRepository
    {
        Task<IEnumerable<Location>> GetAllLocationsAsync();
        Task<LocationModel> GetLocationByIdAsync(int id);
        Task<LocationModel> AddLocationAsync(LocationModel location);
        Task<LocationModel> UpdateLocationAsync(int id, LocationModel location);
        Task<bool> DeleteLocationAsync(int id);
        Task<bool> LocationExistsAsync(int id);
        Task<IEnumerable<Location>> SearchLocationsAsync(string searchTerm);
    }
}
