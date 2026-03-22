using backend.DTOs.Idea;

namespace backend.Services.Interfaces
{
    public interface IIdeaAnalysisService
    {
        Task<IdeaInsightsDto> AnalyzeIdeaAsync(string title, string description);
    }
}
