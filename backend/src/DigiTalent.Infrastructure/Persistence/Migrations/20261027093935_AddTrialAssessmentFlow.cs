using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigiTalent.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddTrialAssessmentFlow : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_proctoring_sessions_kind",
                table: "proctoring_sessions");

            migrationBuilder.DropCheckConstraint(
                name: "ck_exam_choice_answers_owner",
                table: "exam_choice_answers");

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "mentor_assigned_at",
                table: "trial_workspaces",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "mentor_user_id",
                table: "trial_workspaces",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "preferred_review_at",
                table: "trial_workspaces",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "report_published_at",
                table: "trial_workspaces",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "request_note",
                table: "trial_workspaces",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "requested_at",
                table: "trial_workspaces",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "test_deadline",
                table: "trial_workspaces",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "course_id",
                table: "proctoring_sessions",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddColumn<Guid>(
                name: "trial_assessment_id",
                table: "exam_choice_answers",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "trial_assessments",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    organization_id = table.Column<Guid>(type: "uuid", nullable: false),
                    employee_id = table.Column<Guid>(type: "uuid", nullable: false),
                    proctoring_session_id = table.Column<Guid>(type: "uuid", nullable: false),
                    essay_basic = table.Column<string>(type: "text", nullable: false),
                    essay_intermediate = table.Column<string>(type: "text", nullable: false),
                    essay_advanced = table.Column<string>(type: "text", nullable: false),
                    choice_score = table.Column<short>(type: "smallint", nullable: false),
                    choice_total = table.Column<short>(type: "smallint", nullable: false),
                    submitted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    reviewed_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    reviewed_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    review_note = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_trial_assessments", x => x.id);
                    table.CheckConstraint("ck_trial_assessments_choice", "choice_total >= 0 AND choice_score BETWEEN 0 AND choice_total");
                    table.CheckConstraint("ck_trial_assessments_review", "(reviewed_at IS NULL) = (reviewed_by_user_id IS NULL)");
                    table.ForeignKey(
                        name: "fk_trial_assessments_employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_trial_assessments_organizations_organization_id",
                        column: x => x.organization_id,
                        principalTable: "organizations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_trial_assessments_proctoring_sessions_proctoring_session_id",
                        column: x => x.proctoring_session_id,
                        principalTable: "proctoring_sessions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_trial_assessments_users_reviewed_by_user_id",
                        column: x => x.reviewed_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "trial_assessment_domains",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    trial_assessment_id = table.Column<Guid>(type: "uuid", nullable: false),
                    category_id = table.Column<Guid>(type: "uuid", nullable: false),
                    basic_correct = table.Column<short>(type: "smallint", nullable: false),
                    basic_total = table.Column<short>(type: "smallint", nullable: false),
                    intermediate_correct = table.Column<short>(type: "smallint", nullable: false),
                    intermediate_total = table.Column<short>(type: "smallint", nullable: false),
                    advanced_correct = table.Column<short>(type: "smallint", nullable: false),
                    advanced_total = table.Column<short>(type: "smallint", nullable: false),
                    suggested_level = table.Column<short>(type: "smallint", nullable: false),
                    mentor_level = table.Column<short>(type: "smallint", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_trial_assessment_domains", x => x.id);
                    table.CheckConstraint("ck_trial_assessment_domains_counts", "basic_correct BETWEEN 0 AND basic_total AND intermediate_correct BETWEEN 0 AND intermediate_total AND advanced_correct BETWEEN 0 AND advanced_total");
                    table.CheckConstraint("ck_trial_assessment_domains_levels", "suggested_level BETWEEN 0 AND 3 AND (mentor_level IS NULL OR mentor_level BETWEEN 0 AND 3)");
                    table.ForeignKey(
                        name: "fk_trial_assessment_domains_competency_categories_category_id",
                        column: x => x.category_id,
                        principalTable: "competency_categories",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_trial_assessment_domains_trial_assessments_trial_assessment",
                        column: x => x.trial_assessment_id,
                        principalTable: "trial_assessments",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_trial_workspaces_mentor_user_id",
                table: "trial_workspaces",
                column: "mentor_user_id");

            migrationBuilder.AddCheckConstraint(
                name: "ck_trial_workspaces_mentor",
                table: "trial_workspaces",
                sql: "(mentor_user_id IS NULL) = (mentor_assigned_at IS NULL)");

            migrationBuilder.AddCheckConstraint(
                name: "ck_trial_workspaces_report",
                table: "trial_workspaces",
                sql: "report_published_at IS NULL OR mentor_user_id IS NOT NULL");

            migrationBuilder.AddCheckConstraint(
                name: "ck_trial_workspaces_request",
                table: "trial_workspaces",
                sql: "requested_at IS NULL OR test_deadline IS NOT NULL");

            migrationBuilder.AddCheckConstraint(
                name: "ck_proctoring_sessions_course",
                table: "proctoring_sessions",
                sql: "(kind = 'TRIAL_ASSESSMENT') = (course_id IS NULL)");

            migrationBuilder.AddCheckConstraint(
                name: "ck_proctoring_sessions_kind",
                table: "proctoring_sessions",
                sql: "kind IN ('PRE_ASSESSMENT', 'FINAL', 'TRIAL_ASSESSMENT')");

            migrationBuilder.CreateIndex(
                name: "uq_exam_choice_answers_trial_question",
                table: "exam_choice_answers",
                columns: new[] { "trial_assessment_id", "question_id" },
                unique: true,
                filter: "trial_assessment_id IS NOT NULL");

            migrationBuilder.AddCheckConstraint(
                name: "ck_exam_choice_answers_owner",
                table: "exam_choice_answers",
                sql: "num_nonnulls(final_submission_id, pre_assessment_id, trial_assessment_id) = 1");

            migrationBuilder.CreateIndex(
                name: "ix_trial_assessment_domains_category_id",
                table: "trial_assessment_domains",
                column: "category_id");

            migrationBuilder.CreateIndex(
                name: "uq_trial_assessment_domains_category",
                table: "trial_assessment_domains",
                columns: new[] { "trial_assessment_id", "category_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_trial_assessments_organization_id",
                table: "trial_assessments",
                column: "organization_id");

            migrationBuilder.CreateIndex(
                name: "ix_trial_assessments_reviewed_by_user_id",
                table: "trial_assessments",
                column: "reviewed_by_user_id");

            migrationBuilder.CreateIndex(
                name: "uq_trial_assessments_employee",
                table: "trial_assessments",
                column: "employee_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "uq_trial_assessments_session",
                table: "trial_assessments",
                column: "proctoring_session_id",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "fk_exam_choice_answers_trial_assessments_trial_assessment_id",
                table: "exam_choice_answers",
                column: "trial_assessment_id",
                principalTable: "trial_assessments",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_trial_workspaces_users_mentor_user_id",
                table: "trial_workspaces",
                column: "mentor_user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_exam_choice_answers_trial_assessments_trial_assessment_id",
                table: "exam_choice_answers");

            migrationBuilder.DropForeignKey(
                name: "fk_trial_workspaces_users_mentor_user_id",
                table: "trial_workspaces");

            migrationBuilder.DropTable(
                name: "trial_assessment_domains");

            migrationBuilder.DropTable(
                name: "trial_assessments");

            migrationBuilder.DropIndex(
                name: "ix_trial_workspaces_mentor_user_id",
                table: "trial_workspaces");

            migrationBuilder.DropCheckConstraint(
                name: "ck_trial_workspaces_mentor",
                table: "trial_workspaces");

            migrationBuilder.DropCheckConstraint(
                name: "ck_trial_workspaces_report",
                table: "trial_workspaces");

            migrationBuilder.DropCheckConstraint(
                name: "ck_trial_workspaces_request",
                table: "trial_workspaces");

            migrationBuilder.DropCheckConstraint(
                name: "ck_proctoring_sessions_course",
                table: "proctoring_sessions");

            migrationBuilder.DropCheckConstraint(
                name: "ck_proctoring_sessions_kind",
                table: "proctoring_sessions");

            migrationBuilder.DropIndex(
                name: "uq_exam_choice_answers_trial_question",
                table: "exam_choice_answers");

            migrationBuilder.DropCheckConstraint(
                name: "ck_exam_choice_answers_owner",
                table: "exam_choice_answers");

            migrationBuilder.DropColumn(
                name: "mentor_assigned_at",
                table: "trial_workspaces");

            migrationBuilder.DropColumn(
                name: "mentor_user_id",
                table: "trial_workspaces");

            migrationBuilder.DropColumn(
                name: "preferred_review_at",
                table: "trial_workspaces");

            migrationBuilder.DropColumn(
                name: "report_published_at",
                table: "trial_workspaces");

            migrationBuilder.DropColumn(
                name: "request_note",
                table: "trial_workspaces");

            migrationBuilder.DropColumn(
                name: "requested_at",
                table: "trial_workspaces");

            migrationBuilder.DropColumn(
                name: "test_deadline",
                table: "trial_workspaces");

            migrationBuilder.DropColumn(
                name: "trial_assessment_id",
                table: "exam_choice_answers");

            migrationBuilder.AlterColumn<Guid>(
                name: "course_id",
                table: "proctoring_sessions",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AddCheckConstraint(
                name: "ck_proctoring_sessions_kind",
                table: "proctoring_sessions",
                sql: "kind IN ('PRE_ASSESSMENT', 'FINAL')");

            migrationBuilder.AddCheckConstraint(
                name: "ck_exam_choice_answers_owner",
                table: "exam_choice_answers",
                sql: "(final_submission_id IS NULL) <> (pre_assessment_id IS NULL)");
        }
    }
}
