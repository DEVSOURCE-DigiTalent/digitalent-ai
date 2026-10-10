using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigiTalent.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddAssessmentTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddForeignKey(
                name: "fk_assessment_answers_assessment_attempts_attempt_id",
                table: "assessment_answers",
                column: "attempt_id",
                principalTable: "assessment_attempts",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_assessment_answers_question_options_selected_option_id",
                table: "assessment_answers",
                column: "selected_option_id",
                principalTable: "question_options",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_assessment_answers_questions_question_id",
                table: "assessment_answers",
                column: "question_id",
                principalTable: "questions",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_assessment_attempts_assessments_assessment_id",
                table: "assessment_attempts",
                column: "assessment_id",
                principalTable: "assessments",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_assessment_attempts_enrollments_enrollment_id",
                table: "assessment_attempts",
                column: "enrollment_id",
                principalTable: "enrollments",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_assessment_questions_assessments_assessment_id",
                table: "assessment_questions",
                column: "assessment_id",
                principalTable: "assessments",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_assessment_questions_questions_question_id",
                table: "assessment_questions",
                column: "question_id",
                principalTable: "questions",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_assessments_assessments_supersedes_assessment_id",
                table: "assessments",
                column: "supersedes_assessment_id",
                principalTable: "assessments",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_assessments_courses_course_id",
                table: "assessments",
                column: "course_id",
                principalTable: "courses",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_assessments_users_created_by_user_id",
                table: "assessments",
                column: "created_by_user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_question_banks_organizations_organization_id",
                table: "question_banks",
                column: "organization_id",
                principalTable: "organizations",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_question_banks_users_owner_user_id",
                table: "question_banks",
                column: "owner_user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_question_options_questions_question_id",
                table: "question_options",
                column: "question_id",
                principalTable: "questions",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_questions_competencies_competency_id",
                table: "questions",
                column: "competency_id",
                principalTable: "competencies",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_questions_question_banks_bank_id",
                table: "questions",
                column: "bank_id",
                principalTable: "question_banks",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_questions_users_created_by_user_id",
                table: "questions",
                column: "created_by_user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_assessment_answers_assessment_attempts_attempt_id",
                table: "assessment_answers");

            migrationBuilder.DropForeignKey(
                name: "fk_assessment_answers_question_options_selected_option_id",
                table: "assessment_answers");

            migrationBuilder.DropForeignKey(
                name: "fk_assessment_answers_questions_question_id",
                table: "assessment_answers");

            migrationBuilder.DropForeignKey(
                name: "fk_assessment_attempts_assessments_assessment_id",
                table: "assessment_attempts");

            migrationBuilder.DropForeignKey(
                name: "fk_assessment_attempts_enrollments_enrollment_id",
                table: "assessment_attempts");

            migrationBuilder.DropForeignKey(
                name: "fk_assessment_questions_assessments_assessment_id",
                table: "assessment_questions");

            migrationBuilder.DropForeignKey(
                name: "fk_assessment_questions_questions_question_id",
                table: "assessment_questions");

            migrationBuilder.DropForeignKey(
                name: "fk_assessments_assessments_supersedes_assessment_id",
                table: "assessments");

            migrationBuilder.DropForeignKey(
                name: "fk_assessments_courses_course_id",
                table: "assessments");

            migrationBuilder.DropForeignKey(
                name: "fk_assessments_users_created_by_user_id",
                table: "assessments");

            migrationBuilder.DropForeignKey(
                name: "fk_question_banks_organizations_organization_id",
                table: "question_banks");

            migrationBuilder.DropForeignKey(
                name: "fk_question_banks_users_owner_user_id",
                table: "question_banks");

            migrationBuilder.DropForeignKey(
                name: "fk_question_options_questions_question_id",
                table: "question_options");

            migrationBuilder.DropForeignKey(
                name: "fk_questions_competencies_competency_id",
                table: "questions");

            migrationBuilder.DropForeignKey(
                name: "fk_questions_question_banks_bank_id",
                table: "questions");

            migrationBuilder.DropForeignKey(
                name: "fk_questions_users_created_by_user_id",
                table: "questions");
        }
    }
}
