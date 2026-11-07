using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigiTalent.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddTrialReports : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_trial_workspaces_report",
                table: "trial_workspaces");

            migrationBuilder.CreateTable(
                name: "trial_reports",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    organization_id = table.Column<Guid>(type: "uuid", nullable: false),
                    assessed_count = table.Column<short>(type: "smallint", nullable: false),
                    insights = table.Column<string>(type: "jsonb", nullable: false),
                    ai_status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    ai_model = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ai_replaced = table.Column<short>(type: "smallint", nullable: false),
                    generated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    ai_completed_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_trial_reports", x => x.id);
                    table.CheckConstraint("ck_trial_reports_ai_completed", "(ai_status = 'PENDING') = (ai_completed_at IS NULL)");
                    table.CheckConstraint("ck_trial_reports_ai_model", "(ai_status = 'DONE') = (ai_model IS NOT NULL)");
                    table.CheckConstraint("ck_trial_reports_ai_status", "ai_status IN ('PENDING', 'DONE', 'FALLBACK')");
                    table.CheckConstraint("ck_trial_reports_counts", "assessed_count >= 0 AND ai_replaced >= 0");
                    table.ForeignKey(
                        name: "fk_trial_reports_organizations_organization_id",
                        column: x => x.organization_id,
                        principalTable: "organizations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_trial_reports_ai_status",
                table: "trial_reports",
                column: "ai_status");

            migrationBuilder.CreateIndex(
                name: "uq_trial_reports_organization",
                table: "trial_reports",
                column: "organization_id",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "trial_reports");

            migrationBuilder.AddCheckConstraint(
                name: "ck_trial_workspaces_report",
                table: "trial_workspaces",
                sql: "report_published_at IS NULL OR mentor_user_id IS NOT NULL");
        }
    }
}
