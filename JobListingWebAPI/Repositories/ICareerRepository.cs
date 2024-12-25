using JobListingWebAPI.Entities;
using JobListingWebAPI.Models;

namespace JobListingWebAPI.Repositories
{
    public interface ICareerRepository
    {
        Task<IEnumerable<Career>> GetAllCareersAsync();
        Task<Career?> GetCareerByIdAsync(int careerId);
        Task<CareerModel> AddCareerAsync(CareerModel careerModel);
        Task<bool> UpdateCareerAsync(int careerId, CareerModel careerModel);
        Task<bool> DeleteCareerAsync(int careerId);
        Task<IEnumerable<MappingCareer>> GetMappingsByCareerIdAsync(int careerId);
        Task<IEnumerable<MappingCareer>> GetMappingsByJobIdAsync(int jobId);
        Task<MappingCareerModel> AddMappingAsync(MappingCareerModel mappingModel);
        Task<bool> DeleteMappingAsync(int mapId);
    }
}
