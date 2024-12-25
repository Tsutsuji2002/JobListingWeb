using JobListingWebAPI.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace JobListingWebAPI.Services
{
    public class JobExpirationBackgroundService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<JobExpirationBackgroundService> _logger;

        public JobExpirationBackgroundService(
            IServiceProvider serviceProvider,
            ILogger<JobExpirationBackgroundService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                _logger.LogInformation("Job Expiration Service running at: {time}", DateTimeOffset.Now);

                try
                {
                    await CheckAndUpdateExpiredJobs(stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred while checking for expired jobs");
                }

                // Wait for 1 hour before next check (adjust as needed)
                await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
            }
        }

        private async Task CheckAndUpdateExpiredJobs(CancellationToken stoppingToken)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<JobListingWebDbContext>();

                // Find all active jobs that have passed their closing date
                var expiredJobs = await dbContext.JobListings
                    .Where(j =>
                        j.ClosingDate < DateTime.Now &&
                        j.Status != 0 &&     // Not already expired
                        !j.IsDeleted)        // Not soft deleted
                    .ToListAsync(stoppingToken);

                if (expiredJobs.Any())
                {
                    foreach (var job in expiredJobs)
                    {
                        job.Status = 0; // Mark as expired
                    }

                    await dbContext.SaveChangesAsync(stoppingToken);

                    _logger.LogInformation($"Marked {expiredJobs.Count} jobs as expired");
                }
            }
        }

        public override async Task StopAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Job Expiration Service is stopping.");
            await base.StopAsync(stoppingToken);
        }
    }
}
