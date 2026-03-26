using System.Text.Json;
using backend.DTOs.Financial;
using backend.Models;
using backend.Services.Interfaces;
using backend.Services.Models;

namespace backend.Services
{
    public class FinancialService : IFinancialService
    {
        private readonly IBenchmarkService _benchmarkService;

        public FinancialService(IBenchmarkService benchmarkService)
        {
            _benchmarkService = benchmarkService;
        }

        public FinancialCalculationResult CalculateFinancialPlan(FinancialInputDto input, BusinessIdea idea)
        {
            var isB2B = idea.BusinessType.Equals("B2B", StringComparison.OrdinalIgnoreCase);
            return isB2B ? CalculateB2B(input, idea) : CalculateB2C(input, idea);
        }

        // ── B2C ───────────────────────────────────────────────────────────────

        private FinancialCalculationResult CalculateB2C(FinancialInputDto input, BusinessIdea idea)
        {
            var assumptions = new List<string>();
            var benchmark = _benchmarkService.GetBenchmark(idea.Sector, "B2C");
            var regionCostMult = _benchmarkService.GetRegionCostMultiplier(idea.AmmanRegion);
            var regionAovMult = _benchmarkService.GetRegionAovMultiplier(idea.AmmanRegion);
            var channelMult = _benchmarkService.GetChannelCacMultiplier(input.AcquisitionChannel);

            // Sales volume
            var salesMidpoint = GetRangeMidpoint(input.EstimatedMonthlySalesRange, 50m);
            assumptions.Add($"Monthly sales midpoint: {salesMidpoint} units (from '{input.EstimatedMonthlySalesRange ?? "default"}')");

            // Revenue (apply region AOV multiplier)
            var monthlyRevenue = input.PlannedPrice * salesMidpoint * (decimal)regionAovMult;
            if (Math.Abs(regionAovMult - 1.0) > 0.001)
                assumptions.Add($"Price adjusted for {idea.AmmanRegion} Amman region (AOV ×{regionAovMult:F2})");

            // COGS & gross margin
            var cogs = input.CostToDeliver * salesMidpoint;
            var grossProfit = monthlyRevenue - cogs;
            var grossMarginPct = monthlyRevenue > 0 ? grossProfit / monthlyRevenue * 100m : 0m;
            assumptions.Add($"Gross margin: {grossMarginPct:F1}% (price {input.PlannedPrice} − cost {input.CostToDeliver} JOD per unit)");

            // Fixed costs from sector benchmark
            var benchmarkFixed = benchmark?.MonthlyFixedCosts?.Typical ?? 500m;
            var fixedCosts = benchmarkFixed * (decimal)regionCostMult;
            assumptions.Add($"Fixed costs: {fixedCosts:N0} JOD/month ({idea.Sector} benchmark × {regionCostMult:F2} region multiplier)");

            var monthlyCosts = cogs + fixedCosts;
            var monthlyProfit = monthlyRevenue - monthlyCosts;

            // CAC
            var baseCac = benchmark?.Cac?.Typical ?? 30m;
            var cac = baseCac * (decimal)channelMult;
            assumptions.Add($"CAC: {cac:N0} JOD via '{input.AcquisitionChannel}' channel (base {baseCac:N0} × {channelMult:F2})");

            // LTV (using monthly churn)
            var churnRate = benchmark?.MonthlyChurnRate?.Typical ?? 0.05m;
            var ltv = churnRate > 0 ? (input.PlannedPrice * grossMarginPct / 100m) / churnRate : 0m;
            assumptions.Add($"Monthly churn: {churnRate * 100:F1}% → LTV: {ltv:N0} JOD");

            var ltvCacRatio = cac > 0 ? ltv / cac : 0m;

            // Break-even
            var contribution = input.PlannedPrice - input.CostToDeliver;
            var breakEvenUnits = contribution > 0 ? fixedCosts / contribution : 0m;
            var breakEvenMonths = monthlyProfit > 0
                ? (int)Math.Ceiling(input.InitialInvestment / monthlyProfit)
                : -1;

            var arr = monthlyRevenue * 12m;

            return BuildResult(input.InitialInvestment, monthlyRevenue, monthlyCosts, monthlyProfit,
                grossMarginPct, ltv, cac, ltvCacRatio, breakEvenUnits, breakEvenMonths, arr,
                input.PlannedPrice, "B2C", assumptions, benchmark, churnRate);
        }

