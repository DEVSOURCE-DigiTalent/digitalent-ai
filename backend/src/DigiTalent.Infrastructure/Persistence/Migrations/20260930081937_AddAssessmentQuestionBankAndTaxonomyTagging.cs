using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigiTalent.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddAssessmentQuestionBankAndTaxonomyTagging : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "assessment_answers",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    attempt_id = table.Column<Guid>(type: "uuid", nullable: false),
                    question_id = table.Column<Guid>(type: "uuid", nullable: false),
                    selected_option_id = table.Column<Guid>(type: "uuid", nullable: true),
                    answer_text = table.Column<string>(type: "text", nullable: true),
                    is_correct = table.Column<bool>(type: "boolean", nullable: true),
                    points_awarded = table.Column<decimal>(type: "numeric(7,2)", precision: 7, scale: 2, nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_assessment_answers", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "assessment_attempts",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    assessment_id = table.Column<Guid>(type: "uuid", nullable: false),
                    enrollment_id = table.Column<Guid>(type: "uuid", nullable: false),
                    attempt_no = table.Column<int>(type: "integer", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    started_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    submitted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    scored_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    score = table.Column<decimal>(type: "numeric(6,2)", precision: 6, scale: 2, nullable: true),
                    passed = table.Column<bool>(type: "boolean", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_assessment_attempts", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "assessment_questions",
                columns: table => new
                {
                    assessment_id = table.Column<Guid>(type: "uuid", nullable: false),
                    question_id = table.Column<Guid>(type: "uuid", nullable: false),
                    points = table.Column<decimal>(type: "numeric(7,2)", precision: 7, scale: 2, nullable: false),
                    sort_order = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_assessment_questions", x => new { x.assessment_id, x.question_id });
                });

            migrationBuilder.CreateTable(
                name: "assessments",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    course_id = table.Column<Guid>(type: "uuid", nullable: false),
                    code = table.Column<string>(type: "text", nullable: false),
                    version_no = table.Column<int>(type: "integer", nullable: false),
                    supersedes_assessment_id = table.Column<Guid>(type: "uuid", nullable: true),
                    title = table.Column<string>(type: "text", nullable: false),
                    assessment_type = table.Column<string>(type: "text", nullable: false),
                    is_final = table.Column<bool>(type: "boolean", nullable: false),
                    time_limit_minutes = table.Column<int>(type: "integer", nullable: true),
                    max_attempts = table.Column<int>(type: "integer", nullable: true),
                    passing_score = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    row_version = table.Column<long>(type: "bigint", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_assessments", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "assigned_task_targets",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    task_assignment_id = table.Column<Guid>(type: "uuid", nullable: false),
                    competency_id = table.Column<Guid>(type: "uuid", nullable: false),
                    target_level = table.Column<short>(type: "smallint", nullable: false),
                    rubric_snapshot = table.Column<string>(type: "jsonb", nullable: true),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_assigned_task_targets", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "certificate_templates",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    organization_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    version_no = table.Column<int>(type: "integer", nullable: false),
                    template_html = table.Column<string>(type: "text", nullable: false),
                    background_file_object_id = table.Column<Guid>(type: "uuid", nullable: true),
                    status = table.Column<string>(type: "text", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_certificate_templates", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "certificate_verification_logs",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    certificate_id = table.Column<Guid>(type: "uuid", nullable: true),
                    certificate_code = table.Column<string>(type: "text", nullable: false),
                    result_status = table.Column<string>(type: "text", nullable: false),
                    ip_hash = table.Column<string>(type: "text", nullable: true),
                    user_agent = table.Column<string>(type: "text", nullable: true),
                    verified_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_certificate_verification_logs", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "certificates",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    employee_id = table.Column<Guid>(type: "uuid", nullable: false),
                    enrollment_id = table.Column<Guid>(type: "uuid", nullable: false),
                    assessment_attempt_id = table.Column<Guid>(type: "uuid", nullable: false),
                    certificate_template_id = table.Column<Guid>(type: "uuid", nullable: false),
                    certificate_code = table.Column<string>(type: "text", nullable: false),
                    holder_name_snapshot = table.Column<string>(type: "text", nullable: false),
                    course_title_snapshot = table.Column<string>(type: "text", nullable: false),
                    primary_competency_snapshot = table.Column<string>(type: "text", nullable: true),
                    issued_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    expires_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    status = table.Column<string>(type: "text", nullable: false),
                    pdf_file_object_id = table.Column<Guid>(type: "uuid", nullable: true),
                    revoked_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    revoked_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    revocation_reason = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_certificates", x => x.id);
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
                    verdict = table.Column<string>(type: "text", nullable: false),
                    level_confirming = table.Column<bool>(type: "boolean", nullable: false),
                    confirmed_level = table.Column<short>(type: "smallint", nullable: true),
                    feedback = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_competency_evaluation_results", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "competency_evidences",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    employee_id = table.Column<Guid>(type: "uuid", nullable: false),
                    competency_id = table.Column<Guid>(type: "uuid", nullable: false),
                    competency_evaluation_result_id = table.Column<Guid>(type: "uuid", nullable: true),
                    source_type = table.Column<string>(type: "text", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    is_level_confirming = table.Column<bool>(type: "boolean", nullable: false),
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
                });

            migrationBuilder.CreateTable(
                name: "competency_framework_mappings",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    competency_id = table.Column<Guid>(type: "uuid", nullable: false),
                    framework_id = table.Column<Guid>(type: "uuid", nullable: false),
                    source_area_code = table.Column<string>(type: "text", nullable: true),
                    source_code = table.Column<string>(type: "text", nullable: false),
                    source_name = table.Column<string>(type: "text", nullable: true),
                    source_level_text = table.Column<string>(type: "text", nullable: true),
                    relationship = table.Column<string>(type: "text", nullable: false),
                    is_primary = table.Column<bool>(type: "boolean", nullable: false),
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
                });

            migrationBuilder.CreateTable(
                name: "competency_frameworks",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    code = table.Column<string>(type: "text", nullable: false),
                    version = table.Column<string>(type: "text", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    authority = table.Column<string>(type: "text", nullable: true),
                    jurisdiction = table.Column<string>(type: "text", nullable: true),
                    source_url = table.Column<string>(type: "text", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_competency_frameworks", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "course_assignments",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    course_id = table.Column<Guid>(type: "uuid", nullable: false),
                    employee_id = table.Column<Guid>(type: "uuid", nullable: false),
                    assignment_source = table.Column<string>(type: "text", nullable: false),
                    source_department_id = table.Column<Guid>(type: "uuid", nullable: true),
                    source_job_position_id = table.Column<Guid>(type: "uuid", nullable: true),
                    source_skill_gap_run_id = table.Column<Guid>(type: "uuid", nullable: true),
                    assigned_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    assigned_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    due_date = table.Column<DateOnly>(type: "date", nullable: true),
                    status = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_course_assignments", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "course_competencies",
                columns: table => new
                {
                    course_id = table.Column<Guid>(type: "uuid", nullable: false),
                    competency_id = table.Column<Guid>(type: "uuid", nullable: false),
                    target_level = table.Column<short>(type: "smallint", nullable: false),
                    coverage_type = table.Column<string>(type: "text", nullable: false),
                    coverage_weight = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    note = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_course_competencies", x => new { x.course_id, x.competency_id });
                });

            migrationBuilder.CreateTable(
                name: "course_learning_outcomes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    course_id = table.Column<Guid>(type: "uuid", nullable: false),
                    code = table.Column<string>(type: "text", nullable: false),
                    competency_id = table.Column<Guid>(type: "uuid", nullable: false),
                    target_level = table.Column<short>(type: "smallint", nullable: false),
                    outcome_type = table.Column<string>(type: "text", nullable: false),
                    statement = table.Column<string>(type: "text", nullable: false),
                    source_type = table.Column<string>(type: "text", nullable: false),
                    source_ref = table.Column<string>(type: "text", nullable: true),
                    assessment_method = table.Column<string>(type: "text", nullable: true),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_course_learning_outcomes", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "course_modules",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    course_id = table.Column<Guid>(type: "uuid", nullable: false),
                    code = table.Column<string>(type: "text", nullable: true),
                    title = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    purpose = table.Column<string>(type: "text", nullable: true),
                    estimated_minutes = table.Column<int>(type: "integer", nullable: true),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
                    is_required = table.Column<bool>(type: "boolean", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_course_modules", x => x.id);
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
                });

            migrationBuilder.CreateTable(
                name: "courses",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    organization_id = table.Column<Guid>(type: "uuid", nullable: false),
                    code = table.Column<string>(type: "text", nullable: false),
                    version_no = table.Column<int>(type: "integer", nullable: false),
                    supersedes_course_id = table.Column<Guid>(type: "uuid", nullable: true),
                    title = table.Column<string>(type: "text", nullable: false),
                    short_name = table.Column<string>(type: "text", nullable: true),
                    description = table.Column<string>(type: "text", nullable: true),
                    purpose = table.Column<string>(type: "text", nullable: true),
                    entry_level = table.Column<short>(type: "smallint", nullable: true),
                    estimated_duration_minutes = table.Column<int>(type: "integer", nullable: true),
                    certificate_enabled = table.Column<bool>(type: "boolean", nullable: false),
                    certificate_validity_days = table.Column<int>(type: "integer", nullable: true),
                    status = table.Column<string>(type: "text", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    row_version = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_courses", x => x.id);
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
                    row_version = table.Column<long>(type: "bigint", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_employee_competency_profiles", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "enrollments",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    course_assignment_id = table.Column<Guid>(type: "uuid", nullable: true),
                    employee_id = table.Column<Guid>(type: "uuid", nullable: false),
                    course_id = table.Column<Guid>(type: "uuid", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    progress_percent = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    started_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    completed_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    due_date = table.Column<DateOnly>(type: "date", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_enrollments", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "file_objects",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    organization_id = table.Column<Guid>(type: "uuid", nullable: true),
                    bucket = table.Column<string>(type: "text", nullable: false),
                    object_key = table.Column<string>(type: "text", nullable: false),
                    original_name = table.Column<string>(type: "text", nullable: false),
                    mime_type = table.Column<string>(type: "text", nullable: true),
                    size_bytes = table.Column<long>(type: "bigint", nullable: false),
                    checksum = table.Column<string>(type: "text", nullable: true),
                    access_level = table.Column<string>(type: "text", nullable: false),
                    uploaded_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_file_objects", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "learning_materials",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    lesson_id = table.Column<Guid>(type: "uuid", nullable: false),
                    title = table.Column<string>(type: "text", nullable: false),
                    material_type = table.Column<string>(type: "text", nullable: false),
                    file_object_id = table.Column<Guid>(type: "uuid", nullable: true),
                    external_url = table.Column<string>(type: "text", nullable: true),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
                    is_required = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_learning_materials", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "lesson_learning_outcomes",
                columns: table => new
                {
                    lesson_id = table.Column<Guid>(type: "uuid", nullable: false),
                    learning_outcome_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_lesson_learning_outcomes", x => new { x.lesson_id, x.learning_outcome_id });
                });

            migrationBuilder.CreateTable(
                name: "lesson_progress",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    enrollment_id = table.Column<Guid>(type: "uuid", nullable: false),
                    lesson_id = table.Column<Guid>(type: "uuid", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    progress_percent = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    last_accessed_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    completed_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_lesson_progress", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "lessons",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    module_id = table.Column<Guid>(type: "uuid", nullable: false),
                    code = table.Column<string>(type: "text", nullable: true),
                    title = table.Column<string>(type: "text", nullable: false),
                    lesson_type = table.Column<string>(type: "text", nullable: false),
                    content_body = table.Column<string>(type: "text", nullable: true),
                    estimated_minutes = table.Column<int>(type: "integer", nullable: true),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
                    is_required = table.Column<bool>(type: "boolean", nullable: false),
                    completion_rule = table.Column<string>(type: "text", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_lessons", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "notifications",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    recipient_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    type = table.Column<string>(type: "text", nullable: false),
                    title = table.Column<string>(type: "text", nullable: false),
                    message = table.Column<string>(type: "text", nullable: false),
                    related_entity_type = table.Column<string>(type: "text", nullable: true),
                    related_entity_id = table.Column<Guid>(type: "uuid", nullable: true),
                    is_read = table.Column<bool>(type: "boolean", nullable: false),
                    read_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_notifications", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "practical_task_targets",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    task_template_id = table.Column<Guid>(type: "uuid", nullable: false),
                    competency_id = table.Column<Guid>(type: "uuid", nullable: false),
                    target_level = table.Column<short>(type: "smallint", nullable: false),
                    rubric_criteria = table.Column<string>(type: "jsonb", nullable: true),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_practical_task_targets", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "practical_task_templates",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    organization_id = table.Column<Guid>(type: "uuid", nullable: false),
                    related_course_id = table.Column<Guid>(type: "uuid", nullable: true),
                    title = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    expected_output = table.Column<string>(type: "text", nullable: false),
                    general_marking_criteria = table.Column<string>(type: "jsonb", nullable: true),
                    source_type = table.Column<string>(type: "text", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_practical_task_templates", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "question_banks",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    organization_id = table.Column<Guid>(type: "uuid", nullable: false),
                    title = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    owner_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    status = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_question_banks", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "question_options",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    question_id = table.Column<Guid>(type: "uuid", nullable: false),
                    content = table.Column<string>(type: "text", nullable: false),
                    is_correct = table.Column<bool>(type: "boolean", nullable: false),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_question_options", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "question_tags",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    organization_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    category = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_question_tags", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "questions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    bank_id = table.Column<Guid>(type: "uuid", nullable: false),
                    competency_id = table.Column<Guid>(type: "uuid", nullable: true),
                    question_type = table.Column<string>(type: "text", nullable: false),
                    difficulty = table.Column<string>(type: "text", nullable: true),
                    content = table.Column<string>(type: "text", nullable: false),
                    explanation = table.Column<string>(type: "text", nullable: true),
                    ai_generated_flag = table.Column<bool>(type: "boolean", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_questions", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "readiness_scores",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    employee_id = table.Column<Guid>(type: "uuid", nullable: false),
                    job_position_id = table.Column<Guid>(type: "uuid", nullable: false),
                    requirement_set_id = table.Column<Guid>(type: "uuid", nullable: true),
                    competency_score = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    certificate_score = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    learning_progress_score = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    compliance_score = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    task_performance_score = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    total_score = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    readiness_level = table.Column<string>(type: "text", nullable: false),
                    scoring_config_id = table.Column<Guid>(type: "uuid", nullable: true),
                    generated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    snapshot_json = table.Column<string>(type: "jsonb", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_readiness_scores", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "scoring_config_items",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    scoring_config_id = table.Column<Guid>(type: "uuid", nullable: false),
                    component_code = table.Column<string>(type: "text", nullable: false),
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
                });

            migrationBuilder.CreateTable(
                name: "scoring_configs",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    organization_id = table.Column<Guid>(type: "uuid", nullable: false),
                    config_type = table.Column<string>(type: "text", nullable: false),
                    version = table.Column<int>(type: "integer", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_scoring_configs", x => x.id);
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
                    mandatory_multiplier = table.Column<decimal>(type: "numeric(4,2)", precision: 4, scale: 2, nullable: false),
                    priority_score = table.Column<decimal>(type: "numeric(8,2)", precision: 8, scale: 2, nullable: false),
                    severity = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_skill_gap_items", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "skill_gap_runs",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    employee_id = table.Column<Guid>(type: "uuid", nullable: false),
                    requirement_set_id = table.Column<Guid>(type: "uuid", nullable: false),
                    generated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    generated_by = table.Column<string>(type: "text", nullable: false),
                    gap_count = table.Column<int>(type: "integer", nullable: false),
                    calculation_version = table.Column<string>(type: "text", nullable: false),
                    summary_snapshot = table.Column<string>(type: "jsonb", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_skill_gap_runs", x => x.id);
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
                    status = table.Column<string>(type: "text", nullable: false),
                    title_snapshot = table.Column<string>(type: "text", nullable: false),
                    description_snapshot = table.Column<string>(type: "text", nullable: false),
                    expected_output_snapshot = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_task_assignments", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "task_evaluations",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    task_submission_id = table.Column<Guid>(type: "uuid", nullable: false),
                    reviewer_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    overall_score = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    verdict = table.Column<string>(type: "text", nullable: false),
                    counts_as_evidence = table.Column<bool>(type: "boolean", nullable: false),
                    feedback = table.Column<string>(type: "text", nullable: true),
                    evaluated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    finalization_key = table.Column<Guid>(type: "uuid", nullable: true),
                    row_version = table.Column<long>(type: "bigint", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_task_evaluations", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "task_submission_files",
                columns: table => new
                {
                    submission_id = table.Column<Guid>(type: "uuid", nullable: false),
                    file_object_id = table.Column<Guid>(type: "uuid", nullable: false),
                    sort_order = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_task_submission_files", x => new { x.submission_id, x.file_object_id });
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
                    status = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_task_submissions", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "training_risk_scores",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    enrollment_id = table.Column<Guid>(type: "uuid", nullable: false),
                    employee_id = table.Column<Guid>(type: "uuid", nullable: false),
                    risk_score = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    risk_level = table.Column<string>(type: "text", nullable: false),
                    inactivity_score = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    low_score_rate = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    deadline_pressure = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    failed_attempt_rate = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    progress_delay = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    scoring_config_id = table.Column<Guid>(type: "uuid", nullable: true),
                    generated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_training_risk_scores", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "question_tag_assignments",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    question_id = table.Column<Guid>(type: "uuid", nullable: false),
                    tag_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_question_tag_assignments", x => x.id);
                    table.ForeignKey(
                        name: "fk_question_tag_assignments_question_tags_tag_id",
                        column: x => x.tag_id,
                        principalTable: "question_tags",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_question_tag_assignments_questions_question_id",
                        column: x => x.question_id,
                        principalTable: "questions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_question_tag_assignments_question_id_tag_id",
                table: "question_tag_assignments",
                columns: new[] { "question_id", "tag_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_question_tag_assignments_tag_id",
                table: "question_tag_assignments",
                column: "tag_id");

            migrationBuilder.CreateIndex(
                name: "ix_question_tags_organization_id_name",
                table: "question_tags",
                columns: new[] { "organization_id", "name" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "assessment_answers");

            migrationBuilder.DropTable(
                name: "assessment_attempts");

            migrationBuilder.DropTable(
                name: "assessment_questions");

            migrationBuilder.DropTable(
                name: "assessments");

            migrationBuilder.DropTable(
                name: "assigned_task_targets");

            migrationBuilder.DropTable(
                name: "certificate_templates");

            migrationBuilder.DropTable(
                name: "certificate_verification_logs");

            migrationBuilder.DropTable(
                name: "certificates");

            migrationBuilder.DropTable(
                name: "competency_evaluation_results");

            migrationBuilder.DropTable(
                name: "competency_evidences");

            migrationBuilder.DropTable(
                name: "competency_framework_mappings");

            migrationBuilder.DropTable(
                name: "competency_frameworks");

            migrationBuilder.DropTable(
                name: "course_assignments");

            migrationBuilder.DropTable(
                name: "course_competencies");

            migrationBuilder.DropTable(
                name: "course_learning_outcomes");

            migrationBuilder.DropTable(
                name: "course_modules");

            migrationBuilder.DropTable(
                name: "course_prerequisites");

            migrationBuilder.DropTable(
                name: "courses");

            migrationBuilder.DropTable(
                name: "employee_competency_profiles");

            migrationBuilder.DropTable(
                name: "enrollments");

            migrationBuilder.DropTable(
                name: "file_objects");

            migrationBuilder.DropTable(
                name: "learning_materials");

            migrationBuilder.DropTable(
                name: "lesson_learning_outcomes");

            migrationBuilder.DropTable(
                name: "lesson_progress");

            migrationBuilder.DropTable(
                name: "lessons");

            migrationBuilder.DropTable(
                name: "notifications");

            migrationBuilder.DropTable(
                name: "practical_task_targets");

            migrationBuilder.DropTable(
                name: "practical_task_templates");

            migrationBuilder.DropTable(
                name: "question_banks");

            migrationBuilder.DropTable(
                name: "question_options");

            migrationBuilder.DropTable(
                name: "question_tag_assignments");

            migrationBuilder.DropTable(
                name: "readiness_scores");

            migrationBuilder.DropTable(
                name: "scoring_config_items");

            migrationBuilder.DropTable(
                name: "scoring_configs");

            migrationBuilder.DropTable(
                name: "skill_gap_items");

            migrationBuilder.DropTable(
                name: "skill_gap_runs");

            migrationBuilder.DropTable(
                name: "task_assignments");

            migrationBuilder.DropTable(
                name: "task_evaluations");

            migrationBuilder.DropTable(
                name: "task_submission_files");

            migrationBuilder.DropTable(
                name: "task_submissions");

            migrationBuilder.DropTable(
                name: "training_risk_scores");

            migrationBuilder.DropTable(
                name: "question_tags");

            migrationBuilder.DropTable(
                name: "questions");
        }
    }
}
