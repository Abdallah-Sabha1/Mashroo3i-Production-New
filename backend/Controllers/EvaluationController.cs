using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
        public async Task<ActionResult<EvaluationResponseDto>> Generate(int ideaId)
        {
            var idea = await _context.BusinessIdeas
                .Include(i => i.Evaluation)
                .FirstOrDefaultAsync(i => i.IdeaId == ideaId);

            if (idea == null) return NotFound(new { message = "Idea not found." });
            if (idea.UserId != GetUserId()) return Forbid();

            if (idea.Evaluation != null)
                return Conflict(new { message = "Evaluation already exists for this idea." });

            var evaluation = await _aiService.EvaluateBusinessIdea(idea);

            _context.Evaluations.Add(evaluation);
            await _context.SaveChangesAsync();

            return Ok(MapToResponse(evaluation));
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

            return new EvaluationResponseDto
            {
                EvaluationId = eval.EvaluationId,
                IdeaId = eval.IdeaId,
                NoveltyScore = eval.NoveltyScore,
                MarketPotentialScore = eval.MarketPotentialScore,
                OverallScore = eval.OverallScore,
                RiskLevel = eval.RiskLevel,
                SwotAnalysis = swotObj,
                Recommendations = eval.Recommendations,
                GeneratedAt = eval.GeneratedAt
            };
        }
    }
}
