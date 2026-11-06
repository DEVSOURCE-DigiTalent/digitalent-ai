using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigiTalent.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddFeedbackRating : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "rating",
                table: "user_feedbacks",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "rating",
                table: "user_feedbacks");
        }
    }
}
