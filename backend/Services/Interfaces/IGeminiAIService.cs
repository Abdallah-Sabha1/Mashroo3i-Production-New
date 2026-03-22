using backend.Models;

namespace backend.Services.Interfaces
{
    public interface IGeminiAIService
    {
        Task<Evaluation> EvaluateBusinessIdea(BusinessIdea idea);
    }
}
