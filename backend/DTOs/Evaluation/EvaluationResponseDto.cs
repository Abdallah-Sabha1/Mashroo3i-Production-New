namespace backend.DTOs.Evaluation
{
    public class EvaluationResponseDto
    {
        public int EvaluationId { get; set; }
        public int IdeaId { get; set; }
        public int NoveltyScore { get; set; }
        public int MarketPotentialScore { get; set; }
        public int OverallScore { get; set; }
        public string RiskLevel { get; set; } = string.Empty;
        public object SwotAnalysis { get; set; } = new { };
        public string? Recommendations { get; set; }
        public DateTime GeneratedAt { get; set; }
    }
}
