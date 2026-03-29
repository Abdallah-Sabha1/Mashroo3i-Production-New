using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddFinancialProjectionsWithBenchmarks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SelectedBusinessModel",
                table: "BusinessIdeas",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SelectedIndustryType",
                table: "BusinessIdeas",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "IndustryBenchmarks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IndustryType = table.Column<string>(type: "text", nullable: false),
                    IndustryNameAr = table.Column<string>(type: "text", nullable: false),
                    IndustryNameEn = table.Column<string>(type: "text", nullable: false),
                    BusinessModel = table.Column<string>(type: "text", nullable: false),
                    BusinessModelAr = table.Column<string>(type: "text", nullable: false),
                    Region = table.Column<string>(type: "text", nullable: false),
                    Subregion = table.Column<string>(type: "text", nullable: true),
                    DataVersion = table.Column<string>(type: "text", nullable: true),
                    Confidence = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    ConfidenceLevel = table.Column<string>(type: "text", nullable: false),
                    DataAgeMonths = table.Column<int>(type: "integer", nullable: false),
                    StartupCostLow = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    StartupCostMid = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    StartupCostHigh = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    StartupCostCurrency = table.Column<string>(type: "text", nullable: false),
                    StartupCostNotes = table.Column<string>(type: "text", nullable: true),
                    MonthlyCostLow = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    MonthlyCostHigh = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    MonthlyCostTypical = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    MonthlyCostBreakdownJson = table.Column<string>(type: "text", nullable: true),
                    GrossMarginLow = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    GrossMarginHigh = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    GrossMarginTypical = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    NetMarginLow = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    NetMarginHigh = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    NetMarginTypical = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    AverageOrderValueLow = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    AverageOrderValueHigh = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    AverageOrderValueTypical = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    RevenueProjectionByMonthJson = table.Column<string>(type: "text", nullable: true),
                    MonthlyGrowthRatePercent = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    CustomerAcquisitionCostJson = table.Column<string>(type: "text", nullable: true),
                    AverageCACTypical = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    MonthlyChurnRateLow = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    MonthlyChurnRateHigh = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    MonthlyChurnRateTypical = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    CustomerRetentionRatePercent = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    BreakEvenMonthsLow = table.Column<int>(type: "integer", nullable: false),
                    BreakEvenMonthsHigh = table.Column<int>(type: "integer", nullable: false),
                    BreakEvenMonthsTypical = table.Column<int>(type: "integer", nullable: false),
                    RedFlagsJson = table.Column<string>(type: "text", nullable: true),
                    DataCollectionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastUpdated = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DataSourcesJson = table.Column<string>(type: "text", nullable: true),
                    NotesAndContext = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IndustryBenchmarks", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FinancialProjections",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    BusinessIdeaId = table.Column<int>(type: "integer", nullable: false),
                    BenchmarkId = table.Column<int>(type: "integer", nullable: false),
                    SelectedIndustryType = table.Column<string>(type: "text", nullable: false),
                    SelectedBusinessModel = table.Column<string>(type: "text", nullable: false),
                    UserInitialInvestment = table.Column<decimal>(type: "numeric(18,2)", nullable: true),
                    UserMonthlyRevenueAssumption = table.Column<decimal>(type: "numeric(18,2)", nullable: true),
                    UserProfitMarginAssumption = table.Column<decimal>(type: "numeric(5,2)", nullable: true),
                    UserMonthlyGrowthRate = table.Column<decimal>(type: "numeric(5,2)", nullable: true),
                    EffectiveInitialInvestment = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    EffectiveMonthlyRevenue = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    EffectiveGrossMargin = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    NotesFromUser = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FinancialProjections", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FinancialProjections_BusinessIdeas_BusinessIdeaId",
                        column: x => x.BusinessIdeaId,
                        principalTable: "BusinessIdeas",
                        principalColumn: "IdeaId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FinancialProjections_IndustryBenchmarks_BenchmarkId",
                        column: x => x.BenchmarkId,
                        principalTable: "IndustryBenchmarks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ProjectionScenarios",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FinancialProjectionId = table.Column<int>(type: "integer", nullable: false),
                    ScenarioName = table.Column<string>(type: "text", nullable: false),
                    ScenarioNameAr = table.Column<string>(type: "text", nullable: false),
                    ScenarioDescription = table.Column<string>(type: "text", nullable: true),
                    RevenueMultiplier = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    CostMultiplier = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    MonthlyDataJson = table.Column<string>(type: "text", nullable: false),
                    BreakEvenMonth = table.Column<int>(type: "integer", nullable: false),
                    ROI12Months = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    TotalProfit12Months = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    CumulativeCashFlow12Months = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    AvgMonthlyRevenue = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    AvgMonthlyProfit = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectionScenarios", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProjectionScenarios_FinancialProjections_FinancialProjectio~",
                        column: x => x.FinancialProjectionId,
                        principalTable: "FinancialProjections",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FinancialProjections_BenchmarkId",
                table: "FinancialProjections",
                column: "BenchmarkId");

            migrationBuilder.CreateIndex(
                name: "IX_FinancialProjections_BusinessIdeaId",
                table: "FinancialProjections",
                column: "BusinessIdeaId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_IndustryBenchmarks_IndustryType_BusinessModel",
                table: "IndustryBenchmarks",
                columns: new[] { "IndustryType", "BusinessModel" });

            migrationBuilder.CreateIndex(
                name: "IX_ProjectionScenarios_FinancialProjectionId",
                table: "ProjectionScenarios",
                column: "FinancialProjectionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProjectionScenarios");

            migrationBuilder.DropTable(
                name: "FinancialProjections");

            migrationBuilder.DropTable(
                name: "IndustryBenchmarks");

            migrationBuilder.DropColumn(
                name: "SelectedBusinessModel",
                table: "BusinessIdeas");

            migrationBuilder.DropColumn(
                name: "SelectedIndustryType",
                table: "BusinessIdeas");
        }
    }
}