        // ── B2B ───────────────────────────────────────────────────────────────

        private FinancialCalculationResult CalculateB2B(FinancialInputDto input, BusinessIdea idea)
        {
            var assumptions = new List<string>();
            var benchmark = _benchmarkService.GetBenchmark(idea.Sector, "B2B");
            var regionCostMult = _benchmarkService.GetRegionCostMultiplier(idea.AmmanRegion);
            var channelMult = _benchmarkService.GetChannelCacMultiplier(input.AcquisitionChannel);

            // Clients
            var clientsMidpoint = GetRangeMidpoint(input.TargetClientsYear1Range, 5m);
            assumptions.Add($"Year-1 clients midpoint: {clientsMidpoint} (from '{input.TargetClientsYear1Range ?? "default"}')");

            var dealMonths = input.EstimatedDealClosingMonths > 0 ? input.EstimatedDealClosingMonths : 3m;
            assumptions.Add($"Average deal closing time: {dealMonths} months");

            // Revenue (PlannedPrice = monthly fee per client)
            var monthlyRevenue = clientsMidpoint * input.PlannedPrice;
            var arr = monthlyRevenue * 12m;
            assumptions.Add($"Monthly revenue: {clientsMidpoint} clients × {input.PlannedPrice:N0} JOD = {monthlyRevenue:N0} JOD");

            // COGS & gross margin
            var cogs = input.CostToDeliver * clientsMidpoint;
            var grossProfit = monthlyRevenue - cogs;
            var grossMarginPct = monthlyRevenue > 0 ? grossProfit / monthlyRevenue * 100m : 0m;
            assumptions.Add($"Gross margin: {grossMarginPct:F1}%");

            // Fixed costs
            var benchmarkFixed = benchmark?.MonthlyFixedCosts?.Typical ?? 800m;
            var fixedCosts = benchmarkFixed * (decimal)regionCostMult;
            assumptions.Add($"Fixed costs: {fixedCosts:N0} JOD/month ({idea.Sector} B2B benchmark × {regionCostMult:F2})");

            var monthlyCosts = cogs + fixedCosts;
            var monthlyProfit = monthlyRevenue - monthlyCosts;

            // CAC
            var baseCac = benchmark?.Cac?.Typical ?? 500m;
            var cac = baseCac * (decimal)channelMult;
            assumptions.Add($"CAC: {cac:N0} JOD via '{input.AcquisitionChannel}'");

            // LTV (B2B uses annual retention → monthly churn)
            var annualRetention = benchmark?.ClientRetentionRate?.Typical ?? 0.80m;
            var monthlyChurn = (1m - annualRetention) / 12m;
            var ltv = monthlyChurn > 0 ? (input.PlannedPrice * grossMarginPct / 100m) / monthlyChurn : 0m;
            assumptions.Add($"Annual retention: {annualRetention * 100:F0}% → monthly churn {monthlyChurn * 100:F1}% → LTV: {ltv:N0} JOD");

            var ltvCacRatio = cac > 0 ? ltv / cac : 0m;

            // Break-even
            var contribution = input.PlannedPrice - input.CostToDeliver;
            var breakEvenUnits = contribution > 0 ? fixedCosts / contribution : 0m;
            var breakEvenMonths = monthlyProfit > 0
                ? (int)Math.Ceiling(input.InitialInvestment / monthlyProfit)
                : -1;

            return BuildResult(input.InitialInvestment, monthlyRevenue, monthlyCosts, monthlyProfit,
                grossMarginPct, ltv, cac, ltvCacRatio, breakEvenUnits, breakEvenMonths, arr,
                input.PlannedPrice, "B2B", assumptions, benchmark, monthlyChurn);
        }

        // ── Shared builder ────────────────────────────────────────────────────

