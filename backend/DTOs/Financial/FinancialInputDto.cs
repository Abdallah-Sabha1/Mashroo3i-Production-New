using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Financial
{
    public class FinancialInputDto
    {
        [Required]
        public decimal InitialInvestment { get; set; }

        // List of products/services (1 to 5 items)
        // Each has a name, price, and cost
        [Required]
        public List<ProductItemDto> Products { get; set; } = new();

        // B2C: how many customers per day
        // Maps to monthly volume: customersPerDay × 30
        public decimal? CustomersPerDay { get; set; }

        // B2B: target clients in year 1 (keep existing)
        public string? TargetClientsYear1Range { get; set; }
        public decimal EstimatedDealClosingMonths { get; set; } = 3;

        // Acquisition channel (keep existing)
        public string AcquisitionChannel { get; set; } = "word_of_mouth";

        // Amman region (keep existing)
        public string AmmanRegion { get; set; } = "central";
    }

    public class ProductItemDto
    {
        public string Name { get; set; } = string.Empty;

        [Range(0.01, 99999)]
        public decimal Price { get; set; }

        [Range(0, 99999)]
        public decimal Cost { get; set; }
    }
}
