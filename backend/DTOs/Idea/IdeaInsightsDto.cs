namespace backend.DTOs.Idea
{
    public class IdeaInsightsDto
    {
        public string ProblemStatement { get; set; } = string.Empty;
        public string UniqueSellingPoint { get; set; } = string.Empty;
        public string TargetAudience { get; set; } = string.Empty;
        public string SuggestedBusinessType { get; set; } = "B2C";
        public string BusinessTypeConfidence { get; set; } = "LOW";
        public string BusinessTypeReason { get; set; } = string.Empty;
        public string SuggestedMonthlySalesRange { get; set; } = "1_10";
    }
}
