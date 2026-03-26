using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Financial
{
    public class FinancialInputDto
    {
        [Required]
        public decimal InitialInvestment { get; set; }

        /// <summary>Price you charge per unit / per month per client (JOD)</summary>
        [Required]
        public decimal PlannedPrice { get; set; }

        /// <summary>Your cost to deliver one unit / serve one client per month (JOD)</summary>
        [Required]
        public decimal CostToDeliver { get; set; }

        /// <summary>
        /// Sum of all monthly fixed costs entered via guided sub-questions:
        /// rent + (salaries × 1.1425 for employer SSC) + utilities + other.
        /// Populated by frontend from Step 5 sub-questions.
        /// If 0, falls back to sector benchmark.
        /// </summary>
        public decimal MonthlyFixedCosts { get; set; }

        /// <summary>Main customer acquisition channel: social, referral, seo, paid, events, cold_outreach</summary>
        public string AcquisitionChannel { get; set; } = "social";

        /// <summary>
        /// Amman sub-region selected in the financial wizard step.
        /// "west" | "central" | "east"
        /// Used to apply regional cost and AOV multipliers from benchmark data.
        /// </summary>
        public string AmmanRegion { get; set; } = "central";

        // ── B2C only ───────────────────────────────────────────────────────────
        /// <summary>Estimated monthly unit sales range, e.g. "50-100" or "200"</summary>
        public string? EstimatedMonthlySalesRange { get; set; }

        // ── B2B only ───────────────────────────────────────────────────────────
        /// <summary>Target number of clients by end of year 1, e.g. "5-10" or "20"</summary>
        public string? TargetClientsYear1Range { get; set; }

        /// <summary>Average months from first contact to signed contract (B2B)</summary>
        public decimal EstimatedDealClosingMonths { get; set; } = 3;
    }
}
