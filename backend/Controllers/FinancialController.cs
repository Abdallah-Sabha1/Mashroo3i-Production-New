using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.DTOs.Financial;
using backend.Models;
using backend.Services.Interfaces;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FinancialController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IFinancialService _financialService;

        public FinancialController(ApplicationDbContext context, IFinancialService financialService)
        {
            _context = context;
            _financialService = financialService;
        }

        [HttpPost("{ideaId}")]
        public async Task<ActionResult<FinancialResultDto>> Create(int ideaId, FinancialInputDto dto)
        {
            var idea = await _context.BusinessIdeas
                .Include(i => i.FinancialPlan)
                .FirstOrDefaultAsync(i => i.IdeaId == ideaId);

            if (idea == null) return NotFound(new { message = "Idea not found." });
            if (idea.UserId != GetUserId()) return Forbid();

            // Save AmmanRegion from financial form to the idea record
            if (!string.IsNullOrWhiteSpace(dto.AmmanRegion))
                idea.AmmanRegion = dto.AmmanRegion;

            var result = _financialService.CalculateFinancialPlan(dto, idea);

            if (idea.FinancialPlan != null)
            {
                idea.FinancialPlan.InitialInvestment = dto.InitialInvestment;
                idea.FinancialPlan.MonthlyRevenue    = result.MonthlyRevenue;
                idea.FinancialPlan.MonthlyCosts      = result.MonthlyCosts;
                idea.FinancialPlan.MonthlyProfit     = result.MonthlyProfit;
                idea.FinancialPlan.BreakEvenMonths   = result.BreakEvenMonths;
                idea.FinancialPlan.RoiPercentage     = result.RoiPercentage;
                idea.FinancialPlan.GrossMarginPct    = result.GrossMarginPct;
                idea.FinancialPlan.LTV               = result.LTV;
                idea.FinancialPlan.CAC               = result.CAC;
                idea.FinancialPlan.LtvCacRatio       = result.LtvCacRatio;
                idea.FinancialPlan.BreakEvenUnits    = result.BreakEvenUnits;
                idea.FinancialPlan.ARR               = result.ARR;
                idea.FinancialPlan.FinancialSummary  = result.FinancialSummaryJson;
                idea.FinancialPlan.CreatedAt         = DateTime.UtcNow;
            }
            else
            {
                var plan = new FinancialPlan
                {
                    IdeaId            = ideaId,
                    InitialInvestment = dto.InitialInvestment,
                    MonthlyRevenue    = result.MonthlyRevenue,
                    MonthlyCosts      = result.MonthlyCosts,
                    MonthlyProfit     = result.MonthlyProfit,
                    BreakEvenMonths   = result.BreakEvenMonths,
                    RoiPercentage     = result.RoiPercentage,
                    GrossMarginPct    = result.GrossMarginPct,
                    LTV               = result.LTV,
                    CAC               = result.CAC,
                    LtvCacRatio       = result.LtvCacRatio,
                    BreakEvenUnits    = result.BreakEvenUnits,
                    ARR               = result.ARR,
                    FinancialSummary  = result.FinancialSummaryJson,
                    CreatedAt         = DateTime.UtcNow
                };
                _context.FinancialPlans.Add(plan);
            }

            await _context.SaveChangesAsync();

            var saved = await _context.FinancialPlans.FirstAsync(f => f.IdeaId == ideaId);
            return Ok(MapToResponse(saved, idea));
        }

        [HttpGet("{ideaId}")]
        public async Task<ActionResult<FinancialResultDto>> Get(int ideaId)
        {
            var idea = await _context.BusinessIdeas
                .Include(i => i.FinancialPlan)
                .FirstOrDefaultAsync(i => i.IdeaId == ideaId);

            if (idea == null) return NotFound(new { message = "Idea not found." });
            if (idea.UserId != GetUserId()) return Forbid();
            if (idea.FinancialPlan == null) return NotFound(new { message = "No financial plan found." });

            return Ok(MapToResponse(idea.FinancialPlan, idea));
        }

        private int GetUserId() =>
            int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        private static FinancialResultDto MapToResponse(FinancialPlan plan, BusinessIdea idea)
        {
            var dto = new FinancialResultDto
            {
                PlanId            = plan.PlanId,
                IdeaId            = plan.IdeaId,
                BusinessType      = idea.BusinessType,
                InitialInvestment = plan.InitialInvestment,
                MonthlyRevenue    = plan.MonthlyRevenue,
                MonthlyCosts      = plan.MonthlyCosts,
                MonthlyProfit     = plan.MonthlyProfit,
                BreakEvenMonths   = plan.BreakEvenMonths,
                RoiPercentage     = plan.RoiPercentage,
                GrossMarginPct    = plan.GrossMarginPct,
                LTV               = plan.LTV,
                CAC               = plan.CAC,
                LtvCacRatio       = plan.LtvCacRatio,
                BreakEvenUnits    = plan.BreakEvenUnits,
                ARR               = plan.ARR,
                CreatedAt         = plan.CreatedAt
            };

            if (string.IsNullOrEmpty(plan.FinancialSummary)) return dto;

            try
            {
                var json = JsonDocument.Parse(plan.FinancialSummary).RootElement;

                dto.PlannedPrice    = GetDecimal(json, "plannedPrice");
                dto.GrossMarginPct  = GetDecimal(json, "grossMarginPct");
                dto.MonthlyProfit   = GetDecimal(json, "monthlyProfit");
                dto.LTV             = GetDecimal(json, "ltv");
                dto.CAC             = GetDecimal(json, "cac");
                dto.LtvCacRatio     = GetDecimal(json, "ltvCacRatio");
                dto.BreakEvenUnits  = GetDecimal(json, "breakEvenUnits");
                dto.ARR             = GetDecimal(json, "arr");

                dto.Conservative    = ParseScenario(json, "conservative");
                dto.Realistic       = ParseScenario(json, "realistic");
                dto.Optimistic      = ParseScenario(json, "optimistic");

                if (json.TryGetProperty("redFlags", out var rf) && rf.ValueKind == JsonValueKind.Array)
                    dto.RedFlags = rf.EnumerateArray().Select(e => e.GetString() ?? "").Where(s => s.Length > 0).ToList();

                if (json.TryGetProperty("benchmarkComparisons", out var bc) && bc.ValueKind == JsonValueKind.Array)
                    dto.BenchmarkComparisons = bc.EnumerateArray().Select(e => new BenchmarkComparisonDto
                    {
                        Metric           = GetString(e, "metric"),
                        YourValue        = GetString(e, "yourValue"),
                        BenchmarkTypical = GetString(e, "benchmarkTypical"),
                        Status           = GetString(e, "status", "ok")
                    }).ToList();

                if (json.TryGetProperty("assumptionsLog", out var al) && al.ValueKind == JsonValueKind.Array)
                    dto.AssumptionsLog = al.EnumerateArray().Select(e => e.GetString() ?? "").Where(s => s.Length > 0).ToList();

                if (json.TryGetProperty("monthlyProjections", out var mp) && mp.ValueKind == JsonValueKind.Array)
                    dto.MonthlyProjections = mp.EnumerateArray().Select(e => new MonthlyProjectionDto
                    {
                        Month          = GetInt(e, "month"),
                        Revenue        = GetDecimal(e, "revenue"),
                        Costs          = GetDecimal(e, "costs"),
                        Profit         = GetDecimal(e, "profit"),
                        CumulativeCash = GetDecimal(e, "cumulativeCash")
                    }).ToList();
            }
            catch (Exception ex)
            {
                // Log but don't throw — return partial DTO so the frontend
                // still receives the core financial numbers even if rich data fails
                Console.Error.WriteLine(
                    $"[FinancialController] Failed to parse FinancialSummary JSON " +
                    $"for PlanId={plan.PlanId}: {ex.Message}");
            }

            return dto;
        }

        private static ScenarioResultDto? ParseScenario(JsonElement json, string key)
        {
            if (!json.TryGetProperty(key, out var s)) return null;
            return new ScenarioResultDto
            {
                MonthlyRevenue  = GetDecimal(s, "monthlyRevenue"),
                MonthlyCosts    = GetDecimal(s, "monthlyCosts"),
                MonthlyProfit   = GetDecimal(s, "monthlyProfit"),
                BreakEvenMonths = GetInt(s, "breakEvenMonths"),
                Roi24Months     = GetDecimal(s, "roi24Months")
            };
        }

        private static decimal GetDecimal(JsonElement el, string key)
        {
            if (el.TryGetProperty(key, out var prop) && prop.TryGetDecimal(out var val)) return val;
            return 0m;
        }

        private static int GetInt(JsonElement el, string key)
        {
            if (el.TryGetProperty(key, out var prop) && prop.TryGetInt32(out var val)) return val;
            return 0;
        }

        private static string GetString(JsonElement el, string key, string defaultVal = "")
        {
            if (el.TryGetProperty(key, out var prop)) return prop.GetString() ?? defaultVal;
            return defaultVal;
        }
    }
}
