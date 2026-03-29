using backend.DTOs;
using backend.Models;

namespace backend.Services.Interfaces
{
    public interface IFinancialProjectionService
    {
        Task<BenchmarkResponse?> GetBenchmarkAsync(string industryType, string businessModel, string region = "Amman");
        Task<List<IndustryListItem>> GetAllBenchmarksAsync();
        Task<FinancialProjectionResponse> CreateProjectionAsync(int ideaId, CreateProjectionRequest request);
        Task<FinancialProjection?> GetProjectionAsync(int ideaId);
        Task<FinancialProjectionResponse?> GetProjectionResponseAsync(int ideaId);
        Task<FinancialProjectionResponse> UpdateProjectionAsync(int ideaId, UpdateProjectionRequest request);
        Task<bool> DeleteProjectionAsync(int ideaId);
    }
}
