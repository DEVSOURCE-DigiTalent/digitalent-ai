using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigiTalent.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddLearningAndCertificateTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddForeignKey(
                name: "fk_certificate_templates_organizations_organization_id",
                table: "certificate_templates",
                column: "organization_id",
                principalTable: "organizations",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_certificate_templates_users_created_by_user_id",
                table: "certificate_templates",
                column: "created_by_user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_certificates_assessment_attempts_assessment_attempt_id",
                table: "certificates",
                column: "assessment_attempt_id",
                principalTable: "assessment_attempts",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_certificates_certificate_templates_certificate_template_id",
                table: "certificates",
                column: "certificate_template_id",
                principalTable: "certificate_templates",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_certificates_employees_employee_id",
                table: "certificates",
                column: "employee_id",
                principalTable: "employees",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_certificates_enrollments_enrollment_id",
                table: "certificates",
                column: "enrollment_id",
                principalTable: "enrollments",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_certificates_users_revoked_by_user_id",
                table: "certificates",
                column: "revoked_by_user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_course_modules_courses_course_id",
                table: "course_modules",
                column: "course_id",
                principalTable: "courses",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_lessons_course_modules_module_id",
                table: "lessons",
                column: "module_id",
                principalTable: "course_modules",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_certificate_templates_organizations_organization_id",
                table: "certificate_templates");

            migrationBuilder.DropForeignKey(
                name: "fk_certificate_templates_users_created_by_user_id",
                table: "certificate_templates");

            migrationBuilder.DropForeignKey(
                name: "fk_certificates_assessment_attempts_assessment_attempt_id",
                table: "certificates");

            migrationBuilder.DropForeignKey(
                name: "fk_certificates_certificate_templates_certificate_template_id",
                table: "certificates");

            migrationBuilder.DropForeignKey(
                name: "fk_certificates_employees_employee_id",
                table: "certificates");

            migrationBuilder.DropForeignKey(
                name: "fk_certificates_enrollments_enrollment_id",
                table: "certificates");

            migrationBuilder.DropForeignKey(
                name: "fk_certificates_users_revoked_by_user_id",
                table: "certificates");

            migrationBuilder.DropForeignKey(
                name: "fk_course_modules_courses_course_id",
                table: "course_modules");

            migrationBuilder.DropForeignKey(
                name: "fk_lessons_course_modules_module_id",
                table: "lessons");
        }
    }
}
