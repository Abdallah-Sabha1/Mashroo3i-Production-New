namespace backend.DTOs.Auth
{
    public class AuthResponseDto
    {
        public int UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Education { get; set; }
        public string? Experience { get; set; }
        public string? BusinessInterest { get; set; }
        public string Token { get; set; } = string.Empty;
    }
}
