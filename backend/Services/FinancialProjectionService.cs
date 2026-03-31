using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.DTOs;
using backend.Models;
using backend.Services.Interfaces;

namespace backend.Services
{
    public class FinancialProjectionService : IFinancialProjectionService
    {
        private readonly ApplicationDbContext _db;

        // Scenario multipliers
        private static readonly (string Name, string NameAr, string Desc, decimal RevMult, decimal CostMult)[] Scenarios =
        {
            ("Optimistic",   "متفائل",  "أفضل الحالات — سوق متنامي وتنفيذ ممتاز", 1.30m, 0.90m),
            ("Realistic",    "واقعي",   "السيناريو الأكثر احتمالاً بناءً على بيانات السوق", 1.00m, 1.00m),
            ("Pessimistic",  "متحفظ",   "أسوأ الحالات — بيئة صعبة ومنافسة شديدة", 0.70m, 1.15m),
        };

        public FinancialProjectionService(ApplicationDbContext db)
        {
            _db = db;
        }

        // ── Benchmarks ────────────────────────────────────────────────────────

        public async Task<BenchmarkResponse?> GetBenchmarkAsync(
            string industryType, string businessModel, string region = "Amman")
        {
            var bm = await _db.IndustryBenchmarks
                .FirstOrDefaultAsync(b =>
                    b.IndustryType == industryType &&
                    b.BusinessModel == businessModel &&
                    b.Region == region);

            return bm == null ? null : MapBenchmark(bm);
        }

        public async Task<List<IndustryListItem>> GetAllBenchmarksAsync()
        {
            var all = await _db.IndustryBenchmarks.ToListAsync();

            return all
                .GroupBy(b => b.IndustryType)
                .Select(g => new IndustryListItem
                {
                    IndustryType   = g.Key,
                    IndustryNameAr = g.First().IndustryNameAr,
                    IndustryNameEn = g.First().IndustryNameEn,
                    AvailableModels = g.Select(b => b.BusinessModel).Distinct().ToList()
                })
                .ToList();
        }

        // ── CRUD ──────────────────────────────────────────────────────────────

        public async Task<FinancialProjectionResponse> CreateProjectionAsync(
            int ideaId, CreateProjectionRequest request)
        {
            // Find benchmark
            var benchmark = await _db.IndustryBenchmarks
                .FirstOrDefaultAsync(b =>
                    b.IndustryType  == request.IndustryType &&
                    b.BusinessModel == request.BusinessModel)
                ?? throw new InvalidOperationException(
                    $"No benchmark found for {request.IndustryType} / {request.BusinessModel}");

            // Delete existing projection if any (commit separately to avoid unique-constraint conflict)
            var existing = await _db.FinancialProjections
                .Include(p => p.Scenarios)
                .FirstOrDefaultAsync(p => p.BusinessIdeaId == ideaId);
            if (existing != null)
            {
                _db.FinancialProjections.Remove(existing);
                await _db.SaveChangesAsync();
            }

            // Compute effective values
            decimal effectiveInvestment  = request.InitialInvestment  ?? benchmark.StartupCostMid;
            decimal effectiveRevenue     = request.MonthlyRevenue      ?? benchmark.MonthlyCostTypical * 2.5m;
            decimal effectiveGrossMargin = request.ProfitMargin        ?? benchmark.GrossMarginTypical;
            decimal growthRate           = request.GrowthRate          ?? benchmark.MonthlyGrowthRatePercent;

            var projection = new FinancialProjection
            {
                BusinessIdeaId            = ideaId,
                BenchmarkId               = benchmark.Id,
                SelectedIndustryType      = request.IndustryType,
                SelectedBusinessModel     = request.BusinessModel,
                UserInitialInvestment     = request.InitialInvestment,
                UserMonthlyRevenueAssumption = request.MonthlyRevenue,
                UserProfitMarginAssumption   = request.ProfitMargin,
                UserMonthlyGrowthRate        = request.GrowthRate,
                EffectiveInitialInvestment   = effectiveInvestment,
                EffectiveMonthlyRevenue      = effectiveRevenue,
                EffectiveGrossMargin         = effectiveGrossMargin,
            };

            // Also persist selections on the BusinessIdea
            var idea = await _db.BusinessIdeas.FindAsync(ideaId);
            if (idea != null)
            {
                idea.SelectedIndustryType  = request.IndustryType;
                idea.SelectedBusinessModel = request.BusinessModel;
            }

            _db.FinancialProjections.Add(projection);
            try
            {
                await _db.SaveChangesAsync();  // need Id before creating scenarios
            }
            catch (DbUpdateException ex) when (ex.InnerException?.Message.Contains("23505") == true)
            {
                // Race condition: another request already inserted — detach and return existing
                foreach (var entry in _db.ChangeTracker.Entries<FinancialProjection>()
                    .Where(e => e.State == EntityState.Added).ToList())
                    entry.State = EntityState.Detached;

                return await GetProjectionResponseAsync(ideaId)
                    ?? throw new InvalidOperationException("Failed to load existing projection after conflict.");
            }

            // Create the three scenarios
            foreach (var (name, nameAr, desc, revMult, costMult) in Scenarios)
            {
                var monthlyData = CalculateMonthlyData(
                    effectiveRevenue, effectiveGrossMargin, effectiveInvestment,
                    benchmark.MonthlyCostTypical, growthRate, revMult, costMult);

                var scenario = BuildScenario(projection.Id, name, nameAr, desc,
                    revMult, costMult, monthlyData, effectiveInvestment);

                projection.Scenarios.Add(scenario);
            }

            await _db.SaveChangesAsync();

            return await GetProjectionResponseAsync(ideaId)
                ?? throw new InvalidOperationException("Failed to load created projection.");
        }

