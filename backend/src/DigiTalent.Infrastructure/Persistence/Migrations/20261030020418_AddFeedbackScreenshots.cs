using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigiTalent.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddFeedbackScreenshots : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<List<string>>(
                name: "screenshots",
                table: "user_feedbacks",
                type: "jsonb",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "screenshots",
                table: "user_feedbacks");
        }
    }
}
