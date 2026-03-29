namespace backend.DTOs
{
    // ── Requests ────────────────────────────────────────────────────────────────

    public class CreateProjectionRequest
    {
        public string IndustryType { get; set; } = string.Empty;
        public string BusinessModel { get; set; } = "B2C";
        public decimal? InitialInvestment { get; set; }
        public decimal? MonthlyRevenue { get; set; }
        public decimal? ProfitMargin { get; set; }
        public decimal? GrowthRate { get; set; }
    }

    public class UpdateProjectionRequest
    {
        public decimal? InitialInvestment { get; set; }
        public decimal? MonthlyRevenue { get; set; }
        public decimal? ProfitMargin { get; set; }
        public decimal? GrowthRate { get; set; }
        public string? Notes { get; set; }
    }

    // ── Responses ───────────────────────────────────────────────────────────────

    public class BenchmarkResponse
    {
        public int Id { get; set; }
        public string IndustryNameAr { get; set; } = string.Empty;
        public string IndustryNameEn { get; set; } = string.Empty;
        public string BusinessModel { get; set; } = string.Empty;
        public decimal Confidence { get; set; }
        public string ConfidenceLevel { get; set; } = string.Empty;
        public decimal StartupCostLow { get; set; }
        public decimal StartupCostMid { get; set; }
        public decimal StartupCostHigh { get; set; }
        public decimal MonthlyCostLow { get; set; }
        public decimal MonthlyCostTypical { get; set; }
        public decimal MonthlyCostHigh { get; set; }
        public decimal GrossMarginLow { get; set; }
        public decimal GrossMarginTypical { get; set; }
        public decimal GrossMarginHigh { get; set; }
        public int BreakEvenMonthsLow { get; set; }
        public int BreakEvenMonthsTypical { get; set; }
        public int BreakEvenMonthsHigh { get; set; }
        public decimal MonthlyGrowthRatePercent { get; set; }
        public decimal AverageOrderValueTypical { get; set; }
        public decimal AverageCACTypical { get; set; }
        public string? DataSourcesJson { get; set; }
        public string? NotesAndContext { get; set; }
    }

    public class IndustryListItem
    {
        public string IndustryType { get; set; } = string.Empty;
        public string IndustryNameAr { get; set; } = string.Empty;
        public string IndustryNameEn { get; set; } = string.Empty;
        public List<string> AvailableModels { get; set; } = new();
    }

    public class MonthlyDataResponse
    {
        public int Month { get; set; }
        public decimal Revenue { get; set; }
        public decimal Costs { get; set; }
        public decimal Profit { get; set; }
        public decimal CumulativeCashFlow { get; set; }
        public decimal MarginPercent { get; set; }
    }

    public class ScenarioResponse
    {
        public string Name { get; set; } = string.Empty;
        public string NameAr { get; set; } = string.Empty;
        public string? Description { get; set; }
        public List<MonthlyDataResponse> MonthlyData { get; set; } = new();
        public int BreakEvenMonth { get; set; }
        public decimal ROI { get; set; }
        public decimal TotalProfit { get; set; }
        public decimal CumulativeCashFlow { get; set; }
        public decimal AvgMonthlyRevenue { get; set; }
        public decimal AvgMonthlyProfit { get; set; }
    }

    public class FinancialProjectionResponse
    {
        public int Id { get; set; }
        public string IndustryType { get; set; } = string.Empty;
        public string BusinessModel { get; set; } = string.Empty;
        public BenchmarkResponse Benchmark { get; set; } = new();
        public decimal EffectiveInitialInvestment { get; set; }
        public decimal EffectiveMonthlyRevenue { get; set; }
        public decimal EffectiveGrossMargin { get; set; }
        public decimal? UserInitialInvestment { get; set; }
        public decimal? UserMonthlyRevenueAssumption { get; set; }
        public decimal? UserProfitMarginAssumption { get; set; }
        public decimal? UserMonthlyGrowthRate { get; set; }
        public ScenarioResponse? OptimisticScenario { get; set; }
        public ScenarioResponse? RealisticScenario { get; set; }
        public ScenarioResponse? PessimisticScenario { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
