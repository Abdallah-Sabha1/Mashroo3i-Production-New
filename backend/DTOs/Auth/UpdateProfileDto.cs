namespace backend.DTOs.Auth
{
    public class UpdateProfileDto
    {
        public string? FullName { get; set; }
        public string? Education { get; set; }
        public string? Experience { get; set; }
        public string? BusinessInterest { get; set; }
    }
}
