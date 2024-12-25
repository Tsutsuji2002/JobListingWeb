using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JobListingWebAPI.Migrations
{
    /// <inheritdoc />
    public partial class DBInit3 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Address",
                table: "MappingLocations",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "NumberofRecruitment",
                table: "JobListings",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Address",
                table: "MappingLocations");

            migrationBuilder.DropColumn(
                name: "NumberofRecruitment",
                table: "JobListings");
        }
    }
}
