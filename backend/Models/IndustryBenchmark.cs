namespace backend.Models
{
    public class IndustryBenchmark
    {
        public int Id { get; set; }
        public string IndustryType { get; set; } = string.Empty;
        public string IndustryNameAr { get; set; } = string.Empty;
        public string IndustryNameEn { get; set; } = string.Empty;
        public string BusinessModel { get; set; } = "B2C";   // "B2C" | "B2B"
        public string BusinessModelAr { get; set; } = string.Empty;
        public string Region { get; set; } = "Amman";
        public string? Subregion { get; set; }
        public string? DataVersion { get; set; }
        public decimal Confidence { get; set; }
        public string ConfidenceLevel { get; set; } = "MEDIUM"; // "HIGH" | "MEDIUM" | "LOW"
        public int DataAgeMonths { get; set; }

        // ── Startup Costs (JOD) ─────────────────────────────────
        public decimal StartupCostLow { get; set; }
        public decimal StartupCostMid { get; set; }
        public decimal StartupCostHigh { get; set; }
        public string StartupCostCurrency { get; set; } = "JOD";
        public string? StartupCostNotes { get; set; }

        // ── Monthly Operating Costs (JOD) ───────────────────────
        public decimal MonthlyCostLow { get; set; }
        public decimal MonthlyCostHigh { get; set; }
        public decimal MonthlyCostTypical { get; set; }
        public string? MonthlyCostBreakdownJson { get; set; }  // JSON object

        // ── Margins (%) ─────────────────────────────────────────
        public decimal GrossMarginLow { get; set; }
        public decimal GrossMarginHigh { get; set; }
        public decimal GrossMarginTypical { get; set; }
        public decimal NetMarginLow { get; set; }
        public decimal NetMarginHigh { get; set; }
        public decimal NetMarginTypical { get; set; }

        // ── Revenue ─────────────────────────────────────────────
        public decimal AverageOrderValueLow { get; set; }
        public decimal AverageOrderValueHigh { get; set; }
        public decimal AverageOrderValueTypical { get; set; }
        public string? RevenueProjectionByMonthJson { get; set; } // JSON array
        public decimal MonthlyGrowthRatePercent { get; set; }

        // ── Customer Acquisition ────────────────────────────────
        public string? CustomerAcquisitionCostJson { get; set; } // JSON by channel
        public decimal AverageCACTypical { get; set; }

        // ── Churn / Retention ───────────────────────────────────
        public decimal MonthlyChurnRateLow { get; set; }
        public decimal MonthlyChurnRateHigh { get; set; }
        public decimal MonthlyChurnRateTypical { get; set; }
        public decimal CustomerRetentionRatePercent { get; set; }

        // ── Break-Even (months) ─────────────────────────────────
        public int BreakEvenMonthsLow { get; set; }
        public int BreakEvenMonthsHigh { get; set; }
        public int BreakEvenMonthsTypical { get; set; }

        // ── Meta ────────────────────────────────────────────────
        public string? RedFlagsJson { get; set; }
        public DateTime DataCollectionDate { get; set; } = DateTime.UtcNow;
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
        public string? DataSourcesJson { get; set; }
        public string? NotesAndContext { get; set; }

        // ── Navigation ──────────────────────────────────────────
        public virtual ICollection<FinancialProjection> FinancialProjections { get; set; }
            = new List<FinancialProjection>();
    }
}
