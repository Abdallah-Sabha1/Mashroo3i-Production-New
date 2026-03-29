using System.Text.Json;
using backend.Models;

namespace backend.Data
{
    public static class BenchmarkSeeder
    {
        public static void SeedBenchmarks(ApplicationDbContext context)
        {
            if (context.IndustryBenchmarks.Any()) return;

            var benchmarks = new List<IndustryBenchmark>
            {
                // ── 1. Food & Beverage / B2C ──────────────────────────────────────────
                new IndustryBenchmark
                {
                    IndustryType     = "food_and_beverage",
                    IndustryNameAr   = "الأغذية والمشروبات",
                    IndustryNameEn   = "Food & Beverage",
                    BusinessModel    = "B2C",
                    BusinessModelAr  = "للمستهلكين الأفراد",
                    Region           = "Amman",
                    DataVersion      = "2025-Q1",
                    Confidence       = 0.75m,
                    ConfidenceLevel  = "HIGH",
                    DataAgeMonths    = 3,

                    StartupCostLow   = 8000,
                    StartupCostMid   = 15000,
                    StartupCostHigh  = 40000,
                    StartupCostCurrency = "JOD",
                    StartupCostNotes = "يشمل التجهيزات والأثاث والترخيص والمخزون الأول",

                    MonthlyCostLow     = 1000,
                    MonthlyCostTypical = 1800,
                    MonthlyCostHigh    = 3500,
                    MonthlyCostBreakdownJson = JsonSerializer.Serialize(new
                    {
                        rent = 600, salaries = 700, utilities = 200,
                        deliveryFees = 150, other = 150
                    }),

                    GrossMarginLow     = 25,
                    GrossMarginTypical = 35,
                    GrossMarginHigh    = 50,
                    NetMarginLow       = 5,
                    NetMarginTypical   = 12,
                    NetMarginHigh      = 18,

                    AverageOrderValueLow     = 5,
                    AverageOrderValueTypical = 10,
                    AverageOrderValueHigh    = 25,
                    MonthlyGrowthRatePercent = 12,

                    CustomerAcquisitionCostJson = JsonSerializer.Serialize(new
                    {
                        wordOfMouth = 5, instagramOrganic = 10,
                        instagramPaid = 25, deliveryPlatform = 30
                    }),
                    AverageCACTypical = 15,

                    MonthlyChurnRateLow     = 15,
                    MonthlyChurnRateTypical = 25,
                    MonthlyChurnRateHigh    = 35,
                    CustomerRetentionRatePercent = 75,

                    BreakEvenMonthsLow     = 5,
                    BreakEvenMonthsTypical = 9,
                    BreakEvenMonthsHigh    = 14,

                    DataSourcesJson = JsonSerializer.Serialize(new[]
                    {
                        "Jordan Chamber of Commerce 2024",
                        "Amman Restaurant Association Survey",
                        "Local operator interviews (n=42)"
                    }),
                    NotesAndContext = "مبني على بيانات من مطاعم ومقاهي ومحلات حلويات في عمّان",
                    DataCollectionDate = new DateTime(2025, 1, 15, 0, 0, 0, DateTimeKind.Utc),
                    LastUpdated = DateTime.UtcNow,
                },

                // ── 2. Retail E-commerce / B2C ────────────────────────────────────────
                new IndustryBenchmark
                {
                    IndustryType     = "retail_ecommerce",
                    IndustryNameAr   = "التجارة الإلكترونية والتجزئة",
                    IndustryNameEn   = "Retail & E-commerce",
                    BusinessModel    = "B2C",
                    BusinessModelAr  = "للمستهلكين الأفراد",
                    Region           = "Amman",
                    DataVersion      = "2025-Q1",
                    Confidence       = 0.75m,
                    ConfidenceLevel  = "HIGH",
                    DataAgeMonths    = 3,

                    StartupCostLow   = 1500,
                    StartupCostMid   = 6000,
                    StartupCostHigh  = 25000,
                    StartupCostCurrency = "JOD",
                    StartupCostNotes = "يشمل تطوير الموقع والمخزون الأول وتكاليف الشحن الأولى",

                    MonthlyCostLow     = 150,
                    MonthlyCostTypical = 800,
                    MonthlyCostHigh    = 2000,
                    MonthlyCostBreakdownJson = JsonSerializer.Serialize(new
                    {
                        logistics = 300, marketing = 250, platform = 100,
                        packaging = 100, other = 50
                    }),

                    GrossMarginLow     = 30,
                    GrossMarginTypical = 40,
                    GrossMarginHigh    = 60,
                    NetMarginLow       = 8,
                    NetMarginTypical   = 12,
                    NetMarginHigh      = 22,

                    AverageOrderValueLow     = 20,
                    AverageOrderValueTypical = 40,
                    AverageOrderValueHigh    = 80,
                    MonthlyGrowthRatePercent = 15,

                    CustomerAcquisitionCostJson = JsonSerializer.Serialize(new
                    {
                        instagram = 18, google = 35, influencer = 25, referral = 8
                    }),
                    AverageCACTypical = 20,

                    MonthlyChurnRateLow     = 15,
                    MonthlyChurnRateTypical = 30,
                    MonthlyChurnRateHigh    = 45,
                    CustomerRetentionRatePercent = 70,

                    BreakEvenMonthsLow     = 2,
                    BreakEvenMonthsTypical = 5,
                    BreakEvenMonthsHigh    = 9,

                    DataSourcesJson = JsonSerializer.Serialize(new[]
                    {
                        "E-commerce Jordan Report 2024",
                        "Souq.com / Amazon.jo seller data",
                        "Local retailer interviews (n=28)"
                    }),
                    NotesAndContext = "مبني على بيانات من متاجر إلكترونية في قطاعات الملابس والإلكترونيات والمنزل",
                    DataCollectionDate = new DateTime(2025, 1, 20, 0, 0, 0, DateTimeKind.Utc),
                    LastUpdated = DateTime.UtcNow,
                },

                // ── 3. Professional Services / B2B ────────────────────────────────────
                new IndustryBenchmark
                {
                    IndustryType     = "professional_services",
                    IndustryNameAr   = "الخدمات المهنية",
                    IndustryNameEn   = "Professional Services",
                    BusinessModel    = "B2B",
                    BusinessModelAr  = "للشركات والمؤسسات",
                    Region           = "Amman",
                    DataVersion      = "2025-Q1",
                    Confidence       = 0.70m,
                    ConfidenceLevel  = "MEDIUM",
                    DataAgeMonths    = 6,

                    StartupCostLow   = 2000,
                    StartupCostMid   = 5500,
                    StartupCostHigh  = 15000,
                    StartupCostCurrency = "JOD",
                    StartupCostNotes = "يشمل التسجيل القانوني والمعدات والتسويق الأول وتراخيص البرامج",

                    MonthlyCostLow     = 200,
                    MonthlyCostTypical = 1200,
                    MonthlyCostHigh    = 2500,
                    MonthlyCostBreakdownJson = JsonSerializer.Serialize(new
                    {
                        salaries = 800, office = 200, software = 100,
                        networking = 60, other = 40
                    }),

                    GrossMarginLow     = 50,
                    GrossMarginTypical = 62,
                    GrossMarginHigh    = 75,
                    NetMarginLow       = 35,
                    NetMarginTypical   = 48,
                    NetMarginHigh      = 60,

                    AverageOrderValueLow     = 700,
                    AverageOrderValueTypical = 1500,
                    AverageOrderValueHigh    = 3500,
                    MonthlyGrowthRatePercent = 18,

                    CustomerAcquisitionCostJson = JsonSerializer.Serialize(new
                    {
                        referral = 150, linkedin = 400, directSales = 800, events = 300
                    }),
                    AverageCACTypical = 500,

                    MonthlyChurnRateLow     = 5,
                    MonthlyChurnRateTypical = 12,
                    MonthlyChurnRateHigh    = 20,
                    CustomerRetentionRatePercent = 80,

                    BreakEvenMonthsLow     = 2,
                    BreakEvenMonthsTypical = 4,
                    BreakEvenMonthsHigh    = 6,

                    DataSourcesJson = JsonSerializer.Serialize(new[]
                    {
                        "Amman Chamber of Commerce B2B Survey 2024",
                        "Professional services firm interviews (n=19)"
                    }),
                    NotesAndContext = "يشمل الاستشارات والمحاسبة والتسويق الرقمي والخدمات القانونية",
                    DataCollectionDate = new DateTime(2025, 2, 1, 0, 0, 0, DateTimeKind.Utc),
                    LastUpdated = DateTime.UtcNow,
                },
            };

            context.IndustryBenchmarks.AddRange(benchmarks);
            context.SaveChanges();
        }
    }
}
