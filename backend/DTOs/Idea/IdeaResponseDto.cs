namespace backend.DTOs.Idea
{
    public class IdeaResponseDto
    {
        public int IdeaId { get; set; }
        public int UserId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? ProblemStatement { get; set; }
        public string? TargetAudience { get; set; }
        public string? Usp { get; set; }
        public string BusinessType { get; set; } = "B2C";
        public string Sector { get; set; } = "other";
        public string AmmanRegion { get; set; } = "central";
        public string? BusinessTypeReason { get; set; }
        public decimal EstimatedBudget { get; set; }
        public string? MarketSize { get; set; }
        public string? CompetitionLevel { get; set; }
        public string Status { get; set; } = "submitted";
        public DateTime CreatedAt { get; set; }
        public EvaluationBriefDto? Evaluation { get; set; }
        public bool HasFinancialPlan { get; set; }
    }

    public class EvaluationBriefDto
    {
        public int OverallScore { get; set; }
        public string RiskLevel { get; set; } = string.Empty;
    }
}
