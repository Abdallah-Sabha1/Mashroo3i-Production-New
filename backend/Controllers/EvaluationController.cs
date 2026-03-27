using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.DTOs.Evaluation;
using backend.Services.Interfaces;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class EvaluationController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IGeminiAIService _aiService;

        public EvaluationController(ApplicationDbContext context, IGeminiAIService aiService)
        {
            _context = context;
            _aiService = aiService;
        }

        [HttpPost("{ideaId}")]
        [EnableRateLimiting("ai_endpoints")]
        public async Task<ActionResult<EvaluationResponseDto>> Generate(int ideaId)
        {
            var idea = await _context.BusinessIdeas
                .Include(i => i.Evaluation)
                .FirstOrDefaultAsync(i => i.IdeaId == ideaId);

            if (idea == null) return NotFound(new { message = "Idea not found." });
            if (idea.UserId != GetUserId()) return Forbid();

            // Check DB directly — nav property may be null even if a row exists
            var existing = idea.Evaluation
                ?? await _context.Evaluations.FirstOrDefaultAsync(e => e.IdeaId == ideaId);
            if (existing != null) return Ok(MapToResponse(existing));

            idea.Status = Models.BusinessIdea.StatusAnalyzing;
            await _context.SaveChangesAsync();

            try
            {
                var evaluation = await _aiService.EvaluateBusinessIdeaAsync(idea);
                _context.Evaluations.Add(evaluation);
                idea.Status = Models.BusinessIdea.StatusCompleted;
                await _context.SaveChangesAsync();
                return Ok(MapToResponse(evaluation));
            }
            catch (Exception)
            {
                // Detach any Added evaluation entity to prevent duplicate key on status save
                foreach (var entry in _context.ChangeTracker.Entries<Models.Evaluation>()
                    .Where(e => e.State == EntityState.Added).ToList())
                    entry.State = EntityState.Detached;

                idea.Status = Models.BusinessIdea.StatusSubmitted;
                await _context.SaveChangesAsync();
                throw;
            }
        }

        [HttpDelete("{ideaId}")]
        public async Task<ActionResult> Delete(int ideaId)
        {
            var idea = await _context.BusinessIdeas
                .Include(i => i.Evaluation)
                .FirstOrDefaultAsync(i => i.IdeaId == ideaId);

            if (idea == null) return NotFound(new { message = "Idea not found." });
            if (idea.UserId != GetUserId()) return Forbid();
            if (idea.Evaluation == null)
                return NotFound(new { message = "No evaluation to delete." });

            _context.Evaluations.Remove(idea.Evaluation);
            idea.Status = Models.BusinessIdea.StatusSubmitted;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Evaluation deleted. You can now re-evaluate." });
        }

        [HttpGet("{ideaId}")]
        public async Task<ActionResult<EvaluationResponseDto>> Get(int ideaId)
        {
            var idea = await _context.BusinessIdeas
                .Include(i => i.Evaluation)
                .FirstOrDefaultAsync(i => i.IdeaId == ideaId);

            if (idea == null) return NotFound(new { message = "Idea not found." });
            if (idea.UserId != GetUserId()) return Forbid();
            if (idea.Evaluation == null) return NotFound(new { message = "No evaluation found." });

            return Ok(MapToResponse(idea.Evaluation));
        }

        private int GetUserId() =>
            int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        private static EvaluationResponseDto MapToResponse(Models.Evaluation eval)
        {
            object swotObj;
            try { swotObj = JsonSerializer.Deserialize<object>(eval.SwotAnalysis) ?? new { }; }
            catch { swotObj = new { }; }

            List<string> redFlags = new();
            try
            {
                if (!string.IsNullOrEmpty(eval.RedFlags))
                    redFlags = JsonSerializer.Deserialize<List<string>>(eval.RedFlags) ?? new();
            }
            catch { }

            return new EvaluationResponseDto
            {
                EvaluationId         = eval.EvaluationId,
                IdeaId               = eval.IdeaId,
                NoveltyScore         = eval.NoveltyScore,
                MarketPotentialScore = eval.MarketPotentialScore,
                OverallScore         = eval.OverallScore,
                RiskLevel            = eval.RiskLevel,
                SwotAnalysis         = swotObj,
                Recommendations      = eval.Recommendations,
                Verdict              = eval.Verdict,
                RedFlags             = redFlags,
                GeneratedAt          = eval.GeneratedAt
            };
        }
    }
}
