using backend.Services.Models;

namespace backend.Services.Interfaces
{
    public interface IBenchmarkService
    {
        SectorBenchmark? GetBenchmark(string sector, string businessType);
        double GetRegionCostMultiplier(string region);
        double GetRegionAovMultiplier(string region);
        double GetChannelCacMultiplier(string channel);
        RedFlagRules GetRedFlagRules();
        ScenarioMultipliers GetScenarioMultipliers();
    }
}
