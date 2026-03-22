namespace backend.Models
{
    public class User
    {
        public int UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string? Education { get; set; }
        public string? Experience { get; set; }
        public string? BusinessInterest { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public ICollection<BusinessIdea> BusinessIdeas { get; set; } = new List<BusinessIdea>();
    }
}
