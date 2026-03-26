namespace backend.Models
{
    public class Evaluation
    {
        public int EvaluationId { get; set; }
        public int IdeaId { get; set; }
        public int NoveltyScore { get; set; }
        public int MarketPotentialScore { get; set; }
        public int OverallScore { get; set; }
        public string RiskLevel { get; set; } = string.Empty;
        public string SwotAnalysis { get; set; } = "{}";
        public string? Recommendations { get; set; }
        public string? Verdict { get; set; }
        public string? RedFlags { get; set; }
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;

        public BusinessIdea BusinessIdea { get; set; } = null!;
    }
}
