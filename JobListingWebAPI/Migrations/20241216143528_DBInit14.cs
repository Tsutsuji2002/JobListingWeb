using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JobListingWebAPI.Migrations
{
    /// <inheritdoc />
    public partial class DBInit14 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "ReceiveDailyJobMatches",
                table: "AspNetUsers",
                type: "bit",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Subscribers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Email = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    PreferredIndustryId = table.Column<int>(type: "int", nullable: true),
                    PreferredLocationId = table.Column<int>(type: "int", nullable: true),
                    PreferredJobLevelId = table.Column<int>(type: "int", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UnsubscribedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Subscribers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Subscribers_Industries_PreferredIndustryId",
                        column: x => x.PreferredIndustryId,
                        principalTable: "Industries",
                        principalColumn: "IndustryID",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Subscribers_JobLevels_PreferredJobLevelId",
                        column: x => x.PreferredJobLevelId,
                        principalTable: "JobLevels",
                        principalColumn: "JobLevelID",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Subscribers_Locations_PreferredLocationId",
                        column: x => x.PreferredLocationId,
                        principalTable: "Locations",
                        principalColumn: "LocationID",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Subscribers_Email",
                table: "Subscribers",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Subscribers_PreferredIndustryId",
                table: "Subscribers",
                column: "PreferredIndustryId");

            migrationBuilder.CreateIndex(
                name: "IX_Subscribers_PreferredJobLevelId",
                table: "Subscribers",
                column: "PreferredJobLevelId");

            migrationBuilder.CreateIndex(
                name: "IX_Subscribers_PreferredLocationId",
                table: "Subscribers",
                column: "PreferredLocationId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Subscribers");

            migrationBuilder.DropColumn(
                name: "ReceiveDailyJobMatches",
                table: "AspNetUsers");
        }
    }
}
