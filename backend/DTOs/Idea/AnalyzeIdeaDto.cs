using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Idea
{
    public class AnalyzeIdeaDto
    {
        [Required, MinLength(5), MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required, MinLength(100), MaxLength(2000)]
        public string Description { get; set; } = string.Empty;
    }
}
