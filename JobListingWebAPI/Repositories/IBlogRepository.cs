using JobListingWebAPI.Entities;

namespace JobListingWebAPI.Repositories
{
    public interface IBlogRepository
    {
        Task<IEnumerable<Blog>> GetAllBlogsAsync(bool includeDeleted = false);
        Task<IEnumerable<Blog>> GetNewestBlogsAsync(int limit);
        Task<IEnumerable<Blog>> GetBlogsByTypeAsync(int blogTypeId, bool includeDeleted = false);
        Task<Blog> GetBlogByIdAsync(int id);
        Task<Blog> CreateBlogAsync(Blog blog);
        Task<Blog> UpdateBlogAsync(Blog blog);
        Task<bool> SoftDeleteBlogAsync(int id);
        Task<bool> DeleteBlogPermanentlyAsync(int id);
        Task<bool> RestoreBlogAsync(int blogId);
        Task<Blog> PublishBlogAsync(int blogId);
        Task<Blog> UnpublishBlogAsync(int blogId);
        Task IncrementViewCountAsync(int blogId);

        // BlogType
        Task<IEnumerable<BlogType>> GetAllBlogTypesAsync(bool includeDeleted = false);
        Task<BlogType> GetBlogTypeByIdAsync(int id);
        Task<BlogType> CreateBlogTypeAsync(BlogType blogType);
        Task<BlogType> UpdateBlogTypeAsync(BlogType blogType);
        Task<bool> SoftDeleteBlogTypeAsync(int id);
        Task<bool> DeleteBlogTypePermanentlyAsync(int id);
        Task<bool> RestoreBlogTypeAsync(int blogTypeId);
        // Tag
        Task<IEnumerable<Tag>> GetAllTagsAsync();
        Task<Tag> GetTagByIdAsync(int id);
        Task<Tag> CreateTagAsync(Tag tag);
        Task<Tag> UpdateTagAsync(Tag tag);
        Task<bool> DeleteTagAsync(int id);
    }
}
