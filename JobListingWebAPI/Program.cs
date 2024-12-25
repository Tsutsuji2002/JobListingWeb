using JobListingWebAPI.Data;
using JobListingWebAPI.Entities;
using JobListingWebAPI.Repositories;
using JobListingWebAPI.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Hosting;
using System.Text;
using System.Text.Json;
using Azure.Storage.Blobs;
using Betalgo.Ranul.OpenAI.Managers;
using Betalgo.Ranul.OpenAI;
using JobListingWebAPI.Hubs;
using System.Security.Claims;
using JobListingWebAPI.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Quartz;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.DependencyInjection;
using HealthChecks.UI.Client;

var builder = WebApplication.CreateBuilder(args);

// JWT Configuration
var jwtSecret = builder.Configuration["JWT:Secret"] ?? throw new ArgumentNullException("JWT:Secret", "JWT Secret cannot be null.");
var jwtIssuer = builder.Configuration["JWT:ValidIssuer"] ?? throw new ArgumentNullException("JWT:ValidIssuer", "JWT Issuer cannot be null.");
var jwtAudience = builder.Configuration["JWT:ValidAudience"] ?? throw new ArgumentNullException("JWT:ValidAudience", "JWT Audience cannot be null.");

// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure CORS with credentials
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactApp",
        builder => builder
            .WithOrigins("http://localhost:3000", "http://localhost:5070")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials()
            .SetIsOriginAllowed(_ => true));
});

// Configure Database Context
builder.Services.AddDbContext<JobListingWebDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("JobListingWeb")));

// Configure Identity
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.SignIn.RequireConfirmedEmail = false;
    options.SignIn.RequireConfirmedAccount = false;

    // Password settings
    options.Password.RequireDigit = true;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequireUppercase = true;
    options.Password.RequiredLength = 8;
    options.Password.RequiredUniqueChars = 0;

    // Lockout settings
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.AllowedForNewUsers = true;

    // User settings
    options.User.AllowedUserNameCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-.@+";
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<JobListingWebDbContext>()
.AddDefaultTokenProviders();

// Configure JWT Authentication with proper token validation and events
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddCookie(options =>
{
    options.LoginPath = "/api/account/login";
})
.AddGoogle(options =>
{
    var googleAuthSection = builder.Configuration.GetSection("GoogleAuth");
    var clientId = googleAuthSection["ClientId"];
    var clientSecret = googleAuthSection["ClientSecret"];

    if (string.IsNullOrEmpty(clientId) || string.IsNullOrEmpty(clientSecret))
    {
        throw new InvalidOperationException("Google authentication ClientId and ClientSecret must be provided in configuration.");
    }

    options.ClientId = clientId;
    options.ClientSecret = clientSecret;
})
.AddJwtBearer(options =>
{
    options.SaveToken = true;
    options.RequireHttpsMetadata = false;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidAudience = jwtAudience,
        ValidIssuer = jwtIssuer,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
        RoleClaimType = ClaimTypes.Role,
        ClockSkew = TimeSpan.Zero // Reduces the default 5 minute clock skew
    };

    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            Console.WriteLine($"Authentication failed: {context.Exception}"); // Debug logging
            if (context.Exception.GetType() == typeof(SecurityTokenExpiredException))
            {
                context.Response.Headers["Token-Expired"] = "true";
            }
            return Task.CompletedTask;
        },
        OnChallenge = context =>
        {
            // Skip the default challenge response
            context.HandleResponse();

            // Custom response for authentication failure
            context.Response.StatusCode = 401;
            context.Response.ContentType = "application/json";
            var result = System.Text.Json.JsonSerializer.Serialize(new { message = "You are not authorized" });
            return context.Response.WriteAsync(result);
        },
        OnForbidden = context =>
        {
            // Custom response for authorization failure
            context.Response.StatusCode = 403;
            context.Response.ContentType = "application/json";
            var result = System.Text.Json.JsonSerializer.Serialize(new { message = "You are forbidden to access this resource" });
            return context.Response.WriteAsync(result);
        },
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];

            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/chatHub"))
            {
                context.Token = accessToken;
            }

            return Task.CompletedTask;
        },
        OnTokenValidated = context =>
        {
            Console.WriteLine("Token was validated!"); // Debug logging
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddQuartz(q =>
{
    var jobKey = new JobKey("DailyJobNotificationJob");
    q.AddJob<DailyJobNotificationJobService>(opts => opts.WithIdentity(jobKey));

    q.AddTrigger(opts => opts
    .ForJob(jobKey)
    .WithIdentity("DailyJobNotificationTrigger")
    .WithCronSchedule("0 0 9 * * ?"));
});

// Add the Quartz hosted service
builder.Services.AddQuartzHostedService(options =>
{
    // Configure options if needed
    options.WaitForJobsToComplete = true;
});

// Add your JobEmailService as a scoped service
builder.Services.AddScoped<DailyJobNotificationJobService>();

// Authorization Policies
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireAdminRole", policy =>
        policy.RequireRole("Admin"));
    options.AddPolicy("RequireEmployerRole", policy =>
        policy.RequireRole("Employer"));
    options.AddPolicy("RequireApplicantRole", policy =>
        policy.RequireRole("Applicant"));
});

