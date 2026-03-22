using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Financial
{
    public class FinancialInputDto
    {
        [Required]
        public decimal InitialInvestment { get; set; }

        [Required]
        public decimal MonthlyRevenue { get; set; }

        public decimal Rent { get; set; }
        public decimal Salaries { get; set; }
        public decimal Utilities { get; set; }
        public decimal Insurance { get; set; }
        public decimal Marketing { get; set; }
        public decimal CogsPercent { get; set; }
    }
}
