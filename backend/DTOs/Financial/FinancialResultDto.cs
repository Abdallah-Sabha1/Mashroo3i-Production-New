namespace backend.DTOs.Financial
{
    public class FinancialResultDto
    {
        public int PlanId { get; set; }
        public int IdeaId { get; set; }
        public string BusinessType { get; set; } = "B2C";

        // ── Core inputs preserved ─────────────────────────────────────────────
        public decimal InitialInvestment { get; set; }
        public decimal PlannedPrice { get; set; }

        // ── Calculated financials ─────────────────────────────────────────────
        public decimal MonthlyRevenue { get; set; }
        public decimal MonthlyCosts { get; set; }
        public decimal MonthlyProfit { get; set; }
        public decimal GrossMarginPct { get; set; }

        // ── Unit economics ────────────────────────────────────────────────────
        public decimal LTV { get; set; }
        public decimal CAC { get; set; }
        public decimal LtvCacRatio { get; set; }
        public decimal BreakEvenUnits { get; set; }
        public int BreakEvenMonths { get; set; }
        public decimal RoiPercentage { get; set; }
        public decimal ARR { get; set; }

        // ── 3 Scenarios ───────────────────────────────────────────────────────
        public ScenarioResultDto? Conservative { get; set; }
        public ScenarioResultDto? Realistic { get; set; }
        public ScenarioResultDto? Optimistic { get; set; }

        // ── Insights ──────────────────────────────────────────────────────────
        public List<string> RedFlags { get; set; } = new();
        public List<BenchmarkComparisonDto> BenchmarkComparisons { get; set; } = new();
        public List<string> AssumptionsLog { get; set; } = new();
        public List<MonthlyProjectionDto> MonthlyProjections { get; set; } = new();

        public DateTime CreatedAt { get; set; }
    }

    public class ScenarioResultDto
    {
        public decimal MonthlyRevenue { get; set; }
        public decimal MonthlyCosts { get; set; }
        public decimal MonthlyProfit { get; set; }
        public int BreakEvenMonths { get; set; }
        public decimal Roi24Months { get; set; }
    }

    public class BenchmarkComparisonDto
    {
        public string Metric { get; set; } = string.Empty;
        public string YourValue { get; set; } = string.Empty;
        public string BenchmarkTypical { get; set; } = string.Empty;
        /// <summary>"ok" | "warning" | "danger"</summary>
        public string Status { get; set; } = "ok";
    }

    public class MonthlyProjectionDto
    {
        public int Month { get; set; }
        public decimal Revenue { get; set; }
        public decimal Costs { get; set; }
        public decimal Profit { get; set; }
        public decimal CumulativeCash { get; set; }
    }
}
