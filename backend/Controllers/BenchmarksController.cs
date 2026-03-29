using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.Services.Interfaces;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/benchmarks")]
    public class BenchmarksController : ControllerBase
    {
        private readonly IFinancialProjectionService _service;

        public BenchmarksController(IFinancialProjectionService service)
        {
            _service = service;
        }

        // GET api/benchmarks/industries
        [AllowAnonymous]
        [HttpGet("industries")]
        public async Task<IActionResult> GetIndustries()
        {
            var result = await _service.GetAllBenchmarksAsync();
            return Ok(result);
        }
    }
}
