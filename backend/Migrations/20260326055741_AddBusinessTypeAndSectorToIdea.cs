using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddBusinessTypeAndSectorToIdea : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Location",
                table: "BusinessIdeas",
                newName: "BusinessTypeReason");

            migrationBuilder.AddColumn<string>(
                name: "RedFlags",
                table: "Evaluations",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Verdict",
                table: "Evaluations",
                type: "text",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Sector",
                table: "BusinessIdeas",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "other",
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AddColumn<string>(
                name: "AmmanRegion",
                table: "BusinessIdeas",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "central");

            migrationBuilder.AddColumn<string>(
                name: "BusinessType",
                table: "BusinessIdeas",
                type: "character varying(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "B2C");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RedFlags",
                table: "Evaluations");

            migrationBuilder.DropColumn(
                name: "Verdict",
                table: "Evaluations");

            migrationBuilder.DropColumn(
                name: "AmmanRegion",
                table: "BusinessIdeas");

            migrationBuilder.DropColumn(
                name: "BusinessType",
                table: "BusinessIdeas");

            migrationBuilder.RenameColumn(
                name: "BusinessTypeReason",
                table: "BusinessIdeas",
                newName: "Location");

            migrationBuilder.AlterColumn<string>(
                name: "Sector",
                table: "BusinessIdeas",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldDefaultValue: "other");
        }
    }
}
