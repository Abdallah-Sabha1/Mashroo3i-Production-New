using System.Text.Json;
using backend.Services.Interfaces;
using backend.Services.Models;

namespace backend.Services
{
    public class BenchmarkService : IBenchmarkService
    {
        private readonly JsonDocument _benchmarks;
        private readonly ILogger<BenchmarkService> _logger;

        public BenchmarkService(IWebHostEnvironment env, ILogger<BenchmarkService> logger)
        {
            _logger = logger;
            var path = Path.Combine(env.ContentRootPath, "Data", "amman_benchmarks.json");
            var json = File.ReadAllText(path);
            _benchmarks = JsonDocument.Parse(json);
        }

        public SectorBenchmark? GetBenchmark(string sector, string businessType)
        {
            try
            {
                var typeKey = businessType.ToLower() == "b2b" ? "b2b" : "b2c";
                var root = _benchmarks.RootElement;

                if (!root.TryGetProperty("sectors", out var sectors)) return null;
                if (!sectors.TryGetProperty(sector.ToLower(), out var sectorEl)) return null;
                if (!sectorEl.TryGetProperty(typeKey, out var typeEl)) return null;

                return new SectorBenchmark
                {
                    StartupCost      = ParseRange(typeEl, "startupCost"),
                    MonthlyFixedCosts = ParseRange(typeEl, "monthlyFixedCosts"),
                    GrossMargin      = ParseRange(typeEl, "grossMargin"),
                    Cac              = ParseRange(typeEl, "cac"),
                    MonthlyChurnRate = ParseRange(typeEl, "monthlyChurnRate"),
                    BreakEvenMonths  = ParseRange(typeEl, "breakEvenMonths"),
                    WinRate          = ParseRange(typeEl, "winRate"),
                    ClientRetentionRate = ParseRange(typeEl, "clientRetentionRate")
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reading benchmark for sector={Sector}, type={Type}", sector, businessType);
                return null;
            }
        }

        public double GetRegionCostMultiplier(string region)
        {
            return GetRegionMultiplier(region, "startupCost");
        }

        public double GetRegionAovMultiplier(string region)
        {
            return GetRegionMultiplier(region, "aov");
        }

        public double GetChannelCacMultiplier(string channel)
        {
            try
            {
                var root = _benchmarks.RootElement;
                if (!root.TryGetProperty("acquisitionChannels", out var channels)) return 1.0;
                if (!channels.TryGetProperty(channel.ToLower(), out var channelEl)) return 1.0;
                if (!channelEl.TryGetProperty("cacMultiplier", out var multiplier)) return 1.0;
                return multiplier.GetDouble();
            }
            catch { return 1.0; }
        }

        public RedFlagRules GetRedFlagRules()
        {
            try
            {
                var root = _benchmarks.RootElement;
                if (!root.TryGetProperty("redFlagRules", out var rules)) return new RedFlagRules();

                return new RedFlagRules
                {
                    LtvCacRatio    = ParseThreshold(rules, "ltvCacRatio"),
                    GrossMarginPct = ParseThreshold(rules, "grossMarginPct"),
                    BreakEvenMonths = ParseThreshold(rules, "breakEvenMonths"),
                    MonthlyChurnPct = ParseThreshold(rules, "monthlyChurnPct")
                };
            }
            catch { return new RedFlagRules(); }
        }

        public ScenarioMultipliers GetScenarioMultipliers()
        {
            try
            {
                var root = _benchmarks.RootElement;
                if (!root.TryGetProperty("scenarioMultipliers", out var scenarios)) return new ScenarioMultipliers();

                return new ScenarioMultipliers
                {
                    Conservative = ParseScenario(scenarios, "conservative"),
                    Realistic    = ParseScenario(scenarios, "realistic"),
                    Optimistic   = ParseScenario(scenarios, "optimistic")
                };
            }
            catch { return new ScenarioMultipliers(); }
        }

        private double GetRegionMultiplier(string region, string key)
        {
            try
            {
                var root = _benchmarks.RootElement;
                if (!root.TryGetProperty("regionMultipliers", out var regions)) return 1.0;
                if (!regions.TryGetProperty(region.ToLower(), out var regionEl)) return 1.0;
                if (!regionEl.TryGetProperty(key, out var multiplier)) return 1.0;
                return multiplier.GetDouble();
            }
            catch { return 1.0; }
        }

        private static MetricRange? ParseRange(JsonElement parent, string key)
        {
            if (!parent.TryGetProperty(key, out var el)) return null;
            if (el.ValueKind == JsonValueKind.Null) return null;
            return new MetricRange
            {
                Low     = el.TryGetProperty("low",     out var l) ? l.GetDecimal() : 0,
                High    = el.TryGetProperty("high",    out var h) ? h.GetDecimal() : 0,
                Typical = el.TryGetProperty("typical", out var t) ? t.GetDecimal() : 0
            };
        }

        private static RedFlagThreshold ParseThreshold(JsonElement parent, string key)
        {
            if (!parent.TryGetProperty(key, out var el)) return new RedFlagThreshold();
            return new RedFlagThreshold
            {
                Danger  = el.TryGetProperty("danger",  out var d) ? d.GetDouble() : 0,
                Warning = el.TryGetProperty("warning", out var w) ? w.GetDouble() : 0
            };
        }

        private static ScenarioEntry ParseScenario(JsonElement parent, string key)
        {
            if (!parent.TryGetProperty(key, out var el)) return new ScenarioEntry();
            return new ScenarioEntry
            {
                RevenueMultiplier = el.TryGetProperty("revenueMultiplier", out var r) ? r.GetDouble() : 1.0,
                CostMultiplier    = el.TryGetProperty("costMultiplier",    out var c) ? c.GetDouble() : 1.0
            };
        }
    }
}
