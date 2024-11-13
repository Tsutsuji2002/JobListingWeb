using JobListingWebAPI;
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
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure CORS with credentials
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactApp",
        builder => builder
            .WithOrigins("http://localhost:3000")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());
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
        ClockSkew = TimeSpan.Zero // Reduces the default 5 minute clock skew
    };

    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
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
        }
    };
});

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
builder.Services.AddSingleton<IWebHostEnvironment>(builder.Environment);
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ICompanyRepository, CompanyRepository>();
builder.Services.AddScoped<IJobListingRepository, JobListingRepository>();
builder.Services.AddScoped<ILocationRepository, LocationRepository>();
builder.Services.AddScoped<IIndustryRepository, IndustryRepository>();
builder.Services.AddHttpContextAccessor(); // Add this for accessing HttpContext

// Configure Logging
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
        await RoleSeeder.SeedRoles(roleManager);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while seeding roles.");
    }
}

app.UseHttpsRedirection();

// Important: Order matters for these middleware components
app.UseCors("ReactApp"); // Apply CORS before authentication
app.UseAuthentication();
app.UseAuthorization();

app.UseStaticFiles();
app.MapControllers();
app.MapFallbackToFile("index.html");

app.Run();