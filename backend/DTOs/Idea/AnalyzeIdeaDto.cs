using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Idea
{
    public class AnalyzeIdeaDto
    {
        [Required(ErrorMessage = "Title is required")]
        [StringLength(200, MinimumLength = 5, ErrorMessage = "Title must be between 5 and 200 characters")]
        public string Title { get; set; } = string.Empty;

        [Required(ErrorMessage = "Description is required")]
        [StringLength(2000, MinimumLength = 100, ErrorMessage = "Description must be between 100 and 2000 characters")]
        public string Description { get; set; } = string.Empty;

        public string Sector { get; set; } = "other";
    }
}
