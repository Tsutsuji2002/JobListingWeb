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

        /// <summary>
        /// Lấy toàn bộ ngành
        /// </summary>
        /// <returns></returns>
        public async Task<IEnumerable<Industry>> GetAllIndustriesAsync()
        {
            return await _context.Industries
                .Where(i => !i.IsDeleted)
                .Include(i => i.MappingIndustries)
                .ToListAsync();
        }

        /// <summary>
        /// Lấy toàn bộ ngành kể cả đã xóa
        /// </summary>
        /// <returns></returns>
        public async Task<IEnumerable<Industry>> Admin_GetAllIndustriesAsync()
        {
            return await _context.Industries
                .Include(i => i.MappingIndustries)
                .ToListAsync();
        }

        /// <summary>
        /// Lấy ngành theo id
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        /// <exception cref="Exception"></exception>
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

        /// <summary>
        /// Thêm ngành mới
        /// </summary>
        /// <param name="industryModel"></param>
        /// <returns></returns>
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

        /// <summary>
        /// Cập nhật ngành
        /// </summary>
        /// <param name="id"></param>
        /// <param name="industryModel"></param>
        /// <returns></returns>
        /// <exception cref="KeyNotFoundException"></exception>
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

        /// <summary>
        /// Khôi phục ngành đã xóa
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<bool> RestoreIndustryAsync(int id)
        {
            var industry = await _context.Industries.FindAsync(id);
            if (industry == null)
                return false;

            industry.IsDeleted = false;
            await _context.SaveChangesAsync();
            return true;
        }

        /// <summary>
        /// Xóa ngành tạm thời
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<bool> DeleteIndustryAsync(int id)
        {
            var industry = await _context.Industries.FindAsync(id);
            if (industry == null)
                return false;

            industry.IsDeleted = true;
            await _context.SaveChangesAsync();
            return true;
        }

        /// <summary>
        /// Xóa ngành vĩnh viễn
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<bool> DeleteIndustryPermanentlyAsync(int id)
        {
            var industry = await _context.Industries
                .Include(l => l.MappingIndustries)
                .FirstOrDefaultAsync(l => l.IndustryID == id);

            if (industry == null)
                return false;

            _context.MappingIndustries.RemoveRange(industry.MappingIndustries);

            _context.Industries.Remove(industry);

            await _context.SaveChangesAsync();
            return true;
        }

        /// <summary>
        /// Kiểm tra ngành có tồn tại
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<bool> IndustryExistsAsync(int id)
        {
            return await _context.Industries.AnyAsync(i => i.IndustryID == id && !i.IsDeleted);
        }

        /// <summary>
        /// Kiểm tra ngành đã xóa
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<bool> IndustryDeletedAsync(int id)
        {
            return await _context.Industries.AnyAsync(i => i.IndustryID == id && i.IsDeleted);
        }

        /// <summary>
        /// Tìm kiếm ngành
        /// </summary>
        /// <param name="searchTerm"></param>
        /// <returns></returns>
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
