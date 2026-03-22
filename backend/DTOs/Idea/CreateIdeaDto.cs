using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Idea
{
    public class CreateIdeaDto
    {
        [Required, MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        public string? ProblemStatement { get; set; }
        public string? TargetAudience { get; set; }
        public string? Usp { get; set; }

        [Required]
        public string Sector { get; set; } = string.Empty;

        [Required]
        public decimal EstimatedBudget { get; set; }

        public string? Location { get; set; }
        public string? MarketSize { get; set; }
        public string? CompetitionLevel { get; set; }
    }
}
