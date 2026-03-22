namespace backend.DTOs.Idea
{
    public class UpdateIdeaDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? ProblemStatement { get; set; }
        public string? TargetAudience { get; set; }
        public string? Usp { get; set; }
        public string? Sector { get; set; }
        public decimal? EstimatedBudget { get; set; }
        public string? Location { get; set; }
        public string? MarketSize { get; set; }
        public string? CompetitionLevel { get; set; }
    }
}