        public async Task<FinancialProjection?> GetProjectionAsync(int ideaId) =>
            await _db.FinancialProjections
                .Include(p => p.Benchmark)
                .Include(p => p.Scenarios)
                .FirstOrDefaultAsync(p => p.BusinessIdeaId == ideaId);

        public async Task<FinancialProjectionResponse?> GetProjectionResponseAsync(int ideaId)
        {
            var projection = await GetProjectionAsync(ideaId);
            return projection == null ? null : MapProjection(projection);
        }

        public async Task<FinancialProjectionResponse> UpdateProjectionAsync(
            int ideaId, UpdateProjectionRequest request)
        {
            var projection = await _db.FinancialProjections
                .Include(p => p.Benchmark)
                .Include(p => p.Scenarios)
                .FirstOrDefaultAsync(p => p.BusinessIdeaId == ideaId)
                ?? throw new KeyNotFoundException("Projection not found.");

            var benchmark = projection.Benchmark;

            // Apply overrides
            if (request.InitialInvestment.HasValue)
                projection.UserInitialInvestment = request.InitialInvestment;
            if (request.MonthlyRevenue.HasValue)
                projection.UserMonthlyRevenueAssumption = request.MonthlyRevenue;
            if (request.ProfitMargin.HasValue)
                projection.UserProfitMarginAssumption = request.ProfitMargin;
            if (request.GrowthRate.HasValue)
                projection.UserMonthlyGrowthRate = request.GrowthRate;
            if (request.Notes != null)
                projection.NotesFromUser = request.Notes;

            // Recompute effective values
            projection.EffectiveInitialInvestment = projection.UserInitialInvestment ?? benchmark.StartupCostMid;
            projection.EffectiveMonthlyRevenue    = projection.UserMonthlyRevenueAssumption ?? benchmark.MonthlyCostTypical * 2.5m;
            projection.EffectiveGrossMargin       = projection.UserProfitMarginAssumption ?? benchmark.GrossMarginTypical;
            decimal growthRate = projection.UserMonthlyGrowthRate ?? benchmark.MonthlyGrowthRatePercent;

            projection.UpdatedAt = DateTime.UtcNow;

            // Rebuild scenarios
            _db.ProjectionScenarios.RemoveRange(projection.Scenarios);
            projection.Scenarios.Clear();

            foreach (var (name, nameAr, desc, revMult, costMult) in Scenarios)
            {
                var monthlyData = CalculateMonthlyData(
                    projection.EffectiveMonthlyRevenue, projection.EffectiveGrossMargin,
                    projection.EffectiveInitialInvestment, benchmark.MonthlyCostTypical,
                    growthRate, revMult, costMult);

                var scenario = BuildScenario(projection.Id, name, nameAr, desc,
                    revMult, costMult, monthlyData, projection.EffectiveInitialInvestment);

                projection.Scenarios.Add(scenario);
            }

            await _db.SaveChangesAsync();
            return MapProjection(projection);
        }

