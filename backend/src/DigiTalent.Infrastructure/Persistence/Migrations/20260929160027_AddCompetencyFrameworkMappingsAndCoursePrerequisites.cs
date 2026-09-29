using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigiTalent.Infrastructure.Persistence.Migrations
{
    /// <summary>
    /// Tạo competency_frameworks, competency_framework_mappings, course_prerequisites theo SQL v2.3
    /// (căn cứ Thông tư 02/2025). Viết tay phần CreateTable: EF chỉ sinh FK khi bỏ ExcludeFromMigrations
    /// vì snapshot cũ đã chứa các bảng này ở dạng "excluded".
    /// </summary>
    public partial class AddCompetencyFrameworkMappingsAndCoursePrerequisites : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "competency_frameworks",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    code = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    version = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    name = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    authority = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    jurisdiction = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: true),
                    source_url = table.Column<string>(type: "text", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_competency_frameworks", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "competency_framework_mappings",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    competency_id = table.Column<Guid>(type: "uuid", nullable: false),
                    framework_id = table.Column<Guid>(type: "uuid", nullable: false),
                    source_area_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    source_code = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    source_name = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: true),
                    source_level_text = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    relationship = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    is_primary = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    mapping_note = table.Column<string>(type: "text", nullable: true),
                    source_url = table.Column<string>(type: "text", nullable: true),
                    reviewed_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    reviewed_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_competency_framework_mappings", x => x.id);
                    table.CheckConstraint("ck_competency_framework_mapping_relationship", "relationship IN ('DIRECT','STRONG_OVERLAP','PARTIAL_OVERLAP')");
                    table.ForeignKey(
                        name: "fk_competency_framework_mappings_competencies_competency_id",
                        column: x => x.competency_id,
                        principalTable: "competencies",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_competency_framework_mappings_competency_frameworks_framewo",
                        column: x => x.framework_id,
                        principalTable: "competency_frameworks",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_competency_framework_mappings_users_reviewed_by_user_id",
                        column: x => x.reviewed_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "course_prerequisites",
                columns: table => new
                {
                    course_id = table.Column<Guid>(type: "uuid", nullable: false),
                    prerequisite_course_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_course_prerequisites", x => new { x.course_id, x.prerequisite_course_id });
                    table.CheckConstraint("ck_course_prerequisite_not_self", "course_id <> prerequisite_course_id");
                    table.ForeignKey(
                        name: "fk_course_prerequisites_courses_course_id",
                        column: x => x.course_id,
                        principalTable: "courses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_course_prerequisites_courses_prerequisite_course_id",
                        column: x => x.prerequisite_course_id,
                        principalTable: "courses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "uq_competency_frameworks_code_version",
                table: "competency_frameworks",
                columns: new[] { "code", "version" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "uq_competency_framework_mapping",
                table: "competency_framework_mappings",
                columns: new[] { "competency_id", "framework_id", "source_code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_competency_framework_mappings_framework_id",
                table: "competency_framework_mappings",
                column: "framework_id");

            migrationBuilder.CreateIndex(
                name: "ix_competency_framework_mappings_reviewed_by_user_id",
                table: "competency_framework_mappings",
                column: "reviewed_by_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_course_prerequisites_prerequisite_course_id",
                table: "course_prerequisites",
                column: "prerequisite_course_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "competency_framework_mappings");
            migrationBuilder.DropTable(name: "course_prerequisites");
            migrationBuilder.DropTable(name: "competency_frameworks");
        }
    }
}
