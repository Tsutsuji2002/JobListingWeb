using JobListingWebAPI.Data;
using JobListingWebAPI.Entities;
using JobListingWebAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace JobListingWebAPI.Repositories
{
    public class CareerRepository : ICareerRepository
    {
        private readonly JobListingWebDbContext _context;

        public CareerRepository(JobListingWebDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Career>> GetAllCareersAsync()
        {
            return await _context.Careers
                .Where(c => !c.IsDeleted)
                .ToListAsync();
        }

        public async Task<Career?> GetCareerByIdAsync(int careerId)
        {
            return await _context.Careers
                .Include(c => c.MappingCareers)
                .ThenInclude(mc => mc.JobListing)
                .FirstOrDefaultAsync(c => c.CareerID == careerId && !c.IsDeleted);
        }

        public async Task<CareerModel> AddCareerAsync(CareerModel careerModel)
        {
            var careerEntity = new Career
            {
                Name = careerModel.Name,
                Description = careerModel.Description,
                IsDeleted = false
            };

            _context.Careers.Add(careerEntity);
            await _context.SaveChangesAsync();

            return new CareerModel
            {
                Name = careerEntity.Name,
                Description = careerEntity.Description
            };
        }

        public async Task<bool> UpdateCareerAsync(int careerId, CareerModel careerModel)
        {
            var existingCareer = await _context.Careers.FindAsync(careerId);
            if (existingCareer == null || existingCareer.IsDeleted)
                return false;

            existingCareer.Name = careerModel.Name;
            existingCareer.Description = careerModel.Description;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteCareerAsync(int careerId)
        {
            var career = await _context.Careers.FindAsync(careerId);
            if (career == null || career.IsDeleted)
                return false;

            career.IsDeleted = true; // Soft delete
            await _context.SaveChangesAsync();
            return true;
        }
        public async Task<IEnumerable<MappingCareer>> GetMappingsByCareerIdAsync(int careerId)
        {
            return await _context.MappingCareers
                .Where(mc => mc.CareerID == careerId)
                .Include(mc => mc.JobListing)
                .ToListAsync();
        }

        public async Task<IEnumerable<MappingCareer>> GetMappingsByJobIdAsync(int jobId)
        {
            return await _context.MappingCareers
                .Where(mc => mc.JobID == jobId)
                .Include(mc => mc.Career)
                .ToListAsync();
        }

        public async Task<MappingCareerModel> AddMappingAsync(MappingCareerModel mappingModel)
        {
            var mappingEntity = new MappingCareer
            {
                CareerID = mappingModel.CareerID,
                JobID = mappingModel.JobID
            };

            _context.MappingCareers.Add(mappingEntity);
            await _context.SaveChangesAsync();

            return new MappingCareerModel
            {
                CareerID = mappingEntity.CareerID,
                JobID = mappingEntity.JobID
            };
        }

        public async Task<bool> DeleteMappingAsync(int mapId)
        {
            var mapping = await _context.MappingCareers.FindAsync(mapId);
            if (mapping == null)
                return false;

            _context.MappingCareers.Remove(mapping);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
