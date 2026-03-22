using backend.DTOs.Idea;
using backend.Services.Interfaces;

namespace backend.Services
{
    public class IdeaAnalysisService : IIdeaAnalysisService
    {
        private readonly IGeminiAIService _geminiAI;
        private readonly ILogger<IdeaAnalysisService> _logger;

        public IdeaAnalysisService(IGeminiAIService geminiAI, ILogger<IdeaAnalysisService> logger)
        {
            _geminiAI = geminiAI;
            _logger = logger;
        }

        public async Task<IdeaInsightsDto> AnalyzeIdeaAsync(string title, string description)
        {
            try
            {
                _logger.LogInformation("Analyzing idea: {Title}", title);
                var insights = await _geminiAI.GenerateIdeaInsightsAsync(title, description);
                return insights;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error analyzing idea");
                throw;
            }
        }
    }
}
