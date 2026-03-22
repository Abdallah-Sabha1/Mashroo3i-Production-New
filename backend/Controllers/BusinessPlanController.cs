using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Services.Interfaces;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BusinessPlanController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IPdfService _pdfService;

        public BusinessPlanController(ApplicationDbContext context, IPdfService pdfService)
        {
            _context = context;
            _pdfService = pdfService;
        }

        [HttpGet("{ideaId}/download")]
        public async Task<IActionResult> Download(int ideaId)
        {
            var idea = await _context.BusinessIdeas.FirstOrDefaultAsync(i => i.IdeaId == ideaId);
            if (idea == null) return NotFound(new { message = "Idea not found." });
            if (idea.UserId != GetUserId()) return Forbid();

            var pdfBytes = await _pdfService.GenerateBusinessPlan(ideaId);
            return File(pdfBytes, "application/pdf", $"{idea.Title}-BusinessPlan.pdf");
        }

        private int GetUserId() =>
            int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
    }
}
