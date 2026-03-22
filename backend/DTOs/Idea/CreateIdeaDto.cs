using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Idea
{
    public class CreateIdeaDto
    {
        [Required, MaxLength(200), MinLength(5)]
        public string Title { get; set; } = string.Empty;

        [Required, MinLength(100), MaxLength(2000)]
        public string Description { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? ProblemStatement { get; set; }

        [MaxLength(1000)]
        public string? TargetAudience { get; set; }

        [MaxLength(1000)]
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