        private FinancialCalculationResult BuildResult(
            decimal initialInvestment,
            decimal monthlyRevenue, decimal monthlyCosts, decimal monthlyProfit,
            decimal grossMarginPct, decimal ltv, decimal cac, decimal ltvCacRatio,
            decimal breakEvenUnits, int breakEvenMonths, decimal arr,
            decimal plannedPrice, string businessType,
            List<string> assumptions, SectorBenchmark? benchmark, decimal monthlyChurnRate)
        {
            // Clamp unstable values
            var clampedBep = breakEvenMonths > 9999 ? 9999 : breakEvenMonths;
            var totalProfit24 = monthlyProfit * 24m;
            var roi = initialInvestment > 0
                ? ((totalProfit24 - initialInvestment) / initialInvestment) * 100m
                : 0m;
            var clampedRoi = Math.Max(-9_999_999m, Math.Min(9_999_999m, Math.Round(roi, 2)));

            // Scenarios
            var mults = _benchmarkService.GetScenarioMultipliers();
            var conservative = BuildScenario(monthlyRevenue, monthlyCosts, initialInvestment, mults.Conservative);
            var realistic    = BuildScenario(monthlyRevenue, monthlyCosts, initialInvestment, mults.Realistic);
            var optimistic   = BuildScenario(monthlyRevenue, monthlyCosts, initialInvestment, mults.Optimistic);

            // Red flags & comparisons
            var redFlags = BuildRedFlags(grossMarginPct, ltvCacRatio, clampedBep, monthlyChurnRate);
            var benchmarkComparisons = BuildBenchmarkComparisons(grossMarginPct, ltvCacRatio, clampedBep, benchmark);
            var projections = BuildMonthlyProjections(monthlyRevenue, monthlyCosts, initialInvestment);

            var richSummary = new
            {
                businessType,
                plannedPrice            = Math.Round(plannedPrice, 2),
                grossMarginPct          = Math.Round(grossMarginPct, 2),
                monthlyProfit           = Math.Round(monthlyProfit, 2),
                ltv                     = Math.Round(ltv, 2),
                cac                     = Math.Round(cac, 2),
                ltvCacRatio             = Math.Round(ltvCacRatio, 2),
                breakEvenUnits          = Math.Round(breakEvenUnits, 1),
                arr                     = Math.Round(arr, 2),
                conservative,
                realistic,
                optimistic,
                redFlags,
                benchmarkComparisons,
                assumptionsLog          = assumptions,
                monthlyProjections      = projections
            };

            return new FinancialCalculationResult
            {
                MonthlyRevenue        = Math.Round(monthlyRevenue, 2),
                MonthlyCosts          = Math.Round(monthlyCosts, 2),
                MonthlyProfit         = Math.Round(monthlyProfit, 2),
                BreakEvenMonths       = clampedBep,
                RoiPercentage         = clampedRoi,
                FinancialSummaryJson  = JsonSerializer.Serialize(richSummary)
            };
        }

        // ── Helpers ───────────────────────────────────────────────────────────

        private static decimal GetRangeMidpoint(string? range, decimal defaultValue)
        {
            if (string.IsNullOrWhiteSpace(range)) return defaultValue;
            var parts = range.Split('-');
            if (parts.Length == 2
                && decimal.TryParse(parts[0].Trim(), out var lo)
                && decimal.TryParse(parts[1].Trim(), out var hi))
                return (lo + hi) / 2m;
            if (decimal.TryParse(range.Trim(), out var single))
                return single;
            return defaultValue;
        }

        private static object BuildScenario(decimal revenue, decimal costs, decimal initialInvestment, ScenarioEntry mult)
        {
            var rev    = Math.Round(revenue * (decimal)mult.RevenueMultiplier, 2);
            var cos    = Math.Round(costs   * (decimal)mult.CostMultiplier,    2);
            var profit = rev - cos;
            var bep    = profit > 0 ? (int)Math.Ceiling(initialInvestment / profit) : -1;
            var bepC   = bep > 9999 ? 9999 : bep;
            var roi24  = initialInvestment > 0
                ? Math.Round(((profit * 24m - initialInvestment) / initialInvestment) * 100m, 2)
                : 0m;
            roi24 = Math.Max(-9_999_999m, Math.Min(9_999_999m, roi24));
            return new
            {
                monthlyRevenue  = rev,
                monthlyCosts    = cos,
                monthlyProfit   = Math.Round(profit, 2),
                breakEvenMonths = bepC,
                roi24Months     = roi24
            };
        }

