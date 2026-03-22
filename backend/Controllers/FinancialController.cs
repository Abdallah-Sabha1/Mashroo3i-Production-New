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

            var result = _financialService.CalculateFinancialPlan(dto);

            if (idea.FinancialPlan != null)
            {
                idea.FinancialPlan.InitialInvestment = dto.InitialInvestment;
                idea.FinancialPlan.MonthlyRevenue = dto.MonthlyRevenue;
                idea.FinancialPlan.MonthlyCosts = result.MonthlyCosts;
                idea.FinancialPlan.BreakEvenMonths = result.BreakEvenMonths;
                idea.FinancialPlan.RoiPercentage = result.RoiPercentage;
                idea.FinancialPlan.FinancialSummary = result.FinancialSummaryJson;
                idea.FinancialPlan.CreatedAt = DateTime.UtcNow;
            }
            else
            {
                var plan = new FinancialPlan
                {
                    IdeaId = ideaId,
                    InitialInvestment = dto.InitialInvestment,
                    MonthlyRevenue = dto.MonthlyRevenue,
                    MonthlyCosts = result.MonthlyCosts,
                    BreakEvenMonths = result.BreakEvenMonths,
                    RoiPercentage = result.RoiPercentage,
                    FinancialSummary = result.FinancialSummaryJson,
                    CreatedAt = DateTime.UtcNow
                };
                _context.FinancialPlans.Add(plan);
            }

            await _context.SaveChangesAsync();

            var saved = await _context.FinancialPlans.FirstAsync(f => f.IdeaId == ideaId);
            return Ok(MapToResponse(saved));
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

            return Ok(MapToResponse(idea.FinancialPlan));
        }

        private int GetUserId() =>
            int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        private static FinancialResultDto MapToResponse(FinancialPlan plan)
        {
            object? summaryObj = null;
            if (!string.IsNullOrEmpty(plan.FinancialSummary))
            {
                try { summaryObj = JsonSerializer.Deserialize<object>(plan.FinancialSummary); }
                catch { }
            }

            return new FinancialResultDto
            {
                PlanId = plan.PlanId,
                IdeaId = plan.IdeaId,
                InitialInvestment = plan.InitialInvestment,
                MonthlyRevenue = plan.MonthlyRevenue,
                MonthlyCosts = plan.MonthlyCosts,
                BreakEvenMonths = plan.BreakEvenMonths,
                RoiPercentage = plan.RoiPercentage,
                FinancialSummary = summaryObj,
                CreatedAt = plan.CreatedAt
            };
        }
    }
}
