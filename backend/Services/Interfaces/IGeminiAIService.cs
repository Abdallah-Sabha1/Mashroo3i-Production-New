using backend.DTOs.Idea;
using backend.Models;

namespace backend.Services.Interfaces
{
    public interface IGeminiAIService
    {
        Task<Evaluation> EvaluateBusinessIdeaAsync(BusinessIdea idea);
        Task<IdeaInsightsDto> GenerateIdeaInsightsAsync(string title, string description);
    }
}
