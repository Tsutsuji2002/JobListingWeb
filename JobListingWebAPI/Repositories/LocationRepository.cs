using JobListingWebAPI.Data;
using JobListingWebAPI.Entities;
using JobListingWebAPI.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace JobListingWebAPI.Repositories
{
    public class LocationRepository : ILocationRepository
    {
        private readonly JobListingWebDbContext _context;

        public LocationRepository(JobListingWebDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Location>> GetAllLocationsAsync()
        {
            return await _context.Locations
                .Where(l => !l.IsDeleted)
                .Include(l => l.MappingLocations)
                .ToListAsync();
        }

        public async Task<LocationModel> GetLocationByIdAsync(int id)
        {
            var location = await _context.Locations
                .Where(l => l.LocationID == id && !l.IsDeleted)
                .FirstOrDefaultAsync();

            if (location == null)
            {
                throw new KeyNotFoundException($"Location with ID {id} not found.");
            }

            return new LocationModel
            {
                Name = location.Name,
                State = location.State,
                Country = location.Country,
                PostalCode = location.PostalCode
            };
        }

        public async Task<LocationModel> AddLocationAsync(LocationModel locationModel)
        {
            var location = new Location
            {
                Name = locationModel.Name,
                State = locationModel.State,
                Country = locationModel.Country,
                PostalCode = locationModel.PostalCode
            };

            _context.Locations.Add(location);
            await _context.SaveChangesAsync();

            return new LocationModel
            {
                Name = location.Name,
                State = location.State,
                Country = location.Country,
                PostalCode = location.PostalCode
            };
        }

        public async Task<LocationModel> UpdateLocationAsync(int id, LocationModel locationModel)
        {
            var location = await _context.Locations.FindAsync(id);
            if (location == null)
            {
                throw new KeyNotFoundException($"Location with ID {id} not found.");
            }

            location.Name = locationModel.Name;
            location.State = locationModel.State;
            location.Country = locationModel.Country;
            location.PostalCode = locationModel.PostalCode;

            _context.Entry(location).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return new LocationModel
            {
                Name = location.Name,
                State = location.State,
                Country = location.Country,
                PostalCode = location.PostalCode
            };
        }


        public async Task<bool> DeleteLocationAsync(int id)
        {
            var location = await _context.Locations.FindAsync(id);
            if (location == null)
                return false;

            location.IsDeleted = true;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> LocationExistsAsync(int id)
        {
            return await _context.Locations.AnyAsync(l => l.LocationID == id && !l.IsDeleted);
        }

        public async Task<IEnumerable<Location>> SearchLocationsAsync(string searchTerm)
        {
            return await _context.Locations
                .Where(l => !l.IsDeleted &&
                    ((l.Name != null && l.Name.Contains(searchTerm)) ||
                     (l.State != null && l.State.Contains(searchTerm)) ||
                     (l.Country != null && l.Country.Contains(searchTerm)) ||
                     (l.PostalCode != null && l.PostalCode.Contains(searchTerm))))
                .Include(l => l.MappingLocations)
                .ToListAsync();
        }
    }
}
