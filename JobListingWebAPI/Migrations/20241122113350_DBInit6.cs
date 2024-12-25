using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JobListingWebAPI.Migrations
{
    /// <inheritdoc />
    public partial class DBInit6 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "JobCategory",
                table: "JobListings");

            migrationBuilder.AddColumn<string>(
                name: "Benefits",
                table: "JobListings",
                type: "nvarchar(max)",
                maxLength: 5000,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsUrgent",
                table: "JobListings",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Benefits",
                table: "JobListings");

            migrationBuilder.DropColumn(
                name: "IsUrgent",
                table: "JobListings");

            migrationBuilder.AddColumn<string>(
                name: "JobCategory",
                table: "JobListings",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);
        }
    }
}
