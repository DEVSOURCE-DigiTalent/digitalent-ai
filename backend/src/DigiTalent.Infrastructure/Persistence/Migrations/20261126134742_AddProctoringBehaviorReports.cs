using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigiTalent.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddProctoringBehaviorReports : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_proctoring_events_kind",
                table: "proctoring_events");

            migrationBuilder.CreateTable(
                name: "proctoring_behavior_reports",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    organization_id = table.Column<Guid>(type: "uuid", nullable: false),
                    session_id = table.Column<Guid>(type: "uuid", nullable: false),
                    employee_id = table.Column<Guid>(type: "uuid", nullable: false),
                    course_id = table.Column<Guid>(type: "uuid", nullable: true),
                    final_submission_id = table.Column<Guid>(type: "uuid", nullable: true),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    risk_score = table.Column<short>(type: "smallint", nullable: false),
                    risk_level = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    ai_level = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    summary = table.Column<string>(type: "text", nullable: true),
                    details = table.Column<string>(type: "jsonb", nullable: false),
                    error_code = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: true),
                    model = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    input_hash = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    attempt_count = table.Column<short>(type: "smallint", nullable: false, defaultValue: (short)0),
                    analyzed_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_proctoring_behavior_reports", x => x.id);
                    table.CheckConstraint("ck_proctoring_behavior_reports_ai_level", "ai_level IS NULL OR ai_level IN ('LOW', 'MEDIUM', 'HIGH')");
                    table.CheckConstraint("ck_proctoring_behavior_reports_attempt_count", "attempt_count >= 0");
                    table.CheckConstraint("ck_proctoring_behavior_reports_failed", "status <> 'FAILED' OR error_code IS NOT NULL");
                    table.CheckConstraint("ck_proctoring_behavior_reports_input_hash", "input_hash IS NULL OR char_length(input_hash) = 64");
                    table.CheckConstraint("ck_proctoring_behavior_reports_ready", "status <> 'READY' OR (ai_level IS NOT NULL AND analyzed_at IS NOT NULL)");
                    table.CheckConstraint("ck_proctoring_behavior_reports_risk_level", "risk_level IN ('LOW', 'MEDIUM', 'HIGH')");
                    table.CheckConstraint("ck_proctoring_behavior_reports_risk_score", "risk_score BETWEEN 0 AND 100");
                    table.CheckConstraint("ck_proctoring_behavior_reports_status", "status IN ('PENDING', 'READY', 'FAILED')");
                    table.ForeignKey(
                        name: "fk_proctoring_behavior_reports_course_final_submissions_final_",
                        column: x => x.final_submission_id,
                        principalTable: "course_final_submissions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_proctoring_behavior_reports_courses_course_id",
                        column: x => x.course_id,
                        principalTable: "courses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_proctoring_behavior_reports_employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_proctoring_behavior_reports_organizations_organization_id",
                        column: x => x.organization_id,
                        principalTable: "organizations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_proctoring_behavior_reports_proctoring_sessions_session_id",
                        column: x => x.session_id,
                        principalTable: "proctoring_sessions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.AddCheckConstraint(
                name: "ck_proctoring_events_kind",
                table: "proctoring_events",
                sql: "kind IN ('STARTED', 'TAB_HIDDEN', 'FOCUS_LOST', 'SHARE_STOPPED', 'SHARE_RESUMED', 'CAMERA_STOPPED', 'CAMERA_RESUMED', 'MIC_STOPPED', 'MIC_RESUMED', 'SUBMITTED', 'FACE_MISSING', 'MULTIPLE_FACES', 'LOOKING_AWAY', 'FACE_CHECK_ON', 'FACE_CHECK_OFF', 'COPY', 'PASTE', 'IDLE', 'SECOND_SCREEN')");

            migrationBuilder.CreateIndex(
                name: "ix_proctoring_behavior_reports_course_id",
                table: "proctoring_behavior_reports",
                column: "course_id");

            migrationBuilder.CreateIndex(
                name: "ix_proctoring_behavior_reports_employee_id",
                table: "proctoring_behavior_reports",
                column: "employee_id");

            migrationBuilder.CreateIndex(
                name: "ix_proctoring_behavior_reports_final_submission_id",
                table: "proctoring_behavior_reports",
                column: "final_submission_id");

            migrationBuilder.CreateIndex(
                name: "ix_proctoring_behavior_reports_org_created",
                table: "proctoring_behavior_reports",
                columns: new[] { "organization_id", "created_at" });

            migrationBuilder.CreateIndex(
                name: "ix_proctoring_behavior_reports_pending",
                table: "proctoring_behavior_reports",
                column: "updated_at",
                filter: "status = 'PENDING'");

            migrationBuilder.CreateIndex(
                name: "uq_proctoring_behavior_reports_session",
                table: "proctoring_behavior_reports",
                column: "session_id",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "proctoring_behavior_reports");

            migrationBuilder.DropCheckConstraint(
                name: "ck_proctoring_events_kind",
                table: "proctoring_events");

            migrationBuilder.AddCheckConstraint(
                name: "ck_proctoring_events_kind",
                table: "proctoring_events",
                sql: "kind IN ('STARTED', 'TAB_HIDDEN', 'FOCUS_LOST', 'SHARE_STOPPED', 'SHARE_RESUMED', 'CAMERA_STOPPED', 'CAMERA_RESUMED', 'MIC_STOPPED', 'MIC_RESUMED', 'SUBMITTED', 'FACE_MISSING', 'MULTIPLE_FACES', 'LOOKING_AWAY', 'FACE_CHECK_ON', 'FACE_CHECK_OFF')");
        }
    }
}
