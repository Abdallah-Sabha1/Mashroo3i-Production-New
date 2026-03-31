using backend.DTOs.Idea;
using backend.Models;

namespace backend.Services.Interfaces
{
    public interface IGeminiAIService
    {
        Task<Evaluation> EvaluateBusinessIdeaAsync(BusinessIdea idea, string language = "en");
        Task<IdeaInsightsDto> GenerateIdeaInsightsAsync(string title, string description, string sector, string language = "en");
    }
}
