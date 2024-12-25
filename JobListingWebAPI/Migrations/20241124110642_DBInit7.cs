using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JobListingWebAPI.Migrations
{
    /// <inheritdoc />
    public partial class DBInit7 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CVID",
                table: "Applications",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CoverLeter",
                table: "Applications",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "CVs",
                columns: table => new
                {
                    CVID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FileName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FileUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ContentType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UploadDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CVs", x => x.CVID);
                    table.ForeignKey(
                        name: "FK_CVs_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Applications_CVID",
                table: "Applications",
                column: "CVID");

            migrationBuilder.CreateIndex(
                name: "IX_CVs_UserId",
                table: "CVs",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Applications_CVs_CVID",
                table: "Applications",
                column: "CVID",
                principalTable: "CVs",
                principalColumn: "CVID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Applications_CVs_CVID",
                table: "Applications");

            migrationBuilder.DropTable(
                name: "CVs");

            migrationBuilder.DropIndex(
                name: "IX_Applications_CVID",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "CVID",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "CoverLeter",
                table: "Applications");
        }
    }
}
