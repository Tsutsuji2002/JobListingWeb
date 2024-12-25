using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JobListingWebAPI.Migrations
{
    /// <inheritdoc />
    public partial class DBInit5 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_JobListings_LocationID",
                table: "JobListings",
                column: "LocationID");

            migrationBuilder.AddForeignKey(
                name: "FK_JobListings_Locations_LocationID",
                table: "JobListings",
                column: "LocationID",
                principalTable: "Locations",
                principalColumn: "LocationID",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_JobListings_Locations_LocationID",
                table: "JobListings");

            migrationBuilder.DropIndex(
                name: "IX_JobListings_LocationID",
                table: "JobListings");
        }
    }
}
