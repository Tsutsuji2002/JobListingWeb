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
        public DbSet<Comment> Comments { get; set; }
        public DbSet<Company> Companies { get; set; }
        public DbSet<JobListing> JobListings { get; set; }
        public DbSet<Location> Locations { get; set; }
        public DbSet<Industry> Industries { get; set; }
        public DbSet<Application> Applications { get; set; }
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

        }
    }
}
