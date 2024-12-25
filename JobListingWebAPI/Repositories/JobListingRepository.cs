using JobListingWebAPI.Data;
using JobListingWebAPI.Entities;
using JobListingWebAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace JobListingWebAPI.Repositories
{
    public class JobListingRepository : IJobListingRepository
    {
        private readonly JobListingWebDbContext _context;

        public JobListingRepository(JobListingWebDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Lấy danh sách việc làm
        /// </summary>
        /// <returns></returns>
        public async Task<IEnumerable<JobListing>> GetAllJobListingsAsync()
        {
            return await _context.JobListings
                .Where(j => !j.IsDeleted && j.Status == 1)
                .Include(j => j.Location)
                .Include(j => j.Company)
                .Include(j => j.JobLevel)
                .Include(j => j.Industry)
                .Include(j => j.FavoriteJobs)
                .Include(j => j.MappingCareers)
                    .ThenInclude(mc => mc.Career)
                .ToListAsync();
        }

        /// <summary>
        /// Lấy danh sách việc làm kể cả đã xóa
        /// </summary>
        /// <returns></returns>
        public async Task<IEnumerable<JobListing>> Admin_GetAllJobListingsAsync()
        {
            return await _context.JobListings
                .Where(j => j.Status == 1)
                .Include(j => j.Location)
                .Include(j => j.Company)
                .Include(j => j.JobLevel)
                .Include(j => j.Industry)
                .Include(j => j.FavoriteJobs)
                .Include(j => j.MappingCareers)
                    .ThenInclude(mc => mc.Career)
                .ToListAsync();
        }

        public async Task<IEnumerable<JobListing>> Admin_GetAllUnApprovedJobListingsAsync()
        {
            return await _context.JobListings
                .Where(j => j.Status == 3 && !j.IsDeleted)
                .Include(j => j.Location)
                .Include(j => j.Company)
                .Include(j => j.JobLevel)
                .Include(j => j.Industry)
                .Include(j => j.FavoriteJobs)
                .Include(j => j.MappingCareers)
                    .ThenInclude(mc => mc.Career)
                .ToListAsync();
        }

        /// <summary>
        /// Lấy công việc theo id
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        /// <exception cref="Exception"></exception>
        public async Task<JobListing> GetJobListingByIdAsync(int id)
        {
            var jobListing = await _context.JobListings
                .Where(j => j.JobID == id && !j.IsDeleted)
                .Include(j => j.Location)
                .Include(j => j.Company)
                .Include(j => j.JobLevel)
                .Include(j => j.Industry)
                .Include(j => j.FavoriteJobs)
                .Include(j => j.MappingCareers)
                    .ThenInclude(mc => mc.Career)
                .FirstOrDefaultAsync();

            if (jobListing == null)
            {
                throw new Exception($"Không tìm thấy danh sách việc làm có ID {id}.");
            }

            return jobListing;
        }

        /// <summary>
        /// Thêm công việc mới
        /// </summary>
        /// <param name="jobListing"></param>
        /// <returns></returns>
        public async Task<JobListing> AddJobListingAsync(JobListing jobListing)
        {
            _context.JobListings.Add(jobListing);
            await _context.SaveChangesAsync();
            return jobListing;
        }

        /// <summary>
        /// Cập nhật công việc
        /// </summary>
        /// <param name="jobListing"></param>
        /// <returns></returns>
        /// <exception cref="Exception"></exception>
        public async Task UpdateJobListingAsync(JobListing jobListing)
        {
            _context.Entry(jobListing).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!JobListingExists(jobListing.JobID))
                {
                    throw new Exception($"Job listing with ID {jobListing.JobID} not found.");
                }
                throw;
            }
        }

        /// <summary>
        /// Kiểm tra công việc tồn tại
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        private bool JobListingExists(int id)
        {
            return _context.JobListings.Any(e => e.JobID == id && !e.IsDeleted);
        }

        /// <summary>
        /// Khôi phục công việc bị xóa
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<bool> RestoreJobListingAsync(int id)
        {
            var jobListing = await _context.JobListings.FindAsync(id);
            if (jobListing == null)
                return false;

            jobListing.IsDeleted = false;
            await _context.SaveChangesAsync();
            return true;
        }

        /// <summary>
        /// Xóa công việc tạm thời
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<bool> DeleteJobListingAsync(int id)
        {
            var jobListing = await _context.JobListings.FindAsync(id);
            if (jobListing == null)
                return false;

            jobListing.IsDeleted = true;
            await _context.SaveChangesAsync();
            return true;
        }

        /// <summary>
        /// Xóa công việc vĩnh viễn
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<bool> DeleteJobListingPermanentlyAsync(int id)
        {
            try
            {
                var jobListing = await _context.JobListings
                .Include(e => e.Applications)
                .Include(e => e.MappingCareers)
                .FirstOrDefaultAsync(e => e.JobID == id);

                if (jobListing == null)
                    return false;

                _context.Applications.RemoveRange(jobListing.Applications);
                _context.MappingCareers.RemoveRange(jobListing.MappingCareers);

                _context.JobListings.Remove(jobListing);


                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        /// <summary>
        /// Kiểm tra công việc tồn tại
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<bool> JobListingExistsAsync(int id)
        {
            return await _context.JobListings.AnyAsync(j => j.JobID == id && !j.IsDeleted);
        }

        /// <summary>
        /// Kiểm tra công việc đã xóa
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<bool> JobListingDeletedAsync(int id)
        {
            return await _context.JobListings.AnyAsync(e => e.JobID == id && e.IsDeleted);
        }

        /// <summary>
        /// Lấy danh sách công việc theo công ty
        /// </summary>
        /// <param name="companyId"></param>
        /// <returns></returns>
        public async Task<IEnumerable<JobListing>> GetJobListingsByCompanyAsync(int companyId)
        {
            return (IEnumerable<JobListing>)await _context.JobListings
                .Where(j => !j.IsDeleted && j.CompanyID == companyId)
                .Include(j => j.Company)
                .Include(j => j.JobLevel)
                .Include(j => j.FavoriteJobs)
                .Include(j => j.Applications)
                    .ThenInclude(a => a.User)
                .Include(j => j.Applications)
                    .ThenInclude(a => a.CV)
                .ToListAsync();
        }

        /// <summary>
        /// Lấy danh sách công việc theo công ty kể cả đã xóa
        /// </summary>
        /// <param name="companyId"></param>
        /// <returns></returns>
        public async Task<IEnumerable<JobListing>> Admin_GetJobListingsByCompanyAsync(int companyId)
        {
            return (IEnumerable<JobListing>)await _context.JobListings
                .Where(j => j.CompanyID == companyId)
                .Include(j => j.Company)
                .Include(j => j.JobLevel)
                .Include(j => j.Applications)
                    .ThenInclude(a => a.User)
                .Include(j => j.Applications)
                    .ThenInclude(a => a.CV)
                .ToListAsync();
        }

        /// <summary>
        /// Tìm kiếm công việc(theo tên và mô tả)
        /// </summary>
        /// <param name="searchTerm"></param>
        /// <returns></returns>
        public async Task<IEnumerable<JobListing>> SearchJobListingsAsync(string searchTerm)
        {
            return await _context.JobListings
                .Where(j => !j.IsDeleted &&
                    ((j.Title != null && j.Title.Contains(searchTerm)) ||
                     (j.Description != null && j.Description.Contains(searchTerm))))
                .Include(j => j.Location)
                .Include(j => j.Company)
                .Include(j => j.JobLevel)
                .Include(j => j.Industry)
                .Include(j => j.FavoriteJobs)
                .Include(j => j.MappingCareers)
                    .ThenInclude(mc => mc.Career)
                .ToListAsync();
        }

        /// <summary>
        /// Lấy danh sách các cấp độ công việc
        /// </summary>
        /// <returns></returns>
        public async Task<IEnumerable<JobLevel>> GetAllJobLevelsAsync()
        {
            return await _context.JobLevels
                .Where(jl => !jl.IsDeleted)
                .OrderBy(jl => jl.Description)
                .ToListAsync();
        }

        /// <summary>
        /// Cập nhật trạng thái công việc
        /// </summary>
        /// <param name="jobId"></param>
        /// <param name="status"></param>
        /// <returns></returns>
        /// <exception cref="KeyNotFoundException"></exception>
        public async Task<JobListing> UpdateJobStatusAsync(int jobId, int status)
        {
            var jobListing = await _context.JobListings
                .FirstOrDefaultAsync(j => j.JobID == jobId);

            if (jobListing == null)
            {
                throw new KeyNotFoundException($"Không tìm thấy việc làm có ID {jobId}");
            }

            jobListing.Status = status;
            jobListing.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return jobListing;
        }

        /// <summary>
        /// Gia hạn thời hạn ứng tuyển công việc
        /// </summary>
        /// <param name="jobId"></param>
        /// <param name="days"></param>
        /// <returns></returns>
        /// <exception cref="KeyNotFoundException"></exception>
        /// <exception cref="ArgumentException"></exception>
        public async Task<JobListing> ExtendJobAsync(int jobId, int days)
        {
            var jobListing = await _context.JobListings
                .FirstOrDefaultAsync(j => j.JobID == jobId);

            if (jobListing == null)
            {
                throw new KeyNotFoundException($"Không tìm thấy việc làm có ID {jobId}");
            }

            if (days <= 0)
            {
                throw new ArgumentException("Số ngày gia hạn phải lớn hơn 0");
            }

            var newClosingDate = DateTime.UtcNow.AddDays(days);

            jobListing.Status = 1;
            jobListing.ClosingDate = newClosingDate;
            jobListing.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return jobListing;
        }



        /// <summary>
        /// Lấy các công việc nổi bật
        /// </summary>
        /// <returns></returns>
        /// <exception cref="Exception"></exception>
        public async Task<IEnumerable<JobListing>> GetFeaturedJobListings()
        {
            var jobListing = await _context.JobListings
                .Where(j => !j.IsDeleted && j.IsFeatured && j.Status == 1)
                .Include(j => j.Location)
                .Include(j => j.Company)
                .Include(j => j.JobLevel)
                .Include(j => j.Industry)
                .Include(j => j.FavoriteJobs)
                .Include(j => j.MappingCareers)
                    .ThenInclude(mc => mc.Career)
                .OrderByDescending(j => j.PostedDate)
                .ToListAsync();

            if (jobListing == null)
            {
                throw new Exception($"Không tìm thấy danh sách việc làm phù hợp.");
            }

            return jobListing;
        }

        /// <summary>
        /// Chuyển đổi trạng thái đặc trưng của công việc(đặc trưng => không đặc trưng và ngược lại)
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<bool> ToggleFeatureJobAsync(int id)
        {
            var job = await _context.JobListings.FindAsync(id);
            if (job == null)
                return false;

            // Toggle the IsFeature status
            job.IsFeatured = !job.IsFeatured;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<FavoriteJob> AddFavoriteJobAsync(string userId, int jobId)
        {
            var favoriteJob = new FavoriteJob
            {
                UserID = userId,
                JobID = jobId,
                CreatedDate = DateTime.Now
            };

            _context.FavoriteJobs.Add(favoriteJob);
            await _context.SaveChangesAsync();

            return favoriteJob;
        }

        public async Task RemoveFavoriteJobAsync(string userId, int jobId)
        {
            var favoriteJob = await _context.FavoriteJobs
                .FirstOrDefaultAsync(fj => fj.UserID == userId && fj.JobID == jobId);

            if (favoriteJob != null)
            {
                _context.FavoriteJobs.Remove(favoriteJob);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<List<JobListing>> GetFavoriteJobListingsAsync(string userId)
        {
            return await _context.JobListings
                .Where(j => j.FavoriteJobs.Any(fj => fj.UserID == userId))
                .Include(j => j.FavoriteJobs)
                .Include(j => j.Location)
                .Include(j => j.Company)
                .Include(j => j.JobLevel)
                .Include(j => j.Industry)
                .Include(j => j.MappingCareers).ThenInclude(mc => mc.Career)
                .ToListAsync();
        }

    }
}