        public async Task<bool> DeleteProjectionAsync(int ideaId)
        {
            var projection = await _db.FinancialProjections
                .FirstOrDefaultAsync(p => p.BusinessIdeaId == ideaId);

            if (projection == null) return false;

            _db.FinancialProjections.Remove(projection);
            await _db.SaveChangesAsync();
            return true;
        }

        // ── Calculation helpers ───────────────────────────────────────────────

        private static List<MonthlyProjectionData> CalculateMonthlyData(
            decimal baseRevenue, decimal grossMarginPct, decimal initialInvestment,
            decimal monthlyCostTypical, decimal growthRatePct,
            decimal revMultiplier, decimal costMultiplier)
        {
            var months = new List<MonthlyProjectionData>();
            decimal cumulative = -initialInvestment;
            decimal g = growthRatePct / 100m;

            for (int m = 1; m <= 12; m++)
            {
                double growthFactor = Math.Pow((double)(1 + g), m - 1);

                decimal revenue = Math.Round(
                    baseRevenue * revMultiplier * (decimal)growthFactor, 2);

                decimal fixedCosts = Math.Round(
                    monthlyCostTypical * costMultiplier
                    * (decimal)Math.Pow((double)(1 + g * 0.5m), m - 1), 2);

                decimal variableCosts = Math.Round(revenue * (1 - grossMarginPct / 100m), 2);
                decimal totalCosts    = variableCosts + fixedCosts;

                decimal grossProfit   = Math.Round(revenue * (grossMarginPct / 100m), 2);
                decimal netProfit     = Math.Round(grossProfit - fixedCosts, 2);

                cumulative = Math.Round(cumulative + netProfit, 2);

                decimal marginPct = revenue > 0
                    ? Math.Round(netProfit / revenue * 100, 1)
                    : 0;

                months.Add(new MonthlyProjectionData
                {
                    Month              = m,
                    Revenue            = revenue,
                    Costs              = totalCosts,
                    Profit             = netProfit,
                    CumulativeCashFlow = cumulative,
                    MarginPercent      = marginPct,
                });
            }

            return months;
        }

        private static ProjectionScenario BuildScenario(
            int projectionId, string name, string nameAr, string desc,
            decimal revMult, decimal costMult,
            List<MonthlyProjectionData> months, decimal initialInvestment)
        {
            int breakEven = months.FirstOrDefault(m => m.CumulativeCashFlow > 0)?.Month ?? 13;
            decimal totalProfit = months.Sum(m => m.Profit);
            decimal finalCashFlow = months.Last().CumulativeCashFlow;
            decimal roi = initialInvestment > 0 ? Math.Round(finalCashFlow / initialInvestment * 100, 1) : 0;
            decimal avgRevenue = Math.Round(months.Average(m => m.Revenue), 2);
            decimal avgProfit  = Math.Round(months.Average(m => m.Profit), 2);

            return new ProjectionScenario
            {
                FinancialProjectionId      = projectionId,
                ScenarioName               = name,
                ScenarioNameAr             = nameAr,
                ScenarioDescription        = desc,
                RevenueMultiplier          = revMult,
                CostMultiplier             = costMult,
                MonthlyDataJson            = JsonSerializer.Serialize(months),
                BreakEvenMonth             = breakEven,
                ROI12Months                = roi,
                TotalProfit12Months        = Math.Round(totalProfit, 2),
                CumulativeCashFlow12Months = Math.Round(finalCashFlow, 2),
                AvgMonthlyRevenue          = avgRevenue,
                AvgMonthlyProfit           = avgProfit,
            };
        }

        // ── Mapping ───────────────────────────────────────────────────────────

