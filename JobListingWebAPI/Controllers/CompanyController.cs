using JobListingWebAPI.Entities;
using JobListingWebAPI.Models;
using JobListingWebAPI.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JobListingWebAPI.Data;
using System.Text.Json;

namespace JobListingWebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CompanyController : ControllerBase
    {
        private readonly ICompanyRepository _companyRepository;
        private readonly IWebHostEnvironment _environment;
        private readonly JobListingWebDbContext _context;
        private readonly ILogger<CompanyController> _logger;

        public CompanyController(IWebHostEnvironment environment, ICompanyRepository companyRepository, JobListingWebDbContext context, ILogger<CompanyController> logger)
        {
            _environment = environment;
            _companyRepository = companyRepository;
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Company>>> GetAllCompanies()
        {
            var companies = await _companyRepository.GetAllCompaniesAsync();
            return Ok(companies);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Company>> GetCompanyById(int id)
        {
            var company = await _companyRepository.GetCompanyByIdAsync(id);
            if (company == null)
            {
                return NotFound($"Không tìm thấy công ty có ID {id}.");
            }
            return Ok(company);
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<Company>> GetCompanyByUserId(string userId)
        {
            var company = await _companyRepository.GetCompanyByUserIdAsync(userId);
            if (company == null)
            {
                return NotFound($"No company found for user ID {userId}.");
            }
            return Ok(company);
        }

        [HttpPost]
        public async Task<ActionResult<Company>> AddCompany([FromForm] CompanyModel companyModel)
        {
            try
            {
                var company = new Company
                {
                    Name = companyModel.Name,
                    Description = companyModel.Description,
                    FoundedYear = companyModel.FoundedYear,
                    Website = companyModel.Website,
                    CreatedDate = DateTime.UtcNow,
                    UpdatedDate = DateTime.UtcNow,
                    IsDeleted = false,
                    UserId = companyModel.UserId
                };

                if (companyModel.Logo != null)
                {
                    company.Logo = await SaveImage(companyModel.Logo, "company-logos");
                }
                if (companyModel.Background != null)
                {
                    company.Background = await SaveImage(companyModel.Background, "company-backgrounds");
                }

                var createdCompany = await _companyRepository.AddCompanyAsync(company);
                await _context.SaveChangesAsync();

                return CreatedAtAction(
                    nameof(GetCompanyById),
                    new { id = createdCompany.CompanyID },
                    createdCompany
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create company");
                return BadRequest($"Failed to create company: {ex.Message}");
            }
        }
        [HttpPost("{companyId}/locations")]
        public async Task<ActionResult> AddCompanyLocations(int companyId, [FromBody] MappingLocationRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                foreach (var location in request.MappingLocations)
                {
                    var newMappingLocation = new MappingLocation
                    {
                        CompanyID = companyId,
                        LocationID = location.LocationId,
                        Address = location.Address
                    };
                    _context.MappingLocations.Add(newMappingLocation);
                }

                await _context.SaveChangesAsync();
                var updatedCompany = await _companyRepository.GetCompanyByIdAsync(companyId);
                return Ok(request.MappingLocations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to add company locations");
                return BadRequest($"Failed to add locations: {ex.Message}");
            }
        }

        [HttpPost("{companyId}/industries")]
        public async Task<ActionResult> AddCompanyIndustries(int companyId, [FromBody] MappingIndustryRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                foreach (var industry in request.MappingIndustries)
                {
                    var newMappingIndustry = new MappingIndustry
                    {
                        CompanyID = companyId,
                        IndustryID = industry.IndustryId
                    };
                    _context.MappingIndustries.Add(newMappingIndustry);
                }

                await _context.SaveChangesAsync();
                var updatedCompany = await _companyRepository.GetCompanyByIdAsync(companyId);
                return Ok(request.MappingIndustries);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to add company industries");
                return BadRequest($"Failed to add industries: {ex.Message}");
            }
        }

        private async Task<string> SaveImage(IFormFile file, string folder)
        {
            // Create folder if it doesn't exist
            var uploadsFolder = Path.Combine(_environment.ContentRootPath, folder);
            Directory.CreateDirectory(uploadsFolder);

            // Generate unique filename
            var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            // Save file
            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(fileStream);
            }

            // Return relative path
            return $"/{folder}/{fileName}";
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateCompany(int id, [FromForm] CompanyModel model)
        {
            try
            {
                var existingCompany = await _companyRepository.GetCompanyByIdAsync(id);
                if (existingCompany == null)
                {
                    return NotFound($"Không tìm thấy công ty có ID {id}.");
                }

                // Update basic information
                existingCompany.Name = model.Name;
                existingCompany.Description = model.Description;
                existingCompany.FoundedYear = model.FoundedYear;
                existingCompany.Website = model.Website;
                existingCompany.UpdatedDate = DateTime.UtcNow;
                existingCompany.UserId = existingCompany.UserId;

                // Handle Logo upload
                if (model.Logo != null)
                {
                    // Delete old logo file if exists
                    if (!string.IsNullOrEmpty(existingCompany.Logo))
                    {
                        var oldLogoPath = Path.Combine(_environment.ContentRootPath, existingCompany.Logo.TrimStart('/'));
                        if (System.IO.File.Exists(oldLogoPath))
                        {
                            System.IO.File.Delete(oldLogoPath);
                        }
                    }
                    existingCompany.Logo = await SaveImage(model.Logo, "company-logos");
                }

                // Handle Background upload
                if (model.Background != null)
                {
                    // Delete old background file if exists
                    if (!string.IsNullOrEmpty(existingCompany.Background))
                    {
                        var oldBgPath = Path.Combine(_environment.ContentRootPath, existingCompany.Background.TrimStart('/'));
                        if (System.IO.File.Exists(oldBgPath))
                        {
                            System.IO.File.Delete(oldBgPath);
                        }
                    }
                    existingCompany.Background = await SaveImage(model.Background, "company-backgrounds");
                }

                await _companyRepository.UpdateCompanyAsync(existingCompany);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Cập nhật thông tin công ty thành công", company = existingCompany });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update company");
                return BadRequest($"Lỗi khi cập nhật công ty: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteCompany(int id)
        {
            var success = await _companyRepository.DeleteCompanyAsync(id);
            if (!success)
            {
                return NotFound($"Không tìm thấy công ty có ID {id}.");
            }
            return NoContent();
        }

        [HttpGet("exists/{id}")]
        public async Task<ActionResult<bool>> CompanyExists(int id)
        {
            var exists = await _companyRepository.CompanyExistsAsync(id);
            return Ok(exists);
        }

        [HttpGet("industry/{industryId}")]
        public async Task<ActionResult<IEnumerable<Company>>> GetCompaniesByIndustry(int industryId)
        {
            var companies = await _companyRepository.GetCompaniesByIndustryAsync(industryId);
            return Ok(companies);
        }

        [HttpGet("location/{locationId}")]
        public async Task<ActionResult<IEnumerable<Company>>> GetCompaniesByLocation(int locationId)
        {
            var companies = await _companyRepository.GetCompaniesByLocationAsync(locationId);
            return Ok(companies);
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<Company>>> SearchCompanies(string searchTerm)
        {
            var companies = await _companyRepository.SearchCompaniesAsync(searchTerm);
            return Ok(companies);
        }
    }
}
