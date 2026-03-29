using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using backend.DTOs;
using backend.Services.Interfaces;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/financial-projections")]
    public class FinancialProjectionsController : ControllerBase
    {
        private readonly IFinancialProjectionService _service;

        public FinancialProjectionsController(IFinancialProjectionService service)
        {
            _service = service;
        }

        // GET api/financial-projections/benchmarks?industryType=food_and_beverage&businessModel=B2C
        [AllowAnonymous]
        [HttpGet("benchmarks")]
        public async Task<IActionResult> GetBenchmark(
            [FromQuery] string industryType,
            [FromQuery] string businessModel,
            [FromQuery] string region = "Amman")
        {
            if (string.IsNullOrWhiteSpace(industryType) || string.IsNullOrWhiteSpace(businessModel))
                return BadRequest(new { message = "industryType and businessModel are required." });

            var result = await _service.GetBenchmarkAsync(industryType, businessModel, region);
            if (result == null)
                return NotFound(new { message = $"No benchmark found for {industryType} / {businessModel}." });

            return Ok(result);
        }

        // GET api/financial-projections/benchmarks/all
        [AllowAnonymous]
        [HttpGet("benchmarks/all")]
        public async Task<IActionResult> GetAllBenchmarks()
        {
            var result = await _service.GetAllBenchmarksAsync();
            return Ok(result);
        }

        // POST api/financial-projections/{ideaId}/create
        [Authorize]
        [HttpPost("{ideaId:int}/create")]
        public async Task<IActionResult> CreateProjection(int ideaId, [FromBody] CreateProjectionRequest request)
        {
            try
            {
                var result = await _service.CreateProjectionAsync(ideaId, request);
                return CreatedAtAction(nameof(GetProjection), new { ideaId }, result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET api/financial-projections/{ideaId}
        [Authorize]
        [HttpGet("{ideaId:int}")]
        public async Task<IActionResult> GetProjection(int ideaId)
        {
            var result = await _service.GetProjectionResponseAsync(ideaId);
            if (result == null)
                return NotFound(new { message = "No projection found for this idea." });

            return Ok(result);
        }

        // PUT api/financial-projections/{ideaId}/update
        [Authorize]
        [HttpPut("{ideaId:int}/update")]
        public async Task<IActionResult> UpdateProjection(int ideaId, [FromBody] UpdateProjectionRequest request)
        {
            try
            {
                var result = await _service.UpdateProjectionAsync(ideaId, request);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // DELETE api/financial-projections/{ideaId}
        [Authorize]
        [HttpDelete("{ideaId:int}")]
        public async Task<IActionResult> DeleteProjection(int ideaId)
        {
            var deleted = await _service.DeleteProjectionAsync(ideaId);
            if (!deleted)
                return NotFound(new { message = "Projection not found." });

            return NoContent();
        }
    }
}