        private static BenchmarkResponse MapBenchmark(IndustryBenchmark b) => new()
        {
            Id                    = b.Id,
            IndustryNameAr        = b.IndustryNameAr,
            IndustryNameEn        = b.IndustryNameEn,
            BusinessModel         = b.BusinessModel,
            Confidence            = b.Confidence,
            ConfidenceLevel       = b.ConfidenceLevel,
            StartupCostLow        = b.StartupCostLow,
            StartupCostMid        = b.StartupCostMid,
            StartupCostHigh       = b.StartupCostHigh,
            MonthlyCostLow        = b.MonthlyCostLow,
            MonthlyCostTypical    = b.MonthlyCostTypical,
            MonthlyCostHigh       = b.MonthlyCostHigh,
            GrossMarginLow        = b.GrossMarginLow,
            GrossMarginTypical    = b.GrossMarginTypical,
            GrossMarginHigh       = b.GrossMarginHigh,
            BreakEvenMonthsLow    = b.BreakEvenMonthsLow,
            BreakEvenMonthsTypical = b.BreakEvenMonthsTypical,
            BreakEvenMonthsHigh   = b.BreakEvenMonthsHigh,
            MonthlyGrowthRatePercent = b.MonthlyGrowthRatePercent,
            AverageOrderValueTypical = b.AverageOrderValueTypical,
            AverageCACTypical     = b.AverageCACTypical,
            DataSourcesJson       = b.DataSourcesJson,
            NotesAndContext       = b.NotesAndContext,
        };

        private static ScenarioResponse? MapScenario(ProjectionScenario? s)
        {
            if (s == null) return null;

            List<MonthlyProjectionData>? rawMonths = null;
            try
            {
                rawMonths = JsonSerializer.Deserialize<List<MonthlyProjectionData>>(s.MonthlyDataJson);
            }
            catch { rawMonths = new List<MonthlyProjectionData>(); }

            return new ScenarioResponse
            {
                Name               = s.ScenarioName,
                NameAr             = s.ScenarioNameAr,
                Description        = s.ScenarioDescription,
                BreakEvenMonth     = s.BreakEvenMonth,
                ROI                = s.ROI12Months,
                TotalProfit        = s.TotalProfit12Months,
                CumulativeCashFlow = s.CumulativeCashFlow12Months,
                AvgMonthlyRevenue  = s.AvgMonthlyRevenue,
                AvgMonthlyProfit   = s.AvgMonthlyProfit,
                MonthlyData = (rawMonths ?? new()).Select(m => new MonthlyDataResponse
                {
                    Month              = m.Month,
                    Revenue            = m.Revenue,
                    Costs              = m.Costs,
                    Profit             = m.Profit,
                    CumulativeCashFlow = m.CumulativeCashFlow,
                    MarginPercent      = m.MarginPercent,
                }).ToList()
            };
        }

        private static FinancialProjectionResponse MapProjection(FinancialProjection p) => new()
        {
            Id                           = p.Id,
            IndustryType                 = p.SelectedIndustryType,
            BusinessModel                = p.SelectedBusinessModel,
            Benchmark                    = MapBenchmark(p.Benchmark),
            EffectiveInitialInvestment   = p.EffectiveInitialInvestment,
            EffectiveMonthlyRevenue      = p.EffectiveMonthlyRevenue,
            EffectiveGrossMargin         = p.EffectiveGrossMargin,
            UserInitialInvestment        = p.UserInitialInvestment,
            UserMonthlyRevenueAssumption = p.UserMonthlyRevenueAssumption,
            UserProfitMarginAssumption   = p.UserProfitMarginAssumption,
            UserMonthlyGrowthRate        = p.UserMonthlyGrowthRate,
            CreatedAt                    = p.CreatedAt,
            UpdatedAt                    = p.UpdatedAt,
            OptimisticScenario  = MapScenario(p.Scenarios.FirstOrDefault(s => s.ScenarioName == "Optimistic")),
            RealisticScenario   = MapScenario(p.Scenarios.FirstOrDefault(s => s.ScenarioName == "Realistic")),
            PessimisticScenario = MapScenario(p.Scenarios.FirstOrDefault(s => s.ScenarioName == "Pessimistic")),
        };
    }
}
