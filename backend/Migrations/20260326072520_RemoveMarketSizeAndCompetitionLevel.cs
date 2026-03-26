using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class RemoveMarketSizeAndCompetitionLevel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CompetitionLevel",
                table: "BusinessIdeas");

            migrationBuilder.DropColumn(
                name: "MarketSize",
                table: "BusinessIdeas");

            migrationBuilder.AddColumn<decimal>(
                name: "ARR",
                table: "FinancialPlans",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "BreakEvenUnits",
                table: "FinancialPlans",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "CAC",
                table: "FinancialPlans",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "GrossMarginPct",
                table: "FinancialPlans",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "LTV",
                table: "FinancialPlans",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "LtvCacRatio",
                table: "FinancialPlans",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "MonthlyProfit",
                table: "FinancialPlans",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ARR",
                table: "FinancialPlans");

            migrationBuilder.DropColumn(
                name: "BreakEvenUnits",
                table: "FinancialPlans");

            migrationBuilder.DropColumn(
                name: "CAC",
                table: "FinancialPlans");

            migrationBuilder.DropColumn(
                name: "GrossMarginPct",
                table: "FinancialPlans");

            migrationBuilder.DropColumn(
                name: "LTV",
                table: "FinancialPlans");

            migrationBuilder.DropColumn(
                name: "LtvCacRatio",
                table: "FinancialPlans");

            migrationBuilder.DropColumn(
                name: "MonthlyProfit",
                table: "FinancialPlans");

            migrationBuilder.AddColumn<string>(
                name: "CompetitionLevel",
                table: "BusinessIdeas",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MarketSize",
                table: "BusinessIdeas",
                type: "text",
                nullable: true);
        }
    }
}
