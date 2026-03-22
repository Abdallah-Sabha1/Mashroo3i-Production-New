using backend.DTOs.Financial;

namespace backend.Services.Interfaces
{
    public interface IFinancialService
    {
        FinancialCalculationResult CalculateFinancialPlan(FinancialInputDto input);
    }

    public class FinancialCalculationResult
    {
        public decimal MonthlyCosts { get; set; }
        public decimal MonthlyProfit { get; set; }
        public int BreakEvenMonths { get; set; }
        public decimal RoiPercentage { get; set; }
        public string FinancialSummaryJson { get; set; } = string.Empty;
    }
}
