namespace backend.Models
{
    public class FinancialPlan
    {
        public int PlanId { get; set; }
        public int IdeaId { get; set; }
        public decimal InitialInvestment { get; set; }
        public decimal MonthlyRevenue { get; set; }
        public decimal MonthlyCosts { get; set; }
        public int BreakEvenMonths { get; set; }
        public decimal RoiPercentage { get; set; }
        public decimal MonthlyProfit { get; set; }
        public decimal GrossMarginPct { get; set; }
        public decimal LTV { get; set; }
        public decimal CAC { get; set; }
        public decimal LtvCacRatio { get; set; }
        public decimal BreakEvenUnits { get; set; }
        public decimal ARR { get; set; }
        public string? FinancialSummary { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public BusinessIdea BusinessIdea { get; set; } = null!;
    }
}
