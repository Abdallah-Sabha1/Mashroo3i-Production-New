namespace backend.Models
{
    public class BusinessIdea
    {
        public int IdeaId { get; set; }
        public int UserId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? ProblemStatement { get; set; }
        public string? TargetAudience { get; set; }
        public string? Usp { get; set; }
        public string Sector { get; set; } = string.Empty;
        public decimal EstimatedBudget { get; set; }
        public string? Location { get; set; }
        public string? MarketSize { get; set; }
        public string? CompetitionLevel { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public User User { get; set; } = null!;
        public Evaluation? Evaluation { get; set; }
        public FinancialPlan? FinancialPlan { get; set; }
    }
}
