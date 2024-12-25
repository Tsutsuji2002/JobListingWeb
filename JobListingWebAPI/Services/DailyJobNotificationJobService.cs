using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using System.Net.Mail;
using Quartz;
using Quartz.Impl;
using JobListingWebAPI.Entities;
using JobListingWebAPI.Data;
using System.Text;

namespace JobListingWebAPI.Services
{
    public class DailyJobNotificationJobService : IJob
    {
        private readonly JobListingWebDbContext _context;
        private readonly IEmailService _emailService;
        private readonly ILogger<DailyJobNotificationJobService> _logger;

        public DailyJobNotificationJobService(
            JobListingWebDbContext context,
            IEmailService emailService,
            ILogger<DailyJobNotificationJobService> logger)
        {
            _context = context;
            _emailService = emailService;
            _logger = logger;
        }

        public async Task Execute(IJobExecutionContext context)
        {
            try
            {
                var activeSubscribers = await _context.Subscribers
                    .Include(s => s.PreferredIndustry)
                    .Include(s => s.PreferredLocation)
                    .Include(s => s.PreferredJobLevel)
                    .Where(s => s.IsActive)
                    .ToListAsync();

                foreach (var subscriber in activeSubscribers)
                {
                    await SendJobNotificationEmailAsync(subscriber);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing daily job notification");
                throw;
            }
        }

        private async Task SendJobNotificationEmailAsync(Subscriber subscriber)
        {
            var matchingJobs = await GetMatchingJobsAsync(subscriber);

            if (!matchingJobs.Any())
            {
                var noMatchModel = new
                {
                    UserName = subscriber.Email.Split('@')[0],
                    Industry = subscriber.PreferredIndustry?.Name ?? "Bất kỳ",
                    Location = subscriber.PreferredLocation?.Name ?? "Bất kỳ",
                    JobLevel = subscriber.PreferredJobLevel?.Description ?? "Bất kỳ"
                };

                await _emailService.SendTemplatedEmailAsync(
                    subscriber.Email,
                    "NoJobMatches",
                    noMatchModel
                );
                return;
            }

            var jobListingsHtml = GenerateJobListingsHtml(matchingJobs);
            var model = new
            {
                UserName = subscriber.Email.Split('@')[0],
                JobListings = jobListingsHtml
            };

            await _emailService.SendTemplatedEmailAsync(
                subscriber.Email,
                "DailyJobsDigest",
                model
            );
        }

        private async Task<List<JobListing>> GetMatchingJobsAsync(Subscriber subscriber)
        {
            return await _context.JobListings
                .Include(j => j.Company)
                .Include(j => j.Location)
                .Include(j => j.Industry)
                .Include(j => j.JobLevel)
                .Where(j =>
                    (!subscriber.PreferredIndustryId.HasValue || j.IndustryID == subscriber.PreferredIndustryId) &&
                    (!subscriber.PreferredLocationId.HasValue || j.LocationID == subscriber.PreferredLocationId) &&
                    (!subscriber.PreferredJobLevelId.HasValue || j.JobLevelID == subscriber.PreferredJobLevelId) &&
                    j.Status == 1 && // Active jobs only
                    !j.IsDeleted &&
                    j.ClosingDate > DateTime.Today)
                .OrderByDescending(j => j.PostedDate)
                .Take(10)
                .ToListAsync();
        }

        private string GenerateJobListingsHtml(List<JobListing> jobs)
        {
            var html = new StringBuilder();
            foreach (var job in jobs)
            {
                html.AppendLine($@"
                <div style='border: 1px solid #ddd; padding: 15px; margin-bottom: 15px; border-radius: 5px;'>
                    <h3 style='color: #2c3e50; margin-top: 0;'>
                        <a href='http://localhost:3000/jobs/{job.JobID}' style='text-decoration: none; color: inherit;'>{job.Title}</a>
                    </h3>
                    <p style='color: #34495e;'><strong>Công ty:</strong> {job.Company.Name}</p>
                    <p><strong>Địa điểm:</strong> {job.Location.Name}</p>
                    <p><strong>Ngành:</strong> {job.Industry.Name}</p>
                    <p><strong>Cấp bậc:</strong> {job.JobLevel.Description}</p>
                    <p><strong>Lương:</strong> {job.Salary}</p>
                    <p><strong>Ngày đăng:</strong> {job.PostedDate:dd/MM/yyyy}</p>
                    <p><strong>Ngày đóng:</strong> {job.ClosingDate:dd/MM/yyyy}</p>
                    {(job.IsUrgent ? "<p style='color: #e74c3c;'><strong>KHẨN CẤP!</strong></p>" : "")}
                </div>");
            }
            return html.ToString();
        }
    }
}
