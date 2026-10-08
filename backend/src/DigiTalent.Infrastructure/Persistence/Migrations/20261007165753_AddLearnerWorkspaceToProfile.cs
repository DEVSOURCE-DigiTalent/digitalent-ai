using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigiTalent.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddLearnerWorkspaceToProfile : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "target_position_code",
                table: "learner_profiles",
                type: "character varying(80)",
                maxLength: 80,
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "target_set_at",
                table: "learner_profiles",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "target_change_count",
                table: "learner_profiles",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "workspace_state_json",
                table: "learner_profiles",
                type: "jsonb",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "target_position_code",
                table: "learner_profiles");

            migrationBuilder.DropColumn(
                name: "target_set_at",
                table: "learner_profiles");

            migrationBuilder.DropColumn(
                name: "target_change_count",
                table: "learner_profiles");

            migrationBuilder.DropColumn(
                name: "workspace_state_json",
                table: "learner_profiles");
        }
    }
}
