using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigiTalent.Infrastructure.Persistence.Migrations
{
    /// <summary>
    /// Pulse — trang nhân viên (canonical v3.1 §17): capability_baselines, capability_baseline_answers,
    /// course_final_submissions và assessments.module_id.
    ///
    /// Snapshot trước migration này thiếu ~20 bảng đã có trong DB (bị ghi đè ở PR #63), nên phần sinh tự động đã được
    /// lọc tay: bỏ mọi thao tác mà migration trước đã tạo, chỉ giữ thao tác thật sự mới. Vì snapshot sau migration này
    /// khớp toàn bộ model, migration cũng tạo password_reset_tokens — entity có từ PR #62 nhưng chưa migration nào tạo.
    /// </summary>
    public partial class AddPulseEmployeeLearning : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "module_id",
                table: "assessments",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "capability_baseline_answers",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    employee_id = table.Column<Guid>(type: "uuid", nullable: false),
                    question_id = table.Column<Guid>(type: "uuid", nullable: false),
                    selected_option_id = table.Column<Guid>(type: "uuid", nullable: false),
                    is_correct = table.Column<bool>(type: "boolean", nullable: false),
                    answered_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_capability_baseline_answers", x => x.id);
                    table.ForeignKey(
                        name: "fk_capability_baseline_answers_employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_capability_baseline_answers_question_options_selected_optio",
                        column: x => x.selected_option_id,
                        principalTable: "question_options",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_capability_baseline_answers_questions_question_id",
                        column: x => x.question_id,
                        principalTable: "questions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "capability_baselines",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    employee_id = table.Column<Guid>(type: "uuid", nullable: false),
                    competency_category_id = table.Column<Guid>(type: "uuid", nullable: false),
                    target_level = table.Column<short>(type: "smallint", nullable: false),
                    baseline_level = table.Column<short>(type: "smallint", nullable: false),
                    assessed_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_capability_baselines", x => x.id);
                    table.CheckConstraint("ck_capability_baselines_baseline_level", "baseline_level BETWEEN 0 AND target_level");
                    table.CheckConstraint("ck_capability_baselines_target_level", "target_level BETWEEN 1 AND 3");
                    table.ForeignKey(
                        name: "fk_capability_baselines_competency_categories_competency_categ",
                        column: x => x.competency_category_id,
                        principalTable: "competency_categories",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_capability_baselines_employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "course_final_submissions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    enrollment_id = table.Column<Guid>(type: "uuid", nullable: false),
                    attempt_no = table.Column<short>(type: "smallint", nullable: false),
                    evidence_text = table.Column<string>(type: "text", nullable: false),
                    submitted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    decision = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    decision_reason = table.Column<string>(type: "text", nullable: true),
                    reviewed_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    reviewed_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    retry_opens_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    retry_due_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    support_action = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    support_note = table.Column<string>(type: "text", nullable: true),
                    support_recorded_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    support_recorded_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_course_final_submissions", x => x.id);
                    table.CheckConstraint("ck_course_final_submissions_attempt_no", "attempt_no BETWEEN 1 AND 2");
                    table.CheckConstraint("ck_course_final_submissions_decision", "decision IS NULL OR decision IN ('PASSED','NOT_YET')");
                    table.CheckConstraint("ck_course_final_submissions_evidence", "char_length(evidence_text) BETWEEN 30 AND 8000");
                    table.CheckConstraint("ck_course_final_submissions_retry_window", "(retry_opens_at IS NULL AND retry_due_at IS NULL) OR (attempt_no = 1 AND decision = 'NOT_YET' AND retry_due_at > retry_opens_at)");
                    table.CheckConstraint("ck_course_final_submissions_review_complete", "(decision IS NULL AND decision_reason IS NULL AND reviewed_by_user_id IS NULL AND reviewed_at IS NULL) OR (decision IS NOT NULL AND char_length(decision_reason) >= 10 AND reviewed_by_user_id IS NOT NULL AND reviewed_at IS NOT NULL)");
                    table.CheckConstraint("ck_course_final_submissions_reviewed_after_submit", "reviewed_at IS NULL OR reviewed_at >= submitted_at");
                    table.CheckConstraint("ck_course_final_submissions_support_action", "support_action IS NULL OR support_action IN ('COACHING','FRESH_CYCLE','PAUSE')");
                    table.CheckConstraint("ck_course_final_submissions_support_complete", "(support_action IS NULL AND support_note IS NULL AND support_recorded_by_user_id IS NULL AND support_recorded_at IS NULL) OR (support_action IS NOT NULL AND decision = 'NOT_YET' AND support_recorded_by_user_id IS NOT NULL AND support_recorded_at IS NOT NULL)");
                    table.ForeignKey(
                        name: "fk_course_final_submissions_enrollments_enrollment_id",
                        column: x => x.enrollment_id,
                        principalTable: "enrollments",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_course_final_submissions_users_reviewed_by_user_id",
                        column: x => x.reviewed_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_course_final_submissions_users_support_recorded_by_user_id",
                        column: x => x.support_recorded_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "password_reset_tokens",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    token_hash = table.Column<string>(type: "text", nullable: false),
                    expires_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    used_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_password_reset_tokens", x => x.id);
                    table.ForeignKey(
                        name: "fk_password_reset_tokens_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_assessments_module_id",
                table: "assessments",
                column: "module_id");

            migrationBuilder.AddCheckConstraint(
                name: "ck_assessments_module_quiz",
                table: "assessments",
                sql: "module_id IS NULL OR (assessment_type = 'QUIZ' AND NOT is_final)");

            migrationBuilder.CreateIndex(
                name: "ix_capability_baseline_answers_question_id",
                table: "capability_baseline_answers",
                column: "question_id");

            migrationBuilder.CreateIndex(
                name: "ix_capability_baseline_answers_selected_option_id",
                table: "capability_baseline_answers",
                column: "selected_option_id");

            migrationBuilder.CreateIndex(
                name: "uq_capability_baseline_answers_employee_question",
                table: "capability_baseline_answers",
                columns: new[] { "employee_id", "question_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_capability_baselines_competency_category_id",
                table: "capability_baselines",
                column: "competency_category_id");

            migrationBuilder.CreateIndex(
                name: "uq_capability_baselines_employee_category",
                table: "capability_baselines",
                columns: new[] { "employee_id", "competency_category_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_course_final_submissions_pending",
                table: "course_final_submissions",
                column: "submitted_at",
                filter: "decision IS NULL");

            migrationBuilder.CreateIndex(
                name: "ix_course_final_submissions_reviewed_by_user_id",
                table: "course_final_submissions",
                column: "reviewed_by_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_course_final_submissions_support_recorded_by_user_id",
                table: "course_final_submissions",
                column: "support_recorded_by_user_id");

            migrationBuilder.CreateIndex(
                name: "uq_course_final_submissions_enrollment_attempt",
                table: "course_final_submissions",
                columns: new[] { "enrollment_id", "attempt_no" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_password_reset_tokens_token_hash",
                table: "password_reset_tokens",
                column: "token_hash",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_password_reset_tokens_user_id",
                table: "password_reset_tokens",
                column: "user_id");

            migrationBuilder.AddForeignKey(
                name: "fk_assessments_course_modules_module_id",
                table: "assessments",
                column: "module_id",
                principalTable: "course_modules",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_assessments_course_modules_module_id",
                table: "assessments");

            migrationBuilder.DropTable(
                name: "capability_baseline_answers");

            migrationBuilder.DropTable(
                name: "capability_baselines");

            migrationBuilder.DropTable(
                name: "course_final_submissions");

            migrationBuilder.DropTable(
                name: "password_reset_tokens");

            migrationBuilder.DropIndex(
                name: "ix_assessments_module_id",
                table: "assessments");

            migrationBuilder.DropCheckConstraint(
                name: "ck_assessments_module_quiz",
                table: "assessments");

            migrationBuilder.DropColumn(
                name: "module_id",
                table: "assessments");
        }
    }
}
