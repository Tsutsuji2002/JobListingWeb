using JobListingWebAPI.Data;
using JobListingWebAPI.Entities;
using Microsoft.EntityFrameworkCore;

namespace JobListingWebAPI.Repositories
{
    public class BlogRepository : IBlogRepository
    {
        private readonly JobListingWebDbContext _context;
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<BlogRepository> _logger;

        public BlogRepository(
            JobListingWebDbContext context,
            IWebHostEnvironment environment,
            ILogger<BlogRepository> logger)
        {
            _context = context;
            _environment = environment;
            _logger = logger;
        }

        public async Task<IEnumerable<Blog>> GetAllBlogsAsync(bool includeDeleted = false)
        {
            return await _context.Blogs
                .Where(b => includeDeleted || !b.IsDeleted)
                .Include(b => b.User)
                .Include(b => b.Comments)
                .Include(b => b.BlogTags)
                    .ThenInclude(bt => bt.Tag)
                .Include(b => b.MappingTypes)
                    .ThenInclude(mt => mt.BlogType)
                .ToListAsync();
        }

        public async Task<IEnumerable<Blog>> GetNewestBlogsAsync(int limit)
        {
            return await _context.Blogs
                .Where(b => !b.IsDeleted)
                .Include(b => b.User)
                .Include(b => b.Comments)
                .Include(b => b.BlogTags)
                    .ThenInclude(bt => bt.Tag)
                .Include(b => b.MappingTypes)
                    .ThenInclude(mt => mt.BlogType)
                .OrderByDescending(b => b.Publication)
                .ToListAsync();
        }

        public async Task<IEnumerable<Blog>> GetBlogsByTypeAsync(int blogTypeId, bool includeDeleted = false)
        {
            return await _context.Blogs
                .Where(b => (includeDeleted || !b.IsDeleted) &&
                            b.MappingTypes.Any(mt => mt.BlogTypeID == blogTypeId))
                .Include(b => b.User)
                .Include(b => b.Comments)
                .Include(b => b.BlogTags)
                    .ThenInclude(bt => bt.Tag)
                .Include(b => b.MappingTypes)
                    .ThenInclude(mt => mt.BlogType)
                .ToListAsync();
        }


        public async Task<Blog> GetBlogByIdAsync(int id)
        {
            return await _context.Blogs
                .Include(b => b.User)
                .Include(b => b.Comments)
                .Include(b => b.BlogTags)
                    .ThenInclude(bt => bt.Tag)
                .Include(b => b.MappingTypes)
                    .ThenInclude(mt => mt.BlogType)
                .FirstOrDefaultAsync(b => b.BlogID == id);
        }

        public async Task<Blog> CreateBlogAsync(Blog blog)
        {
            _context.Blogs.Add(blog);
            await _context.SaveChangesAsync();
            return blog;
        }

        public async Task<Blog> UpdateBlogAsync(Blog blog)
        {
            _context.Entry(blog).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return blog;
        }

        public async Task<bool> SoftDeleteBlogAsync(int id)
        {
            var blog = await _context.Blogs.FindAsync(id);
            if (blog == null) return false;

            blog.IsDeleted = true;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteBlogPermanentlyAsync(int id)
        {
            var blog = await _context.Blogs.FindAsync(id);
            if (blog == null) return false;

            _context.Blogs.Remove(blog);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RestoreBlogAsync(int blogId)
        {
            var blog = await _context.Blogs.FindAsync(blogId);
            if (blog == null) return false;

            blog.IsDeleted = false;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<Blog> PublishBlogAsync(int blogId)
        {
            var blog = await _context.Blogs.FindAsync(blogId);
            if (blog == null) return null;

            blog.IsPublished = true;
            blog.Publication = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return blog;
        }

        public async Task<Blog> UnpublishBlogAsync(int blogId)
        {
            var blog = await _context.Blogs.FindAsync(blogId);
            if (blog == null) return null;

            blog.IsPublished = false;
            await _context.SaveChangesAsync();
            return blog;
        }

        public async Task IncrementViewCountAsync(int blogId)
        {
            var blog = await _context.Blogs.FindAsync(blogId);
            if (blog != null)
            {
                blog.Views++;
                await _context.SaveChangesAsync();
            }
        }

        // BlogType Methods
        public async Task<IEnumerable<BlogType>> GetAllBlogTypesAsync(bool includeDeleted = false)
        {
            return await _context.BlogTypes
                .Where(bt => includeDeleted || !bt.IsDeleted)
                .Include(bt => bt.MappingTypes)
                .ToListAsync();
        }

        public async Task<BlogType> GetBlogTypeByIdAsync(int id)
        {
            return await _context.BlogTypes
                .Include(bt => bt.MappingTypes)
                .FirstOrDefaultAsync(bt => bt.BlogTypeID == id);
        }

        public async Task<BlogType> CreateBlogTypeAsync(BlogType blogType)
        {
            _context.BlogTypes.Add(blogType);
            await _context.SaveChangesAsync();
            return blogType;
        }

        public async Task<BlogType> UpdateBlogTypeAsync(BlogType blogType)
        {
            _context.Entry(blogType).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return blogType;
        }

        public async Task<bool> SoftDeleteBlogTypeAsync(int id)
        {
            var blogType = await _context.BlogTypes.FindAsync(id);
            if (blogType == null) return false;

            blogType.IsDeleted = true;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteBlogTypePermanentlyAsync(int id)
        {
            var blogType = await _context.BlogTypes.FindAsync(id);
            if (blogType == null) return false;

            _context.BlogTypes.Remove(blogType);
            await _context.SaveChangesAsync();
            return true;
        }
        public async Task<bool> RestoreBlogTypeAsync(int blogTypeId)
        {
            var blogType = await _context.BlogTypes.FindAsync(blogTypeId);
            if (blogType == null) return false;

            blogType.IsDeleted = false;
            await _context.SaveChangesAsync();
            return true;
        }


        // Tag Methods
        public async Task<IEnumerable<Tag>> GetAllTagsAsync()
        {
            return await _context.Tags.ToListAsync();
        }

        public async Task<Tag> GetTagByIdAsync(int id)
        {
            return await _context.Tags.FindAsync(id);
        }

        public async Task<Tag> CreateTagAsync(Tag tag)
        {
            _context.Tags.Add(tag);
            await _context.SaveChangesAsync();
            return tag;
        }

        public async Task<Tag> UpdateTagAsync(Tag tag)
        {
            _context.Entry(tag).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return tag;
        }

        public async Task<bool> DeleteTagAsync(int id)
        {
            var tag = await _context.Tags.FindAsync(id);
            if (tag == null) return false;

            _context.Tags.Remove(tag);
            await _context.SaveChangesAsync();
            return true;
        }

    }
}