using JobListingWebAPI.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace JobListingWebAPI.Data
{
    public class JobListingWebDbContext : IdentityDbContext<ApplicationUser>
    {
        public JobListingWebDbContext(DbContextOptions<JobListingWebDbContext> options)
            : base(options)
        {

        }

        public DbSet<ApplicantUser> ApplicantUsers { get; set; }
        public DbSet<EmployerUser> EmployerUsers { get; set; }
        public DbSet<AdminUser> AdminUsers { get; set; }
        public DbSet<Blog> Blogs { get; set; }
        public DbSet<BlogTag> BlogTags { get; set; }
        public DbSet<Tag> Tags { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<Company> Companies { get; set; }
        public DbSet<JobListing> JobListings { get; set; }
        public DbSet<Location> Locations { get; set; }
        public DbSet<Industry> Industries { get; set; }
        public DbSet<Application> Applications { get; set; }
        public DbSet<CV> CVs { get; set; }
        public DbSet<MappingLocation> MappingLocations { get; set; }
        public DbSet<MappingIndustry> MappingIndustries { get; set; }
        public DbSet<MappingCareer> MappingCareers { get; set; }
        public DbSet<JobLevel> JobLevels { get; set; }
        public DbSet<Slider> Sliders { get; set; }
        public DbSet<Navigation> Navigations { get; set; }
        public DbSet<BlogType> BlogTypes { get; set; }
        public DbSet<MappingType> MappingTypes { get; set; }
        public DbSet<Career> Careers { get; set; }
        public DbSet<NavigationExtend> NavigationExtends { get; set; }
        public DbSet<ChatRoom> ChatRooms { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }
        public DbSet<ChatFile> ChatFiles { get; set; }
        public DbSet<Subscriber> Subscribers { get; set; }
        public DbSet<FavoriteJob> FavoriteJobs { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Blog relationships
            modelBuilder.Entity<Blog>()
                .HasMany(b => b.Comments)
                .WithOne(c => c.Blog)
                .HasForeignKey(c => c.BlogID);
            modelBuilder.Entity<EmployerUser>()
                .HasMany(u => u.Blogs)
                .WithOne(b => b.User)
                .HasForeignKey(c => c.UserId);
            // Tag relationships
            modelBuilder.Entity<Tag>()
                .HasMany(b => b.BlogTags)
                .WithOne(c => c.Tag)
                .HasForeignKey(c => c.BlogID);

            // BlogTag relationships
            modelBuilder.Entity<BlogTag>()
                .HasOne(ml => ml.Tag)
                .WithMany(c => c.BlogTags)
                .HasForeignKey(ml => ml.TagID);

            modelBuilder.Entity<BlogTag>()
                .HasOne(ml => ml.Blog)
                .WithMany(l => l.BlogTags)
                .HasForeignKey(ml => ml.BlogID);

            // Comment relationships
            modelBuilder.Entity<Comment>()
                .HasOne(c => c.Blog)
                .WithMany(b => b.Comments)
                .HasForeignKey(c => c.BlogID);

            modelBuilder.Entity<ApplicantUser>()
                .HasMany(u => u.Comments)
                .WithOne(b => b.User)
                .HasForeignKey(c => c.UserId);

            // Company relationships
            modelBuilder.Entity<Company>()
                .HasMany(c => c.JobListings)
                .WithOne(j => j.Company)
                .HasForeignKey(j => j.CompanyID);

            modelBuilder.Entity<Company>()
                .HasMany(c => c.MappingLocations)
                .WithOne(ml => ml.Company)
                .HasForeignKey(ml => ml.CompanyID);

            modelBuilder.Entity<Company>()
                .HasMany(c => c.MappingIndustries)
                .WithOne(mi => mi.Company)
                .HasForeignKey(mi => mi.CompanyID);

            modelBuilder.Entity<EmployerUser>()
                .HasMany(u => u.Companies)
                .WithOne(b => b.User)
                .HasForeignKey(c => c.UserId);

            // JobListing relationships
            modelBuilder.Entity<JobListing>()
                .HasOne(j => j.Company)
                .WithMany(c => c.JobListings)
                .HasForeignKey(j => j.CompanyID);

            modelBuilder.Entity<JobListing>()
                .HasMany(j => j.Applications)
                .WithOne(a => a.JobListing)
                .HasForeignKey(a => a.JobID);

            modelBuilder.Entity<JobListing>()
                .HasMany(j => j.MappingCareers)
                .WithOne(mc => mc.JobListing)
                .HasForeignKey(mc => mc.JobID);
            modelBuilder.Entity<JobListing>()
                .HasOne(j => j.JobLevel)
                .WithMany(jl => jl.JobListings)
                .HasForeignKey(j => j.JobLevelID);
            modelBuilder.Entity<JobListing>()
                .HasOne(j => j.Industry)
                .WithMany(jl => jl.JobListings)
                .HasForeignKey(j => j.IndustryID);

            // Location relationships
            modelBuilder.Entity<Location>()
                .HasMany(l => l.MappingLocations)
                .WithOne(ml => ml.Location)
                .HasForeignKey(ml => ml.LocationID);

            // Industry relationships
            modelBuilder.Entity<Industry>()
                .HasMany(i => i.MappingIndustries)
                .WithOne(mi => mi.Industry)
                .HasForeignKey(mi => mi.IndustryID);

            // Application relationships
            modelBuilder.Entity<Application>()
                .HasOne(a => a.JobListing)
                .WithMany(j => j.Applications)
                .HasForeignKey(a => a.JobID);
            modelBuilder.Entity<Application>()
                .HasOne(a => a.CV)
                .WithMany(j => j.Applications)
                .HasForeignKey(a => a.CVID);

            // MappingLocation relationships
            modelBuilder.Entity<MappingLocation>()
                .HasOne(ml => ml.Company)
                .WithMany(c => c.MappingLocations)
                .HasForeignKey(ml => ml.CompanyID);

            modelBuilder.Entity<MappingLocation>()
                .HasOne(ml => ml.Location)
                .WithMany(l => l.MappingLocations)
                .HasForeignKey(ml => ml.LocationID);

            // MappingIndustry relationships
            modelBuilder.Entity<MappingIndustry>()
                .HasOne(mi => mi.Company)
                .WithMany(c => c.MappingIndustries)
                .HasForeignKey(mi => mi.CompanyID);

            modelBuilder.Entity<MappingIndustry>()
                .HasOne(mi => mi.Industry)
                .WithMany(i => i.MappingIndustries)
                .HasForeignKey(mi => mi.IndustryID);

            // MappingCareer relationships
            modelBuilder.Entity<MappingCareer>()
                .HasOne(mc => mc.Career)
                .WithMany(c => c.MappingCareers)
                .HasForeignKey(mc => mc.CareerID);

            modelBuilder.Entity<MappingCareer>()
                .HasOne(mc => mc.JobListing)
                .WithMany(j => j.MappingCareers)
                .HasForeignKey(mc => mc.JobID);

            // BlogType relationships
            modelBuilder.Entity<BlogType>()
                .HasMany(bt => bt.MappingTypes)
                .WithOne(mt => mt.BlogType)
                .HasForeignKey(mt => mt.BlogTypeID);

            // MappingType relationships
            modelBuilder.Entity<MappingType>()
                .HasOne(mt => mt.Blog)
                .WithMany(b => b.MappingTypes)
                .HasForeignKey(mt => mt.BlogID);

            modelBuilder.Entity<MappingType>()
                .HasOne(mt => mt.BlogType)
                .WithMany(bt => bt.MappingTypes)
                .HasForeignKey(mt => mt.BlogTypeID);

            // Career relationships
            modelBuilder.Entity<Career>()
                .HasMany(c => c.MappingCareers)
                .WithOne(mc => mc.Career)
                .HasForeignKey(mc => mc.CareerID);

            //
            modelBuilder.Entity<NavigationExtend>()
                .HasOne(j => j.Navigations)
                .WithMany(jl => jl.NavigationExtends)
                .HasForeignKey(j => j.ParentNavID);
            // Configure ChatRoom relationships
            modelBuilder.Entity<ChatRoom>()
                .HasOne(cr => cr.Employer)
                .WithMany()
                .HasForeignKey(cr => cr.EmployerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ChatRoom>()
                .HasOne(cr => cr.Applicant)
                .WithMany()
                .HasForeignKey(cr => cr.ApplicantId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ChatRoom>()
                .HasMany(cr => cr.Messages)
                .WithOne(m => m.ChatRoom)
                .HasForeignKey(m => m.ChatRoomId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure ChatMessage relationships
            modelBuilder.Entity<ChatMessage>()
                .HasOne(cm => cm.Sender)
                .WithMany()
                .HasForeignKey(cm => cm.SenderId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ChatMessage>()
                .HasOne(cm => cm.File)
                .WithOne(cf => cf.Message)
                .HasForeignKey<ChatFile>(cf => cf.MessageId)
                .OnDelete(DeleteBehavior.Cascade);

            // Additional configurations for ChatRoom
            modelBuilder.Entity<ChatRoom>()
                .HasIndex(cr => new { cr.EmployerId, cr.ApplicantId })
                .IsUnique();

            // Additional configurations for ChatMessage
            modelBuilder.Entity<ChatMessage>()
                .Property(cm => cm.EncryptedContent)
                .IsRequired();

            modelBuilder.Entity<ChatMessage>()
                .Property(cm => cm.Type)
                .HasConversion<string>();

            // Configure FavoriteJobs entity
            modelBuilder.Entity<FavoriteJob>(entity =>
            {
                entity.HasKey(e => e.FavoriteJobID);

                entity.HasOne(e => e.User)
                    .WithMany(u => u.FavoriteJobs)
                    .HasForeignKey(e => e.UserID)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.JobListing)
                    .WithMany(j => j.FavoriteJobs)
                    .HasForeignKey(e => e.JobID)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure Subscriber to Industry relationship
            modelBuilder.Entity<Subscriber>()
                .HasOne(s => s.PreferredIndustry)
                .WithMany(i => i.Subscribers)
                .HasForeignKey(s => s.PreferredIndustryId)
                .OnDelete(DeleteBehavior.SetNull);

            // Configure Subscriber to Location relationship
            modelBuilder.Entity<Subscriber>()
                .HasOne(s => s.PreferredLocation)
                .WithMany(l => l.Subscribers)
                .HasForeignKey(s => s.PreferredLocationId)
                .OnDelete(DeleteBehavior.SetNull);

            // Configure Subscriber to JobLevel relationship
            modelBuilder.Entity<Subscriber>()
                .HasOne(s => s.PreferredJobLevel)
                .WithMany(j => j.Subscribers)
                .HasForeignKey(s => s.PreferredJobLevelId)
                .OnDelete(DeleteBehavior.SetNull);

            //modelBuilder.Entity<Subscriber>()
            //    .HasIndex(s => s.Email)
            //    .IsUnique();

        }
    }
}
