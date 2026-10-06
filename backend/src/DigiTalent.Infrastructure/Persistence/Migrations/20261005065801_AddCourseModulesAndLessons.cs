using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigiTalent.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddCourseModulesAndLessons : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "course_modules",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    course_id = table.Column<Guid>(type: "uuid", nullable: false),
                    code = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                    title = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    purpose = table.Column<string>(type: "text", nullable: true),
                    estimated_minutes = table.Column<int>(type: "integer", nullable: true),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
                    is_required = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValue: "ACTIVE"),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_course_modules", x => x.id);
                    table.ForeignKey(
                        name: "fk_course_modules_courses_course_id",
                        column: x => x.course_id,
                        principalTable: "courses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.CheckConstraint("ck_course_modules_estimated_minutes",
                        "estimated_minutes IS NULL OR estimated_minutes >= 0");
                    table.CheckConstraint("ck_course_modules_status",
                        "status IN ('ACTIVE','ARCHIVED')");
                });

            migrationBuilder.CreateIndex(
                name: "ix_course_modules_course_sort_order",
                table: "course_modules",
                columns: new[] { "course_id", "sort_order" });

            migrationBuilder.CreateTable(
                name: "lessons",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    module_id = table.Column<Guid>(type: "uuid", nullable: false),
                    code = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                    title = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    lesson_type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValue: "TEXT"),
                    content_body = table.Column<string>(type: "text", nullable: true),
                    estimated_minutes = table.Column<int>(type: "integer", nullable: true),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
                    is_required = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    completion_rule = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "VIEW"),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValue: "ACTIVE"),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_lessons", x => x.id);
                    table.ForeignKey(
                        name: "fk_lessons_course_modules_module_id",
                        column: x => x.module_id,
                        principalTable: "course_modules",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.CheckConstraint("ck_lessons_type",
                        "lesson_type IN ('TEXT','VIDEO','CASE_STUDY','GUIDED_PRACTICE','WORKPLACE_SCENARIO','QUIZ','REFLECTION','ASSIGNMENT')");
                    table.CheckConstraint("ck_lessons_completion_rule",
                        "completion_rule IN ('VIEW','MANUAL_COMPLETE','PASS_CHECK','SUBMIT_ACTIVITY')");
                    table.CheckConstraint("ck_lessons_estimated_minutes",
                        "estimated_minutes IS NULL OR estimated_minutes >= 0");
                    table.CheckConstraint("ck_lessons_status",
                        "status IN ('ACTIVE','ARCHIVED')");
                });

            migrationBuilder.CreateIndex(
                name: "ix_lessons_module_sort_order",
                table: "lessons",
                columns: new[] { "module_id", "sort_order" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "lessons");
            migrationBuilder.DropTable(name: "course_modules");
        }
    }
}
