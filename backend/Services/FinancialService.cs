using System.Text.Json;
using backend.DTOs.Financial;
using backend.Services.Interfaces;

namespace backend.Services
{
    public class FinancialService : IFinancialService
    {
        public FinancialCalculationResult CalculateFinancialPlan(FinancialInputDto input)
        {
            var fixedCosts = input.Rent + input.Salaries + input.Utilities + input.Insurance + input.Marketing;
            var variableCosts = input.MonthlyRevenue * (input.CogsPercent / 100m);
            var totalMonthlyCosts = fixedCosts + variableCosts;
            var monthlyProfit = input.MonthlyRevenue - totalMonthlyCosts;

            int breakEvenMonths;
            if (monthlyProfit <= 0)
                breakEvenMonths = -1;
            else
                breakEvenMonths = (int)Math.Ceiling(input.InitialInvestment / monthlyProfit);

            var totalProfit24 = monthlyProfit * 24m;
            var roi = input.InitialInvestment > 0
                ? ((totalProfit24 - input.InitialInvestment) / input.InitialInvestment) * 100m
                : 0m;

            // Generate 24-month projections
            var projections = new List<object>();
            decimal cumulativeCash = -input.InitialInvestment;
            decimal currentRevenue = input.MonthlyRevenue;
            decimal currentCosts = totalMonthlyCosts;

            for (int month = 1; month <= 24; month++)
            {
                if (month > 1)
                {
                    currentRevenue *= 1.02m;
                    currentCosts *= 1.01m;
                }

                var profit = currentRevenue - currentCosts;
                cumulativeCash += profit;

                projections.Add(new
                {
                    month,
                    revenue = Math.Round(currentRevenue, 2),
                    costs = Math.Round(currentCosts, 2),
                    profit = Math.Round(profit, 2),
                    cumulativeCash = Math.Round(cumulativeCash, 2)
                });
            }

            // Year summaries
            var year1Revenue = input.MonthlyRevenue * 12m;
            var year1Costs = totalMonthlyCosts * 12m;
            var year1Profit = year1Revenue - year1Costs;
            var year2Revenue = year1Revenue * 1.15m;
            var year2Costs = year1Costs * 1.08m;
            var year2Profit = year2Revenue - year2Costs;

            var summary = new
            {
                monthlyProjections = projections,
                yearSummary = new
                {
                    year1Revenue = Math.Round(year1Revenue, 2),
                    year1Costs = Math.Round(year1Costs, 2),
                    year1Profit = Math.Round(year1Profit, 2),
                    year2Revenue = Math.Round(year2Revenue, 2),
                    year2Costs = Math.Round(year2Costs, 2),
                    year2Profit = Math.Round(year2Profit, 2)
                }
            };

            return new FinancialCalculationResult
            {
                MonthlyCosts = Math.Round(totalMonthlyCosts, 2),
                MonthlyProfit = Math.Round(monthlyProfit, 2),
                BreakEvenMonths = breakEvenMonths,
                RoiPercentage = Math.Round(roi, 2),
                FinancialSummaryJson = JsonSerializer.Serialize(summary)
            };
        }
    }
}
