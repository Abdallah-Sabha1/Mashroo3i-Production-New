namespace backend.Models
{
    public class FinancialProjection
    {
        public int Id { get; set; }
        public int BusinessIdeaId { get; set; }
        public int BenchmarkId { get; set; }
        public string SelectedIndustryType { get; set; } = string.Empty;
        public string SelectedBusinessModel { get; set; } = string.Empty;

        // ── User Overrides (null = use benchmark default) ───────
        public decimal? UserInitialInvestment { get; set; }
        public decimal? UserMonthlyRevenueAssumption { get; set; }
        public decimal? UserProfitMarginAssumption { get; set; }
        public decimal? UserMonthlyGrowthRate { get; set; }

        // ── Effective Values (override ?? benchmark) ────────────
        public decimal EffectiveInitialInvestment { get; set; }
        public decimal EffectiveMonthlyRevenue { get; set; }
        public decimal EffectiveGrossMargin { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public string? NotesFromUser { get; set; }

        // ── Navigation ──────────────────────────────────────────
        public virtual BusinessIdea BusinessIdea { get; set; } = null!;
        public virtual IndustryBenchmark Benchmark { get; set; } = null!;
        public virtual ICollection<ProjectionScenario> Scenarios { get; set; }
            = new List<ProjectionScenario>();
    }

    public class ProjectionScenario
    {
        public int Id { get; set; }
        public int FinancialProjectionId { get; set; }
        public string ScenarioName { get; set; } = string.Empty;        // "Optimistic" | "Realistic" | "Pessimistic"
        public string ScenarioNameAr { get; set; } = string.Empty;
        public string? ScenarioDescription { get; set; }
        public decimal RevenueMultiplier { get; set; }
        public decimal CostMultiplier { get; set; }
        public string MonthlyDataJson { get; set; } = "[]";             // JSON array of MonthlyProjectionData
        public int BreakEvenMonth { get; set; }
        public decimal ROI12Months { get; set; }
        public decimal TotalProfit12Months { get; set; }
        public decimal CumulativeCashFlow12Months { get; set; }
        public decimal AvgMonthlyRevenue { get; set; }
        public decimal AvgMonthlyProfit { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // ── Navigation ──────────────────────────────────────────
        public virtual FinancialProjection FinancialProjection { get; set; } = null!;
    }

    /// <summary>POCO (not a DB entity) used for JSON serialization inside MonthlyDataJson.</summary>
    public class MonthlyProjectionData
    {
        public int Month { get; set; }
        public decimal Revenue { get; set; }
        public decimal Costs { get; set; }
        public decimal Profit { get; set; }
        public decimal CumulativeCashFlow { get; set; }
        public decimal MarginPercent { get; set; }
    }
}
