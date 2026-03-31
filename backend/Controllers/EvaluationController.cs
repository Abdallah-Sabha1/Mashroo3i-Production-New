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
        public async Task<ActionResult<EvaluationResponseDto>> Generate(int ideaId, [FromQuery] string language = "en")
        {
            var idea = await _context.BusinessIdeas
                .Include(i => i.Evaluation)
                .FirstOrDefaultAsync(i => i.IdeaId == ideaId);

            if (idea == null) return NotFound(new { message = "Idea not found." });
            if (idea.UserId != GetUserId()) return Forbid();

            // Check DB directly — nav property may be null even if a row exists
            var existing = idea.Evaluation
                ?? await _context.Evaluations.FirstOrDefaultAsync(e => e.IdeaId == ideaId);

            // ✅ FIX: If evaluation exists but user is requesting a different language,
            // delete the old one and regenerate in the requested language
            if (existing != null && language != "en")
            {
                _context.Evaluations.Remove(existing);
                await _context.SaveChangesAsync();
                existing = null;
            }

            if (existing != null) return Ok(MapToResponse(existing));

            idea.Status = Models.BusinessIdea.StatusAnalyzing;
            await _context.SaveChangesAsync();

            try
            {
                var evaluation = await _aiService.EvaluateBusinessIdeaAsync(idea, language);
                _context.Evaluations.Add(evaluation);
                idea.Status = Models.BusinessIdea.StatusCompleted;
                await _context.SaveChangesAsync();
                return Ok(MapToResponse(evaluation));
            }
            catch (Exception ex)
            {
                // Detach any Added evaluation entity to prevent a second duplicate on the status save
                foreach (var entry in _context.ChangeTracker.Entries<Models.Evaluation>()
                    .Where(e => e.State == EntityState.Added).ToList())
                    entry.State = EntityState.Detached;

                // 23505 = PostgreSQL unique-constraint violation.
                // Two concurrent requests both passed the pre-check and raced to insert.
                // The row was already saved by the other request — just return it.
                bool isDuplicate = ex is DbUpdateException &&
                    ex.InnerException?.Message.Contains("23505") == true;

                if (isDuplicate)
                {
                    var existing2 = await _context.Evaluations
                        .FirstOrDefaultAsync(e => e.IdeaId == ideaId);
                    if (existing2 != null)
                    {
                        idea.Status = Models.BusinessIdea.StatusCompleted;
                        await _context.SaveChangesAsync();
                        return Ok(MapToResponse(existing2));
                    }
                }

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
