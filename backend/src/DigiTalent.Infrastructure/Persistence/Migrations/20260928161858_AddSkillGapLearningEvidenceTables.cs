using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigiTalent.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddSkillGapLearningEvidenceTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "courses",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    organization_id = table.Column<Guid>(type: "uuid", nullable: false),
                    code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    version_no = table.Column<int>(type: "integer", nullable: false),
                    supersedes_course_id = table.Column<Guid>(type: "uuid", nullable: true),
                    title = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    short_name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    description = table.Column<string>(type: "text", nullable: true),
                    purpose = table.Column<string>(type: "text", nullable: true),
                    entry_level = table.Column<short>(type: "smallint", nullable: true),
                    estimated_duration_minutes = table.Column<int>(type: "integer", nullable: true),
                    certificate_enabled = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    certificate_validity_days = table.Column<int>(type: "integer", nullable: true),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValue: "DRAFT"),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    row_version = table.Column<long>(type: "bigint", nullable: false, defaultValue: 1L)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_courses", x => x.id);
                    table.CheckConstraint("ck_courses_certificate_validity_days", "certificate_validity_days IS NULL OR certificate_validity_days > 0");
                    table.CheckConstraint("ck_courses_duration", "estimated_duration_minutes IS NULL OR estimated_duration_minutes >= 0");
                    table.CheckConstraint("ck_courses_entry_level", "entry_level IS NULL OR entry_level BETWEEN 1 AND 3");
                    table.CheckConstraint("ck_courses_not_self_supersede", "supersedes_course_id IS NULL OR supersedes_course_id <> id");
                    table.CheckConstraint("ck_courses_row_version", "row_version > 0");
                    table.CheckConstraint("ck_courses_status", "status IN ('DRAFT','REVIEW','PUBLISHED','ARCHIVED')");
                    table.CheckConstraint("ck_courses_version", "version_no > 0");
                    table.ForeignKey(
                        name: "fk_courses_courses_supersedes_course_id",
                        column: x => x.supersedes_course_id,
                        principalTable: "courses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_courses_organizations_organization_id",
                        column: x => x.organization_id,
                        principalTable: "organizations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_courses_users_created_by_user_id",
                        column: x => x.created_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "notifications",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    recipient_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    title = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    message = table.Column<string>(type: "text", nullable: false),
                    related_entity_type = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                    related_entity_id = table.Column<Guid>(type: "uuid", nullable: true),
                    is_read = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    read_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_notifications", x => x.id);
                    table.CheckConstraint("ck_notifications_read_at", "(is_read = false AND read_at IS NULL) OR is_read = true");
                    table.ForeignKey(
                        name: "fk_notifications_users_recipient_user_id",
                        column: x => x.recipient_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "scoring_configs",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    organization_id = table.Column<Guid>(type: "uuid", nullable: false),
                    config_type = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    version = table.Column<int>(type: "integer", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_scoring_configs", x => x.id);
                    table.CheckConstraint("ck_scoring_configs_type", "config_type IN ('RECOMMENDATION_WEIGHTS','TRAINING_RISK','READINESS')");
                    table.CheckConstraint("ck_scoring_configs_version", "version > 0");
                    table.ForeignKey(
                        name: "fk_scoring_configs_organizations_organization_id",
                        column: x => x.organization_id,
                        principalTable: "organizations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_scoring_configs_users_created_by_user_id",
                        column: x => x.created_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "skill_gap_runs",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    employee_id = table.Column<Guid>(type: "uuid", nullable: false),
                    requirement_set_id = table.Column<Guid>(type: "uuid", nullable: false),
                    generated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    generated_by = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    gap_count = table.Column<int>(type: "integer", nullable: false),
                    calculation_version = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    summary_snapshot = table.Column<string>(type: "jsonb", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_skill_gap_runs", x => x.id);
                    table.CheckConstraint("ck_skill_gap_runs_gap_count", "gap_count >= 0");
                    table.CheckConstraint("ck_skill_gap_runs_generated_by", "generated_by IN ('SYSTEM','USER_REQUEST')");
                    table.ForeignKey(
                        name: "fk_skill_gap_runs_employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_skill_gap_runs_position_requirement_sets_requirement_set_id",
                        column: x => x.requirement_set_id,
                        principalTable: "position_requirement_sets",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "course_competencies",
                columns: table => new
                {
                    course_id = table.Column<Guid>(type: "uuid", nullable: false),
                    competency_id = table.Column<Guid>(type: "uuid", nullable: false),
                    target_level = table.Column<short>(type: "smallint", nullable: false),
                    coverage_type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    coverage_weight = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    note = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_course_competencies", x => new { x.course_id, x.competency_id });
                    table.CheckConstraint("ck_course_coverage_type", "coverage_type IN ('PRIMARY','SECONDARY','SUPPORTING')");
                    table.CheckConstraint("ck_course_coverage_weight", "coverage_weight IS NULL OR coverage_weight BETWEEN 0 AND 100");
                    table.CheckConstraint("ck_course_target_level", "target_level BETWEEN 1 AND 3");
                    table.ForeignKey(
                        name: "fk_course_competencies_competencies_competency_id",
                        column: x => x.competency_id,
                        principalTable: "competencies",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_course_competencies_courses_course_id",
                        column: x => x.course_id,
                        principalTable: "courses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "practical_task_templates",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    organization_id = table.Column<Guid>(type: "uuid", nullable: false),
                    related_course_id = table.Column<Guid>(type: "uuid", nullable: true),
                    title = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    expected_output = table.Column<string>(type: "text", nullable: false),
                    general_marking_criteria = table.Column<string>(type: "jsonb", nullable: true),
                    source_type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_practical_task_templates", x => x.id);
                    table.CheckConstraint("ck_practical_task_templates_source_type", "source_type IN ('MANUAL','AI_DRAFT')");
                    table.CheckConstraint("ck_practical_task_templates_status", "status IN ('DRAFT','ACTIVE','ARCHIVED')");
                    table.ForeignKey(
                        name: "fk_practical_task_templates_courses_related_course_id",
                        column: x => x.related_course_id,
                        principalTable: "courses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_practical_task_templates_organizations_organization_id",
                        column: x => x.organization_id,
                        principalTable: "organizations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_practical_task_templates_users_created_by_user_id",
                        column: x => x.created_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "scoring_config_items",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    scoring_config_id = table.Column<Guid>(type: "uuid", nullable: false),
                    component_code = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    weight = table.Column<decimal>(type: "numeric(6,4)", precision: 6, scale: 4, nullable: false),
                    min_value = table.Column<decimal>(type: "numeric(8,2)", precision: 8, scale: 2, nullable: true),
                    max_value = table.Column<decimal>(type: "numeric(8,2)", precision: 8, scale: 2, nullable: true),
                    notes = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_scoring_config_items", x => x.id);
                    table.CheckConstraint("ck_scoring_config_items_range", "max_value IS NULL OR min_value IS NULL OR max_value >= min_value");
                    table.ForeignKey(
                        name: "fk_scoring_config_items_scoring_configs_scoring_config_id",
                        column: x => x.scoring_config_id,
                        principalTable: "scoring_configs",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "course_assignments",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    course_id = table.Column<Guid>(type: "uuid", nullable: false),
                    employee_id = table.Column<Guid>(type: "uuid", nullable: false),
                    assignment_source = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    source_department_id = table.Column<Guid>(type: "uuid", nullable: true),
                    source_job_position_id = table.Column<Guid>(type: "uuid", nullable: true),
                    source_skill_gap_run_id = table.Column<Guid>(type: "uuid", nullable: true),
                    assigned_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    assigned_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    due_date = table.Column<DateOnly>(type: "date", nullable: true),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_course_assignments", x => x.id);
                    table.CheckConstraint("ck_course_assignments_source", "assignment_source IN ('MANUAL','SKILL_GAP','DEPARTMENT','POSITION')");
                    table.CheckConstraint("ck_course_assignments_status", "status IN ('ACTIVE','CANCELLED')");
                    table.ForeignKey(
                        name: "fk_course_assignments_courses_course_id",
                        column: x => x.course_id,
                        principalTable: "courses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_course_assignments_departments_source_department_id",
                        column: x => x.source_department_id,
                        principalTable: "departments",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_course_assignments_employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_course_assignments_job_positions_source_job_position_id",
                        column: x => x.source_job_position_id,
                        principalTable: "job_positions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_course_assignments_skill_gap_runs_source_skill_gap_run_id",
                        column: x => x.source_skill_gap_run_id,
                        principalTable: "skill_gap_runs",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_course_assignments_users_assigned_by_user_id",
                        column: x => x.assigned_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "skill_gap_items",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    skill_gap_run_id = table.Column<Guid>(type: "uuid", nullable: false),
                    competency_id = table.Column<Guid>(type: "uuid", nullable: false),
                    required_level = table.Column<short>(type: "smallint", nullable: false),
                    current_level = table.Column<short>(type: "smallint", nullable: true),
                    gap_steps = table.Column<short>(type: "smallint", nullable: false),
                    weight_percent = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    mandatory = table.Column<bool>(type: "boolean", nullable: false),
                    mandatory_multiplier = table.Column<decimal>(type: "numeric(4,2)", precision: 4, scale: 2, nullable: false, defaultValue: 1.00m),
                    priority_score = table.Column<decimal>(type: "numeric(8,2)", precision: 8, scale: 2, nullable: false),
                    severity = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_skill_gap_items", x => x.id);
                    table.CheckConstraint("ck_gap_current_level", "current_level IS NULL OR current_level BETWEEN 1 AND 3");
                    table.CheckConstraint("ck_gap_required_level", "required_level BETWEEN 1 AND 3");
                    table.CheckConstraint("ck_gap_steps_nonnegative", "gap_steps >= 0");
                    table.CheckConstraint("ck_skill_gap_items_multiplier", "mandatory_multiplier >= 0");
                    table.CheckConstraint("ck_skill_gap_items_severity", "severity IS NULL OR severity IN ('LOW','MEDIUM','HIGH')");
                    table.CheckConstraint("ck_skill_gap_items_weight", "weight_percent > 0 AND weight_percent <= 100");
                    table.ForeignKey(
                        name: "fk_skill_gap_items_competencies_competency_id",
                        column: x => x.competency_id,
                        principalTable: "competencies",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_skill_gap_items_skill_gap_runs_skill_gap_run_id",
                        column: x => x.skill_gap_run_id,
                        principalTable: "skill_gap_runs",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "task_assignments",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    task_template_id = table.Column<Guid>(type: "uuid", nullable: true),
                    employee_id = table.Column<Guid>(type: "uuid", nullable: false),
                    prompting_course_id = table.Column<Guid>(type: "uuid", nullable: true),
                    assigned_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    reviewer_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    assigned_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    due_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    title_snapshot = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    description_snapshot = table.Column<string>(type: "text", nullable: false),
                    expected_output_snapshot = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_task_assignments", x => x.id);
                    table.CheckConstraint("ck_task_assignments_status", "status IN ('ASSIGNED','SUBMITTED','NEEDS_REVISION','PASSED','FAILED','CANCELLED')");
                    table.ForeignKey(
                        name: "fk_task_assignments_courses_prompting_course_id",
                        column: x => x.prompting_course_id,
                        principalTable: "courses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_task_assignments_employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_task_assignments_practical_task_templates_task_template_id",
                        column: x => x.task_template_id,
                        principalTable: "practical_task_templates",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_task_assignments_users_assigned_by_user_id",
                        column: x => x.assigned_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_task_assignments_users_reviewer_user_id",
                        column: x => x.reviewer_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "enrollments",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    course_assignment_id = table.Column<Guid>(type: "uuid", nullable: true),
                    employee_id = table.Column<Guid>(type: "uuid", nullable: false),
                    course_id = table.Column<Guid>(type: "uuid", nullable: false),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    progress_percent = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false, defaultValue: 0m),
                    started_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    completed_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    due_date = table.Column<DateOnly>(type: "date", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_enrollments", x => x.id);
                    table.CheckConstraint("ck_enrollment_progress", "progress_percent BETWEEN 0 AND 100");
                    table.CheckConstraint("ck_enrollments_completion_time", "completed_at IS NULL OR started_at IS NULL OR completed_at >= started_at");
                    table.CheckConstraint("ck_enrollments_status", "status IN ('NOT_STARTED','IN_PROGRESS','READY_FOR_ASSESSMENT','COMPLETED','CANCELLED')");
                    table.ForeignKey(
                        name: "fk_enrollments_course_assignments_course_assignment_id",
                        column: x => x.course_assignment_id,
                        principalTable: "course_assignments",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_enrollments_courses_course_id",
                        column: x => x.course_id,
                        principalTable: "courses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_enrollments_employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "task_submissions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    task_assignment_id = table.Column<Guid>(type: "uuid", nullable: false),
                    version_no = table.Column<int>(type: "integer", nullable: false),
                    supersedes_submission_id = table.Column<Guid>(type: "uuid", nullable: true),
                    submission_note = table.Column<string>(type: "text", nullable: true),
                    submission_url = table.Column<string>(type: "text", nullable: true),
                    submitted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_task_submissions", x => x.id);
                    table.CheckConstraint("ck_task_submissions_not_self_supersede", "supersedes_submission_id IS NULL OR supersedes_submission_id <> id");
                    table.CheckConstraint("ck_task_submissions_status", "status IN ('SUBMITTED','UNDER_REVIEW','SUPERSEDED')");
                    table.CheckConstraint("ck_task_submissions_version", "version_no > 0");
                    table.ForeignKey(
                        name: "fk_task_submissions_task_assignments_task_assignment_id",
                        column: x => x.task_assignment_id,
                        principalTable: "task_assignments",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_task_submissions_task_submissions_supersedes_submission_id",
                        column: x => x.supersedes_submission_id,
                        principalTable: "task_submissions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "task_evaluations",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    task_submission_id = table.Column<Guid>(type: "uuid", nullable: false),
                    reviewer_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    overall_score = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    verdict = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    counts_as_evidence = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    feedback = table.Column<string>(type: "text", nullable: true),
                    evaluated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    finalization_key = table.Column<Guid>(type: "uuid", nullable: true),
                    row_version = table.Column<long>(type: "bigint", nullable: false, defaultValue: 1L),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_task_evaluations", x => x.id);
                    table.CheckConstraint("ck_task_evaluations_evidence_requires_pass", "NOT counts_as_evidence OR verdict = 'PASSED'");
                    table.CheckConstraint("ck_task_evaluations_row_version", "row_version > 0");
                    table.CheckConstraint("ck_task_evaluations_score", "overall_score IS NULL OR overall_score BETWEEN 0 AND 100");
                    table.CheckConstraint("ck_task_evaluations_verdict", "verdict IN ('PASSED','NEEDS_REVISION','FAILED')");
                    table.ForeignKey(
                        name: "fk_task_evaluations_task_submissions_task_submission_id",
                        column: x => x.task_submission_id,
                        principalTable: "task_submissions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_task_evaluations_users_reviewer_user_id",
                        column: x => x.reviewer_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "competency_evaluation_results",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    task_evaluation_id = table.Column<Guid>(type: "uuid", nullable: false),
                    competency_id = table.Column<Guid>(type: "uuid", nullable: false),
                    target_level = table.Column<short>(type: "smallint", nullable: false),
                    score = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    verdict = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    level_confirming = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    confirmed_level = table.Column<short>(type: "smallint", nullable: true),
                    feedback = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_competency_evaluation_results", x => x.id);
                    table.CheckConstraint("ck_competency_evaluation_results_confirm_rule", "NOT level_confirming OR (verdict = 'PASSED' AND confirmed_level IS NOT NULL)");
                    table.CheckConstraint("ck_competency_evaluation_results_confirmed_level", "confirmed_level IS NULL OR confirmed_level BETWEEN 1 AND 3");
                    table.CheckConstraint("ck_competency_evaluation_results_target_level", "target_level BETWEEN 1 AND 3");
                    table.CheckConstraint("ck_competency_evaluation_results_verdict", "verdict IN ('PASSED','NEEDS_REVISION','FAILED')");
                    table.ForeignKey(
                        name: "fk_competency_evaluation_results_competencies_competency_id",
                        column: x => x.competency_id,
                        principalTable: "competencies",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_competency_evaluation_results_task_evaluations_task_evaluat",
                        column: x => x.task_evaluation_id,
                        principalTable: "task_evaluations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "competency_evidences",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    employee_id = table.Column<Guid>(type: "uuid", nullable: false),
                    competency_id = table.Column<Guid>(type: "uuid", nullable: false),
                    competency_evaluation_result_id = table.Column<Guid>(type: "uuid", nullable: true),
                    source_type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    is_level_confirming = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    confirmed_level = table.Column<short>(type: "smallint", nullable: true),
                    score = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    review_note = table.Column<string>(type: "text", nullable: true),
                    confirmed_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    confirmed_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    supersedes_evidence_id = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_competency_evidences", x => x.id);
                    table.CheckConstraint("ck_competency_evidences_confirmed_level", "confirmed_level IS NULL OR confirmed_level BETWEEN 1 AND 3");
                    table.CheckConstraint("ck_competency_evidences_level_confirming_rule", "NOT is_level_confirming OR (status = 'CONFIRMED' AND confirmed_level IS NOT NULL AND confirmed_at IS NOT NULL AND confirmed_by_user_id IS NOT NULL)");
                    table.CheckConstraint("ck_competency_evidences_not_self_supersede", "supersedes_evidence_id IS NULL OR supersedes_evidence_id <> id");
                    table.CheckConstraint("ck_competency_evidences_practical_task_result", "source_type <> 'PRACTICAL_TASK' OR competency_evaluation_result_id IS NOT NULL");
                    table.CheckConstraint("ck_competency_evidences_source_type", "source_type IN ('PRACTICAL_TASK','MANUAL_OVERRIDE','MIGRATION')");
                    table.CheckConstraint("ck_competency_evidences_status", "status IN ('PENDING','CONFIRMED','REJECTED','SUPERSEDED')");
                    table.ForeignKey(
                        name: "fk_competency_evidences_competencies_competency_id",
                        column: x => x.competency_id,
                        principalTable: "competencies",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_competency_evidences_competency_evaluation_results_competen",
                        column: x => x.competency_evaluation_result_id,
                        principalTable: "competency_evaluation_results",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_competency_evidences_competency_evidences_supersedes_eviden",
                        column: x => x.supersedes_evidence_id,
                        principalTable: "competency_evidences",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_competency_evidences_employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_competency_evidences_users_confirmed_by_user_id",
                        column: x => x.confirmed_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "employee_competency_profiles",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    employee_id = table.Column<Guid>(type: "uuid", nullable: false),
                    competency_id = table.Column<Guid>(type: "uuid", nullable: false),
                    confirmed_level = table.Column<short>(type: "smallint", nullable: false),
                    latest_confirming_evidence_id = table.Column<Guid>(type: "uuid", nullable: true),
                    confirmed_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    row_version = table.Column<long>(type: "bigint", nullable: false, defaultValue: 1L),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_employee_competency_profiles", x => x.id);
                    table.CheckConstraint("ck_employee_competency_profiles_row_version", "row_version > 0");
                    table.CheckConstraint("ck_profile_confirmed_level", "confirmed_level BETWEEN 1 AND 3");
                    table.ForeignKey(
                        name: "fk_employee_competency_profiles_competencies_competency_id",
                        column: x => x.competency_id,
                        principalTable: "competencies",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_employee_competency_profiles_competency_evidences_latest_co",
                        column: x => x.latest_confirming_evidence_id,
                        principalTable: "competency_evidences",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_employee_competency_profiles_employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_competency_evaluation_results_competency_id",
                table: "competency_evaluation_results",
                column: "competency_id");

            migrationBuilder.CreateIndex(
                name: "uq_competency_evaluation_results_eval_competency",
                table: "competency_evaluation_results",
                columns: new[] { "task_evaluation_id", "competency_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_competency_evidences_competency_evaluation_result_id",
                table: "competency_evidences",
                column: "competency_evaluation_result_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_competency_evidences_competency_id",
                table: "competency_evidences",
                column: "competency_id");

            migrationBuilder.CreateIndex(
                name: "ix_competency_evidences_confirmed_by_user_id",
                table: "competency_evidences",
                column: "confirmed_by_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_competency_evidences_employee_competency_status_created",
                table: "competency_evidences",
                columns: new[] { "employee_id", "competency_id", "status", "created_at" },
                descending: new[] { false, false, false, true });

            migrationBuilder.CreateIndex(
                name: "ix_competency_evidences_supersedes_evidence_id",
                table: "competency_evidences",
                column: "supersedes_evidence_id");

            migrationBuilder.CreateIndex(
                name: "ix_course_assignments_assigned_by_user_id",
                table: "course_assignments",
                column: "assigned_by_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_course_assignments_course_id",
                table: "course_assignments",
                column: "course_id");

            migrationBuilder.CreateIndex(
                name: "ix_course_assignments_employee",
                table: "course_assignments",
                columns: new[] { "employee_id", "status" });

            migrationBuilder.CreateIndex(
                name: "ix_course_assignments_source_department_id",
                table: "course_assignments",
                column: "source_department_id");

            migrationBuilder.CreateIndex(
                name: "ix_course_assignments_source_job_position_id",
                table: "course_assignments",
                column: "source_job_position_id");

            migrationBuilder.CreateIndex(
                name: "ix_course_assignments_source_skill_gap_run_id",
                table: "course_assignments",
                column: "source_skill_gap_run_id");

            migrationBuilder.CreateIndex(
                name: "ix_course_competencies_competency_target_level",
                table: "course_competencies",
                columns: new[] { "competency_id", "target_level" });

            migrationBuilder.CreateIndex(
                name: "ix_courses_created_by_user_id",
                table: "courses",
                column: "created_by_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_courses_supersedes_course_id",
                table: "courses",
                column: "supersedes_course_id");

            migrationBuilder.CreateIndex(
                name: "uq_courses_org_code_version",
                table: "courses",
                columns: new[] { "organization_id", "code", "version_no" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_employee_competency_profiles_competency_id",
                table: "employee_competency_profiles",
                column: "competency_id");

            migrationBuilder.CreateIndex(
                name: "ix_employee_competency_profiles_latest_confirming_evidence_id",
                table: "employee_competency_profiles",
                column: "latest_confirming_evidence_id");

            migrationBuilder.CreateIndex(
                name: "uq_employee_competency_profiles_employee_competency",
                table: "employee_competency_profiles",
                columns: new[] { "employee_id", "competency_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_enrollments_course_assignment_id",
                table: "enrollments",
                column: "course_assignment_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_enrollments_course_id",
                table: "enrollments",
                column: "course_id");

            migrationBuilder.CreateIndex(
                name: "ix_enrollments_employee_status",
                table: "enrollments",
                columns: new[] { "employee_id", "status" });

            migrationBuilder.CreateIndex(
                name: "ux_enrollments_one_active",
                table: "enrollments",
                columns: new[] { "employee_id", "course_id" },
                unique: true,
                filter: "status IN ('NOT_STARTED','IN_PROGRESS','READY_FOR_ASSESSMENT')");

            migrationBuilder.CreateIndex(
                name: "ix_notifications_recipient_unread",
                table: "notifications",
                columns: new[] { "recipient_user_id", "is_read", "created_at" },
                descending: new[] { false, false, true });

            migrationBuilder.CreateIndex(
                name: "ix_practical_task_templates_created_by_user_id",
                table: "practical_task_templates",
                column: "created_by_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_practical_task_templates_organization_id",
                table: "practical_task_templates",
                column: "organization_id");

            migrationBuilder.CreateIndex(
                name: "ix_practical_task_templates_related_course_id",
                table: "practical_task_templates",
                column: "related_course_id");

            migrationBuilder.CreateIndex(
                name: "uq_scoring_config_items_config_component",
                table: "scoring_config_items",
                columns: new[] { "scoring_config_id", "component_code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_scoring_configs_created_by_user_id",
                table: "scoring_configs",
                column: "created_by_user_id");

            migrationBuilder.CreateIndex(
                name: "uq_scoring_configs_org_type_version",
                table: "scoring_configs",
                columns: new[] { "organization_id", "config_type", "version" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ux_scoring_configs_active",
                table: "scoring_configs",
                columns: new[] { "organization_id", "config_type" },
                unique: true,
                filter: "is_active = true");

            migrationBuilder.CreateIndex(
                name: "ix_skill_gap_items_competency_id",
                table: "skill_gap_items",
                column: "competency_id");

            migrationBuilder.CreateIndex(
                name: "uq_skill_gap_items_run_competency",
                table: "skill_gap_items",
                columns: new[] { "skill_gap_run_id", "competency_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_skill_gap_runs_employee_generated_desc",
                table: "skill_gap_runs",
                columns: new[] { "employee_id", "generated_at" },
                descending: new[] { false, true });

            migrationBuilder.CreateIndex(
                name: "ix_skill_gap_runs_requirement_set_id",
                table: "skill_gap_runs",
                column: "requirement_set_id");

            migrationBuilder.CreateIndex(
                name: "ix_task_assignments_assigned_by_user_id",
                table: "task_assignments",
                column: "assigned_by_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_task_assignments_employee_status",
                table: "task_assignments",
                columns: new[] { "employee_id", "status" });

            migrationBuilder.CreateIndex(
                name: "ix_task_assignments_prompting_course_id",
                table: "task_assignments",
                column: "prompting_course_id");

            migrationBuilder.CreateIndex(
                name: "ix_task_assignments_reviewer_status_due",
                table: "task_assignments",
                columns: new[] { "reviewer_user_id", "status", "due_at" });

            migrationBuilder.CreateIndex(
                name: "ix_task_assignments_task_template_id",
                table: "task_assignments",
                column: "task_template_id");

            migrationBuilder.CreateIndex(
                name: "ix_task_evaluations_finalization_key",
                table: "task_evaluations",
                column: "finalization_key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_task_evaluations_reviewer_user_id",
                table: "task_evaluations",
                column: "reviewer_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_task_evaluations_task_submission_id",
                table: "task_evaluations",
                column: "task_submission_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_task_submissions_assignment",
                table: "task_submissions",
                columns: new[] { "task_assignment_id", "version_no" },
                descending: new[] { false, true });

            migrationBuilder.CreateIndex(
                name: "ix_task_submissions_supersedes_submission_id",
                table: "task_submissions",
                column: "supersedes_submission_id");

            migrationBuilder.CreateIndex(
                name: "uq_task_submissions_assignment_version",
                table: "task_submissions",
                columns: new[] { "task_assignment_id", "version_no" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "course_competencies");

            migrationBuilder.DropTable(
                name: "employee_competency_profiles");

            migrationBuilder.DropTable(
                name: "enrollments");

            migrationBuilder.DropTable(
                name: "notifications");

            migrationBuilder.DropTable(
                name: "scoring_config_items");

            migrationBuilder.DropTable(
                name: "skill_gap_items");

            migrationBuilder.DropTable(
                name: "competency_evidences");

            migrationBuilder.DropTable(
                name: "course_assignments");

            migrationBuilder.DropTable(
                name: "scoring_configs");

            migrationBuilder.DropTable(
                name: "competency_evaluation_results");

            migrationBuilder.DropTable(
                name: "skill_gap_runs");

            migrationBuilder.DropTable(
                name: "task_evaluations");

            migrationBuilder.DropTable(
                name: "task_submissions");

            migrationBuilder.DropTable(
                name: "task_assignments");

            migrationBuilder.DropTable(
                name: "practical_task_templates");

            migrationBuilder.DropTable(
                name: "courses");
        }
    }
}
