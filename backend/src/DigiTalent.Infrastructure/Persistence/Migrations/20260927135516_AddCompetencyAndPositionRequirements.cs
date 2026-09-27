using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigiTalent.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddCompetencyAndPositionRequirements : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "competency_categories",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    organization_id = table.Column<Guid>(type: "uuid", nullable: false),
                    code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    name = table.Column<string>(type: "character varying(180)", maxLength: 180, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    sort_order = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_competency_categories", x => x.id);
                    table.CheckConstraint("ck_competency_categories_status", "status IN ('ACTIVE','INACTIVE','ARCHIVED')");
                    table.ForeignKey(
                        name: "fk_competency_categories_organizations_organization_id",
                        column: x => x.organization_id,
                        principalTable: "organizations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "position_requirement_sets",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    job_position_id = table.Column<Guid>(type: "uuid", nullable: false),
                    version_no = table.Column<int>(type: "integer", nullable: false),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    effective_from = table.Column<DateOnly>(type: "date", nullable: true),
                    effective_to = table.Column<DateOnly>(type: "date", nullable: true),
                    review_date = table.Column<DateOnly>(type: "date", nullable: true),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    activated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    activated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    row_version = table.Column<long>(type: "bigint", nullable: false, defaultValue: 1L),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_position_requirement_sets", x => x.id);
                    table.CheckConstraint("ck_position_requirement_sets_dates", "effective_to IS NULL OR effective_from IS NULL OR effective_to >= effective_from");
                    table.CheckConstraint("ck_position_requirement_sets_row_version", "row_version > 0");
                    table.CheckConstraint("ck_position_requirement_sets_status", "status IN ('DRAFT','ACTIVE','ARCHIVED')");
                    table.CheckConstraint("ck_position_requirement_sets_version", "version_no > 0");
                    table.ForeignKey(
                        name: "fk_position_requirement_sets_job_positions_job_position_id",
                        column: x => x.job_position_id,
                        principalTable: "job_positions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_position_requirement_sets_users_activated_by_user_id",
                        column: x => x.activated_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_position_requirement_sets_users_created_by_user_id",
                        column: x => x.created_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "competencies",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    category_id = table.Column<Guid>(type: "uuid", nullable: false),
                    code = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    competency_type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_competencies", x => x.id);
                    table.CheckConstraint("ck_competencies_status", "status IN ('DRAFT','ACTIVE','ARCHIVED')");
                    table.CheckConstraint("ck_competencies_type", "competency_type IN ('CORE_DIGITAL','PROFESSIONAL','INTERNAL','BEHAVIOURAL')");
                    table.ForeignKey(
                        name: "fk_competencies_competency_categories_category_id",
                        column: x => x.category_id,
                        principalTable: "competency_categories",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "competency_level_criteria",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    competency_id = table.Column<Guid>(type: "uuid", nullable: false),
                    level = table.Column<int>(type: "integer", nullable: false),
                    indicator_code = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    behavior_indicator = table.Column<string>(type: "text", nullable: false),
                    assessment_guidance = table.Column<string>(type: "text", nullable: true),
                    evidence_guidance = table.Column<string>(type: "text", nullable: true),
                    source_note = table.Column<string>(type: "text", nullable: true),
                    sort_order = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_competency_level_criteria", x => x.id);
                    table.CheckConstraint("ck_competency_level_criteria_level", "level BETWEEN 1 AND 3");
                    table.ForeignKey(
                        name: "fk_competency_level_criteria_competencies_competency_id",
                        column: x => x.competency_id,
                        principalTable: "competencies",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "position_requirement_items",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    requirement_set_id = table.Column<Guid>(type: "uuid", nullable: false),
                    competency_id = table.Column<Guid>(type: "uuid", nullable: false),
                    required_level = table.Column<int>(type: "integer", nullable: false),
                    weight_percent = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    is_mandatory = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    requires_practical_evidence = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    note = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_position_requirement_items", x => x.id);
                    table.CheckConstraint("ck_position_required_level", "required_level BETWEEN 1 AND 3");
                    table.CheckConstraint("ck_position_weight", "weight_percent > 0 AND weight_percent <= 100");
                    table.ForeignKey(
                        name: "fk_position_requirement_items_competencies_competency_id",
                        column: x => x.competency_id,
                        principalTable: "competencies",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_position_requirement_items_position_requirement_sets_requir",
                        column: x => x.requirement_set_id,
                        principalTable: "position_requirement_sets",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "uq_competencies_category_code",
                table: "competencies",
                columns: new[] { "category_id", "code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "uq_competency_categories_org_code",
                table: "competency_categories",
                columns: new[] { "organization_id", "code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "uq_competency_level_criteria",
                table: "competency_level_criteria",
                columns: new[] { "competency_id", "level", "indicator_code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_position_requirement_items_competency",
                table: "position_requirement_items",
                column: "competency_id");

            migrationBuilder.CreateIndex(
                name: "uq_position_requirement_items_set_competency",
                table: "position_requirement_items",
                columns: new[] { "requirement_set_id", "competency_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_position_requirement_sets_activated_by_user_id",
                table: "position_requirement_sets",
                column: "activated_by_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_position_requirement_sets_created_by_user_id",
                table: "position_requirement_sets",
                column: "created_by_user_id");

            migrationBuilder.CreateIndex(
                name: "uq_position_requirement_sets_position_version",
                table: "position_requirement_sets",
                columns: new[] { "job_position_id", "version_no" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ux_requirement_sets_one_active",
                table: "position_requirement_sets",
                column: "job_position_id",
                unique: true,
                filter: "status = 'ACTIVE'");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "competency_level_criteria");

            migrationBuilder.DropTable(
                name: "position_requirement_items");

            migrationBuilder.DropTable(
                name: "competencies");

            migrationBuilder.DropTable(
                name: "position_requirement_sets");

            migrationBuilder.DropTable(
                name: "competency_categories");
        }
    }
}