// Register services
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("Redis");
    options.InstanceName = "MyApp_";
});

// 2. Add Redis health checks
builder.Services.AddHealthChecks()
    .AddRedis(builder.Configuration.GetConnectionString("Redis"),
        name: "redis",
        failureStatus: HealthStatus.Degraded);

builder.Services.Configure<EmailSettings>(
    builder.Configuration.GetSection("EmailSettings"));
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = true;
})
    .AddJsonProtocol(options =>
    {
        options.PayloadSerializerOptions.PropertyNameCaseInsensitive = true;
    }); 
builder.Services.AddSingleton<IWebHostEnvironment>(builder.Environment);
builder.Services.AddHttpClient();
builder.Services.AddSingleton<GeminiChatbotService>();
builder.Services.AddSingleton(sp =>
{
    var configuration = sp.GetRequiredService<IConfiguration>();
    var useLocalStorage = configuration.GetValue<bool>("AzureStorage:UseLocalStorage");
    var connectionString = useLocalStorage ?
        "UseDevelopmentStorage=true" :
        configuration["AzureStorage:ConnectionString"];

    return new BlobServiceClient(connectionString);
});
builder.Services.AddHostedService<JobExpirationBackgroundService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ICVService, CVService>();
builder.Services.AddScoped<IChatEncryptionService, ChatEncryptionService>();
builder.Services.AddScoped<IEncryptionService, EncryptionService>();
builder.Services.AddScoped<IChatService, ChatService>();
builder.Services.AddScoped<ISubscriptionService, SubscriptionService>();
builder.Services.AddScoped<IChatRoomRepository, ChatRoomRepository>();
builder.Services.AddScoped<ICompanyRepository, CompanyRepository>();
builder.Services.AddScoped<IJobListingRepository, JobListingRepository>();
builder.Services.AddScoped<ILocationRepository, LocationRepository>();
builder.Services.AddScoped<IIndustryRepository, IndustryRepository>();
builder.Services.AddScoped<ICareerRepository, CareerRepository>();
builder.Services.AddScoped<IApplicationRepository, ApplicationRepository>();
builder.Services.AddScoped<IBlogRepository, BlogRepository>();
builder.Services.AddHttpContextAccessor(); // Add this for accessing HttpContext

// Configure Logging
builder.Services.AddMemoryCache();
builder.Services.AddLogging(logging =>
{
    logging.ClearProviders();
    logging.AddConsole();
    logging.AddDebug();
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Seed Roles
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        await RoleSeeder.SeedRoles(roleManager);
        await JobListingWebDbContextSeed.SeedDefaultAdminAsync(userManager);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while seeding.");
    }
}

app.UseHttpsRedirection();

// Important: Order matters for these middleware components
app.UseCors("ReactApp"); // Apply CORS before authentication
app.UseAuthentication();
app.UseAuthorization();
app.MapHub<ChatHub>("/chatHub");
app.UseStaticFiles();
app.MapControllers();
app.MapFallbackToFile("index.html");

app.Run();

app.Run();