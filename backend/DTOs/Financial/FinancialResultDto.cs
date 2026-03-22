namespace backend.DTOs.Financial
{
    public class FinancialResultDto
    {
        public int PlanId { get; set; }
        public int IdeaId { get; set; }
        public decimal InitialInvestment { get; set; }
        public decimal MonthlyRevenue { get; set; }
        public decimal MonthlyCosts { get; set; }
        public int BreakEvenMonths { get; set; }
        public decimal RoiPercentage { get; set; }
        public object? FinancialSummary { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
