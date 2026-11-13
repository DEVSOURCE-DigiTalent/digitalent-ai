using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigiTalent.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AlignTrialWorkspaceReportCheck : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_trial_workspaces_report",
                table: "trial_workspaces");

            migrationBuilder.AddCheckConstraint(
                name: "ck_trial_workspaces_report",
                table: "trial_workspaces",
                sql: "report_published_at IS NULL OR mentor_user_id IS NOT NULL OR owner_user_id IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_trial_workspaces_report",
                table: "trial_workspaces");

            migrationBuilder.AddCheckConstraint(
                name: "ck_trial_workspaces_report",
                table: "trial_workspaces",
                sql: "report_published_at IS NULL OR mentor_user_id IS NOT NULL");
        }
    }
}