        private List<string> BuildRedFlags(decimal grossMarginPct, decimal ltvCacRatio, int bepMonths, decimal monthlyChurn)
        {
            var flags = new List<string>();
            var rules = _benchmarkService.GetRedFlagRules();

            if (grossMarginPct < (decimal)rules.GrossMarginPct.Danger)
                flags.Add($"Gross margin ({grossMarginPct:F1}%) is critically low — below {rules.GrossMarginPct.Danger:F0}% minimum");
            else if (grossMarginPct < (decimal)rules.GrossMarginPct.Warning)
                flags.Add($"Gross margin ({grossMarginPct:F1}%) is below the recommended {rules.GrossMarginPct.Warning:F0}% threshold");

            if (ltvCacRatio < (decimal)rules.LtvCacRatio.Danger)
                flags.Add($"LTV:CAC ratio ({ltvCacRatio:F1}×) is unsustainable — acquiring customers costs more than their lifetime value");
            else if (ltvCacRatio < (decimal)rules.LtvCacRatio.Warning)
                flags.Add($"LTV:CAC ratio ({ltvCacRatio:F1}×) is below the healthy 3× threshold");

            if (bepMonths < 0 || bepMonths > (int)rules.BreakEvenMonths.Danger)
                flags.Add($"Break-even ({(bepMonths < 0 ? "never" : bepMonths + " months")}) is extremely long — high capital risk");
            else if (bepMonths > (int)rules.BreakEvenMonths.Warning)
                flags.Add($"Break-even in {bepMonths} months — above the recommended {rules.BreakEvenMonths.Warning:F0} months");

            var churnPct = monthlyChurn * 100m;
            if (churnPct > (decimal)rules.MonthlyChurnPct.Danger)
                flags.Add($"Monthly churn ({churnPct:F1}%) is critically high — unsustainable long-term");
            else if (churnPct > (decimal)rules.MonthlyChurnPct.Warning)
                flags.Add($"Monthly churn ({churnPct:F1}%) is above the {rules.MonthlyChurnPct.Warning:F0}% warning threshold");

            return flags;
        }

        private static List<object> BuildBenchmarkComparisons(decimal grossMarginPct, decimal ltvCacRatio, int bepMonths, SectorBenchmark? benchmark)
        {
            var list = new List<object>();

            if (benchmark?.GrossMargin != null)
            {
                var s = grossMarginPct >= benchmark.GrossMargin.Typical ? "ok"
                      : grossMarginPct >= benchmark.GrossMargin.Low     ? "warning"
                      : "danger";
                list.Add(new { metric = "Gross Margin", yourValue = $"{grossMarginPct:F1}%", benchmarkTypical = $"{benchmark.GrossMargin.Typical:F0}%", status = s });
            }

            if (benchmark?.BreakEvenMonths != null)
            {
                var s = bepMonths < 0                                       ? "danger"
                      : bepMonths <= benchmark.BreakEvenMonths.Typical      ? "ok"
                      : bepMonths <= benchmark.BreakEvenMonths.High         ? "warning"
                      : "danger";
                list.Add(new { metric = "Break-Even", yourValue = bepMonths < 0 ? "Never" : $"{bepMonths} mo", benchmarkTypical = $"{benchmark.BreakEvenMonths.Typical:F0} mo", status = s });
            }

            var ltvS = ltvCacRatio >= 3m ? "ok" : ltvCacRatio >= 1m ? "warning" : "danger";
            list.Add(new { metric = "LTV:CAC Ratio", yourValue = $"{ltvCacRatio:F1}×", benchmarkTypical = "3×+", status = ltvS });

            if (benchmark?.Cac != null)
            {
                var s = "ok"; // CAC is informational here
                list.Add(new { metric = "Sector CAC", yourValue = "See above", benchmarkTypical = $"{benchmark.Cac.Typical:N0} JOD", status = s });
            }

            return list;
        }

        private static List<object> BuildMonthlyProjections(decimal monthlyRevenue, decimal monthlyCosts, decimal initialInvestment)
        {
            var projections = new List<object>();
            decimal cumulative = -initialInvestment;
            decimal rev = monthlyRevenue;
            decimal cos = monthlyCosts;

            for (int m = 1; m <= 24; m++)
            {
                if (m > 1) { rev *= 1.02m; cos *= 1.01m; }
                var profit = rev - cos;
                cumulative += profit;
                projections.Add(new
                {
                    month          = m,
                    revenue        = Math.Round(rev, 2),
                    costs          = Math.Round(cos, 2),
                    profit         = Math.Round(profit, 2),
                    cumulativeCash = Math.Round(cumulative, 2)
                });
            }
            return projections;
        }
    }
}
