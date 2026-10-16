using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigiTalent.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class PulsePreAssessmentProctoring : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "proctoring_session_id",
                table: "course_final_submissions",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "proctoring_sessions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    employee_id = table.Column<Guid>(type: "uuid", nullable: false),
                    course_id = table.Column<Guid>(type: "uuid", nullable: false),
                    kind = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    started_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    ended_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    duration_ms = table.Column<long>(type: "bigint", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_proctoring_sessions", x => x.id);
                    table.CheckConstraint("ck_proctoring_sessions_duration", "duration_ms IS NULL OR duration_ms >= 0");
                    table.CheckConstraint("ck_proctoring_sessions_ended", "(status = 'RECORDING' AND ended_at IS NULL) OR (status <> 'RECORDING' AND ended_at IS NOT NULL AND ended_at >= started_at)");
                    table.CheckConstraint("ck_proctoring_sessions_kind", "kind IN ('PRE_ASSESSMENT', 'FINAL')");
                    table.CheckConstraint("ck_proctoring_sessions_status", "status IN ('RECORDING', 'SUBMITTED', 'ABANDONED')");
                    table.ForeignKey(
                        name: "fk_proctoring_sessions_courses_course_id",
                        column: x => x.course_id,
                        principalTable: "courses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_proctoring_sessions_employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "course_pre_assessments",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    employee_id = table.Column<Guid>(type: "uuid", nullable: false),
                    course_id = table.Column<Guid>(type: "uuid", nullable: false),
                    proctoring_session_id = table.Column<Guid>(type: "uuid", nullable: true),
                    evidence_text = table.Column<string>(type: "text", nullable: false),
                    submitted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    decision = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    decision_reason = table.Column<string>(type: "text", nullable: true),
                    reviewed_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    reviewed_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    enrollment_id = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_course_pre_assessments", x => x.id);
                    table.CheckConstraint("ck_course_pre_assessments_decision", "decision IS NULL OR decision IN ('PASSED', 'NOT_YET')");
                    table.CheckConstraint("ck_course_pre_assessments_enrollment", "enrollment_id IS NULL OR decision = 'PASSED'");
                    table.CheckConstraint("ck_course_pre_assessments_evidence", "char_length(evidence_text) BETWEEN 30 AND 8000");
                    table.CheckConstraint("ck_course_pre_assessments_review_complete", "(decision IS NULL AND decision_reason IS NULL AND reviewed_by_user_id IS NULL AND reviewed_at IS NULL) OR (decision IS NOT NULL AND char_length(decision_reason) >= 10 AND reviewed_by_user_id IS NOT NULL AND reviewed_at IS NOT NULL)");
                    table.CheckConstraint("ck_course_pre_assessments_reviewed_after_submit", "reviewed_at IS NULL OR reviewed_at >= submitted_at");
                    table.ForeignKey(
                        name: "fk_course_pre_assessments_courses_course_id",
                        column: x => x.course_id,
                        principalTable: "courses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_course_pre_assessments_employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_course_pre_assessments_enrollments_enrollment_id",
                        column: x => x.enrollment_id,
                        principalTable: "enrollments",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_course_pre_assessments_proctoring_sessions_proctoring_sessi",
                        column: x => x.proctoring_session_id,
                        principalTable: "proctoring_sessions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_course_pre_assessments_users_reviewed_by_user_id",
                        column: x => x.reviewed_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "proctoring_events",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    session_id = table.Column<Guid>(type: "uuid", nullable: false),
                    kind = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    offset_ms = table.Column<long>(type: "bigint", nullable: false),
                    duration_ms = table.Column<long>(type: "bigint", nullable: true),
                    detail = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    occurred_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_proctoring_events", x => x.id);
                    table.CheckConstraint("ck_proctoring_events_kind", "kind IN ('STARTED', 'TAB_HIDDEN', 'FOCUS_LOST', 'SHARE_STOPPED', 'SHARE_RESUMED', 'CAMERA_STOPPED', 'CAMERA_RESUMED', 'MIC_STOPPED', 'MIC_RESUMED', 'SUBMITTED')");
                    table.CheckConstraint("ck_proctoring_events_offsets", "offset_ms >= 0 AND (duration_ms IS NULL OR duration_ms >= 0)");
                    table.ForeignKey(
                        name: "fk_proctoring_events_proctoring_sessions_session_id",
                        column: x => x.session_id,
                        principalTable: "proctoring_sessions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "proctoring_recordings",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    session_id = table.Column<Guid>(type: "uuid", nullable: false),
                    track = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    segment_no = table.Column<short>(type: "smallint", nullable: false),
                    content_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    display_surface = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    storage_path = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    start_offset_ms = table.Column<long>(type: "bigint", nullable: false),
                    end_offset_ms = table.Column<long>(type: "bigint", nullable: true),
                    chunk_count = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    size_bytes = table.Column<long>(type: "bigint", nullable: false, defaultValue: 0L),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_proctoring_recordings", x => x.id);
                    table.CheckConstraint("ck_proctoring_recordings_offsets", "start_offset_ms >= 0 AND (end_offset_ms IS NULL OR end_offset_ms >= start_offset_ms)");
                    table.CheckConstraint("ck_proctoring_recordings_segment_no", "segment_no BETWEEN 1 AND 50");
                    table.CheckConstraint("ck_proctoring_recordings_size", "chunk_count >= 0 AND size_bytes >= 0");
                    table.CheckConstraint("ck_proctoring_recordings_track", "track IN ('SCREEN', 'CAMERA')");
                    table.ForeignKey(
                        name: "fk_proctoring_recordings_proctoring_sessions_session_id",
                        column: x => x.session_id,
                        principalTable: "proctoring_sessions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "uq_course_final_submissions_session",
                table: "course_final_submissions",
                column: "proctoring_session_id",
                unique: true,
                filter: "proctoring_session_id IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "ix_course_pre_assessments_course_id",
                table: "course_pre_assessments",
                column: "course_id");

            migrationBuilder.CreateIndex(
                name: "ix_course_pre_assessments_enrollment_id",
                table: "course_pre_assessments",
                column: "enrollment_id");

            migrationBuilder.CreateIndex(
                name: "ix_course_pre_assessments_pending",
                table: "course_pre_assessments",
                column: "submitted_at",
                filter: "decision IS NULL");

            migrationBuilder.CreateIndex(
                name: "ix_course_pre_assessments_reviewed_by_user_id",
                table: "course_pre_assessments",
                column: "reviewed_by_user_id");

            migrationBuilder.CreateIndex(
                name: "uq_course_pre_assessments_employee_course",
                table: "course_pre_assessments",
                columns: new[] { "employee_id", "course_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "uq_course_pre_assessments_session",
                table: "course_pre_assessments",
                column: "proctoring_session_id",
                unique: true,
                filter: "proctoring_session_id IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "ix_proctoring_events_session_offset",
                table: "proctoring_events",
                columns: new[] { "session_id", "offset_ms" });

            migrationBuilder.CreateIndex(
                name: "uq_proctoring_recordings_session_track_segment",
                table: "proctoring_recordings",
                columns: new[] { "session_id", "track", "segment_no" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_proctoring_sessions_course_id",
                table: "proctoring_sessions",
                column: "course_id");

            migrationBuilder.CreateIndex(
                name: "ix_proctoring_sessions_employee_course",
                table: "proctoring_sessions",
                columns: new[] { "employee_id", "course_id" });

            migrationBuilder.AddForeignKey(
                name: "fk_course_final_submissions_proctoring_sessions_proctoring_ses",
                table: "course_final_submissions",
                column: "proctoring_session_id",
                principalTable: "proctoring_sessions",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_course_final_submissions_proctoring_sessions_proctoring_ses",
                table: "course_final_submissions");

            migrationBuilder.DropTable(
                name: "course_pre_assessments");

            migrationBuilder.DropTable(
                name: "proctoring_events");

            migrationBuilder.DropTable(
                name: "proctoring_recordings");

            migrationBuilder.DropTable(
                name: "proctoring_sessions");

            migrationBuilder.DropIndex(
                name: "uq_course_final_submissions_session",
                table: "course_final_submissions");

            migrationBuilder.DropColumn(
                name: "proctoring_session_id",
                table: "course_final_submissions");
        }
    }
}
