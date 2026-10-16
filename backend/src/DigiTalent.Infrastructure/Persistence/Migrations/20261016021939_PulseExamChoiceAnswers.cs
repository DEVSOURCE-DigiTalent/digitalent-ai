using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigiTalent.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class PulseExamChoiceAnswers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<short>(
                name: "choice_score",
                table: "course_pre_assessments",
                type: "smallint",
                nullable: true);

            migrationBuilder.AddColumn<short>(
                name: "choice_total",
                table: "course_pre_assessments",
                type: "smallint",
                nullable: true);

            migrationBuilder.AddColumn<short>(
                name: "choice_score",
                table: "course_final_submissions",
                type: "smallint",
                nullable: true);

            migrationBuilder.AddColumn<short>(
                name: "choice_total",
                table: "course_final_submissions",
                type: "smallint",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "exam_choice_answers",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    final_submission_id = table.Column<Guid>(type: "uuid", nullable: true),
                    pre_assessment_id = table.Column<Guid>(type: "uuid", nullable: true),
                    question_id = table.Column<Guid>(type: "uuid", nullable: false),
                    selected_option_id = table.Column<Guid>(type: "uuid", nullable: false),
                    is_correct = table.Column<bool>(type: "boolean", nullable: false),
                    sort_order = table.Column<short>(type: "smallint", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_exam_choice_answers", x => x.id);
                    table.CheckConstraint("ck_exam_choice_answers_owner", "(final_submission_id IS NULL) <> (pre_assessment_id IS NULL)");
                    table.CheckConstraint("ck_exam_choice_answers_sort_order", "sort_order >= 1");
                    table.ForeignKey(
                        name: "fk_exam_choice_answers_course_final_submissions_final_submissi",
                        column: x => x.final_submission_id,
                        principalTable: "course_final_submissions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_exam_choice_answers_course_pre_assessments_pre_assessment_id",
                        column: x => x.pre_assessment_id,
                        principalTable: "course_pre_assessments",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_exam_choice_answers_question_options_selected_option_id",
                        column: x => x.selected_option_id,
                        principalTable: "question_options",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_exam_choice_answers_questions_question_id",
                        column: x => x.question_id,
                        principalTable: "questions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.AddCheckConstraint(
                name: "ck_course_pre_assessments_choice",
                table: "course_pre_assessments",
                sql: "(choice_score IS NULL AND choice_total IS NULL) OR (choice_total BETWEEN 1 AND 50 AND choice_score BETWEEN 0 AND choice_total)");

            migrationBuilder.AddCheckConstraint(
                name: "ck_course_final_submissions_choice",
                table: "course_final_submissions",
                sql: "(choice_score IS NULL AND choice_total IS NULL) OR (choice_total BETWEEN 1 AND 50 AND choice_score BETWEEN 0 AND choice_total)");

            migrationBuilder.CreateIndex(
                name: "ix_exam_choice_answers_question_id",
                table: "exam_choice_answers",
                column: "question_id");

            migrationBuilder.CreateIndex(
                name: "ix_exam_choice_answers_selected_option_id",
                table: "exam_choice_answers",
                column: "selected_option_id");

            migrationBuilder.CreateIndex(
                name: "uq_exam_choice_answers_final_question",
                table: "exam_choice_answers",
                columns: new[] { "final_submission_id", "question_id" },
                unique: true,
                filter: "final_submission_id IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "uq_exam_choice_answers_pre_question",
                table: "exam_choice_answers",
                columns: new[] { "pre_assessment_id", "question_id" },
                unique: true,
                filter: "pre_assessment_id IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "exam_choice_answers");

            migrationBuilder.DropCheckConstraint(
                name: "ck_course_pre_assessments_choice",
                table: "course_pre_assessments");

            migrationBuilder.DropCheckConstraint(
                name: "ck_course_final_submissions_choice",
                table: "course_final_submissions");

            migrationBuilder.DropColumn(
                name: "choice_score",
                table: "course_pre_assessments");

            migrationBuilder.DropColumn(
                name: "choice_total",
                table: "course_pre_assessments");

            migrationBuilder.DropColumn(
                name: "choice_score",
                table: "course_final_submissions");

            migrationBuilder.DropColumn(
                name: "choice_total",
                table: "course_final_submissions");
        }
    }
}
