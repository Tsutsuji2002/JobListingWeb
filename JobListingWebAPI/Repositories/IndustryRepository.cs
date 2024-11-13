using JobListingWebAPI.Data;
using JobListingWebAPI.Entities;
using JobListingWebAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace JobListingWebAPI.Repositories
{
    public class IndustryRepository : IIndustryRepository
    {
        private readonly JobListingWebDbContext _context;

        public IndustryRepository(JobListingWebDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Industry>> GetAllIndustriesAsync()
        {
            return await _context.Industries
                .Where(i => !i.IsDeleted)
                .Include(i => i.MappingIndustries)
                .ToListAsync();
        }

        public async Task<Industry> GetIndustryByIdAsync(int id)
        {
            var industry = await _context.Industries
                .Where(i => i.IndustryID == id && !i.IsDeleted)
                .Include(i => i.MappingIndustries)
                .FirstOrDefaultAsync();

            if (industry == null)
            {
                throw new Exception($"Không tìm thấy ngành có ID {id}.");
            }

            return industry;
        }

        public async Task<IndustryModel> AddIndustryAsync(IndustryModel industryModel)
        {
            var industry = new Industry
            {
                Name = industryModel.Name,
                Description = industryModel.Description,
            };

            _context.Industries.Add(industry);
            await _context.SaveChangesAsync();

            return new IndustryModel
            {
                Name = industry.Name,
                Description = industry.Description,
            };
        }

        public async Task<IndustryModel> UpdateIndustryAsync(int id, IndustryModel industryModel)
        {
            var industry = await _context.Industries.FindAsync(id);
            if (industry == null)
            {
                throw new KeyNotFoundException($"Industry with ID {id} not found");
            }

            industry.Name = industryModel.Name;
            industry.Description = industryModel.Description;

            _context.Entry(industry).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return new IndustryModel
            {
                Name = industry.Name,
                Description = industry.Description,
            };
        }

        public async Task<bool> DeleteIndustryAsync(int id)
        {
            var industry = await _context.Industries.FindAsync(id);
            if (industry == null)
                return false;

            industry.IsDeleted = true;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> IndustryExistsAsync(int id)
        {
            return await _context.Industries.AnyAsync(i => i.IndustryID == id && !i.IsDeleted);
        }

        public async Task<IEnumerable<Industry>> SearchIndustriesAsync(string searchTerm)
        {
            return await _context.Industries
                .Where(i => !i.IsDeleted &&
                    ((i.Name != null && i.Name.Contains(searchTerm)) ||
                     (i.Description != null && i.Description.Contains(searchTerm))))
                .Include(i => i.MappingIndustries)
                .ToListAsync();
        }
    }
}
