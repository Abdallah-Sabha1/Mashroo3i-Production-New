namespace backend.Services.Models
{
    public class SectorBenchmark
    {
        public MetricRange? StartupCost { get; set; }
        public MetricRange? MonthlyFixedCosts { get; set; }
        public MetricRange? GrossMargin { get; set; }
        public MetricRange? Cac { get; set; }
        public MetricRange? MonthlyChurnRate { get; set; }
        public MetricRange? BreakEvenMonths { get; set; }
        public MetricRange? WinRate { get; set; }
        public MetricRange? ClientRetentionRate { get; set; }
    }

    public class MetricRange
    {
        public decimal Low { get; set; }
        public decimal High { get; set; }
        public decimal Typical { get; set; }
    }

    public class RedFlagRules
    {
        public RedFlagThreshold LtvCacRatio { get; set; } = new();
        public RedFlagThreshold GrossMarginPct { get; set; } = new();
        public RedFlagThreshold BreakEvenMonths { get; set; } = new();
        public RedFlagThreshold MonthlyChurnPct { get; set; } = new();
    }

    public class RedFlagThreshold
    {
        public double Danger { get; set; }
        public double Warning { get; set; }
    }

    public class ScenarioMultipliers
    {
        public ScenarioEntry Conservative { get; set; } = new();
        public ScenarioEntry Realistic { get; set; } = new();
        public ScenarioEntry Optimistic { get; set; } = new();
    }

    public class ScenarioEntry
    {
        public double RevenueMultiplier { get; set; }
        public double CostMultiplier { get; set; }
    }
}
