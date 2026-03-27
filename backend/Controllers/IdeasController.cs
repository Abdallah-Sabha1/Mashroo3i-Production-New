using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.DTOs.Idea;
using backend.Models;
using backend.Services.Interfaces;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class IdeasController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IIdeaAnalysisService _analysisService;
        private readonly ILogger<IdeasController> _logger;

        public IdeasController(ApplicationDbContext context, IIdeaAnalysisService analysisService, ILogger<IdeasController> logger)
        {
            _context = context;
            _analysisService = analysisService;
            _logger = logger;
        }

        [HttpPost("analyze")]
        [AllowAnonymous]
        [EnableRateLimiting("ai_endpoints")]
        public async Task<ActionResult<IdeaInsightsDto>> AnalyzeIdea(AnalyzeIdeaDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { message = "Invalid input", errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)) });

            try
            {
                _logger.LogInformation("Analyzing idea: {Title}", dto.Title);
                var insights = await _analysisService.AnalyzeIdeaAsync(dto.Title, dto.Description, dto.Sector);
                return Ok(insights);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error analyzing idea");
                return StatusCode(500, new { message = "Failed to analyze idea. Please try again." });
            }
        }

        [HttpPost]
        public async Task<ActionResult<IdeaResponseDto>> Create(CreateIdeaDto dto)
        {
            var userId = GetUserId();

            var idea = new BusinessIdea
            {
                UserId           = userId,
                Title            = dto.Title,
                Description      = dto.Description,
                ProblemStatement = dto.ProblemStatement,
                TargetAudience   = dto.TargetAudience,
                Usp              = dto.Usp,
                BusinessType     = dto.BusinessType,
                Sector           = dto.Sector,
                AmmanRegion      = dto.AmmanRegion,
                BusinessTypeReason = dto.BusinessTypeReason,
                EstimatedBudget  = dto.EstimatedBudget,
                CreatedAt        = DateTime.UtcNow
            };

            _context.BusinessIdeas.Add(idea);
            await _context.SaveChangesAsync();

            return Ok(MapToResponse(idea));
        }

        [HttpGet("user/me")]
        public async Task<ActionResult<List<IdeaResponseDto>>> GetUserIdeas()
        {
            var userId = GetUserId();
            var ideas = await _context.BusinessIdeas
                .Where(i => i.UserId == userId)
                .Include(i => i.Evaluation)
                .Include(i => i.FinancialPlan)
                .OrderByDescending(i => i.CreatedAt)
                .ToListAsync();

            return Ok(ideas.Select(MapToResponse).ToList());
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<List<IdeaResponseDto>>> GetIdeasByUser(int userId)
        {
            var currentUserId = GetUserId();
            if (userId != currentUserId) return Forbid();

            var ideas = await _context.BusinessIdeas
                .Where(i => i.UserId == userId)
                .Include(i => i.Evaluation)
                .Include(i => i.FinancialPlan)
                .OrderByDescending(i => i.CreatedAt)
                .ToListAsync();

            return Ok(ideas.Select(MapToResponse).ToList());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<IdeaResponseDto>> GetById(int id)
        {
            var idea = await _context.BusinessIdeas
                .Include(i => i.Evaluation)
                .Include(i => i.FinancialPlan)
                .FirstOrDefaultAsync(i => i.IdeaId == id);

            if (idea == null) return NotFound(new { message = "Idea not found." });
            if (idea.UserId != GetUserId()) return Forbid();

            return Ok(MapToResponse(idea));
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<IdeaResponseDto>> Update(int id, UpdateIdeaDto dto)
        {
            var idea = await _context.BusinessIdeas.FindAsync(id);
            if (idea == null) return NotFound(new { message = "Idea not found." });
            if (idea.UserId != GetUserId()) return Forbid();

            if (dto.Title != null) idea.Title = dto.Title;
            if (dto.Description != null) idea.Description = dto.Description;
            if (dto.ProblemStatement != null) idea.ProblemStatement = dto.ProblemStatement;
            if (dto.TargetAudience != null) idea.TargetAudience = dto.TargetAudience;
            if (dto.Usp != null) idea.Usp = dto.Usp;
            if (dto.Sector != null) idea.Sector = dto.Sector;
            if (dto.EstimatedBudget.HasValue) idea.EstimatedBudget = dto.EstimatedBudget.Value;

            await _context.SaveChangesAsync();
            return Ok(MapToResponse(idea));
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var idea = await _context.BusinessIdeas.FindAsync(id);
            if (idea == null) return NotFound(new { message = "Idea not found." });
            if (idea.UserId != GetUserId()) return Forbid();

            _context.BusinessIdeas.Remove(idea);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Idea deleted." });
        }

        private int GetUserId() =>
            int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        private static IdeaResponseDto MapToResponse(BusinessIdea idea) => new()
        {
            IdeaId             = idea.IdeaId,
            UserId             = idea.UserId,
            Title              = idea.Title,
            Description        = idea.Description,
            ProblemStatement   = idea.ProblemStatement,
            TargetAudience     = idea.TargetAudience,
            Usp                = idea.Usp,
            BusinessType       = idea.BusinessType,
            Sector             = idea.Sector,
            AmmanRegion        = idea.AmmanRegion,
            BusinessTypeReason = idea.BusinessTypeReason,
            EstimatedBudget    = idea.EstimatedBudget,
            Status             = idea.Status,
            CreatedAt          = idea.CreatedAt,
            Evaluation = idea.Evaluation != null ? new EvaluationBriefDto
            {
                OverallScore = idea.Evaluation.OverallScore,
                RiskLevel    = idea.Evaluation.RiskLevel
            } : null,
            HasFinancialPlan = idea.FinancialPlan != null
        };
    }
}
