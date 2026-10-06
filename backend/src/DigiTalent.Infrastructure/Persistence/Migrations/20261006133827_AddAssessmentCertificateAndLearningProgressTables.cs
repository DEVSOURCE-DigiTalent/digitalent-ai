using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigiTalent.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddAssessmentCertificateAndLearningProgressTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "assessments",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    course_id = table.Column<Guid>(type: "uuid", nullable: false),
                    code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    version_no = table.Column<int>(type: "integer", nullable: false),
                    supersedes_assessment_id = table.Column<Guid>(type: "uuid", nullable: true),
                    title = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    assessment_type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    is_final = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    time_limit_minutes = table.Column<int>(type: "integer", nullable: true),
                    max_attempts = table.Column<int>(type: "integer", nullable: true),
                    passing_score = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValue: "DRAFT"),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    row_version = table.Column<long>(type: "bigint", nullable: false, defaultValue: 1L),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_assessments", x => x.id);
                    table.CheckConstraint("ck_assessments_final_type", "NOT is_final OR assessment_type = 'FINAL'");
                    table.CheckConstraint("ck_assessments_max_attempts", "max_attempts IS NULL OR max_attempts > 0");
                    table.CheckConstraint("ck_assessments_not_self_supersede", "supersedes_assessment_id IS NULL OR supersedes_assessment_id <> id");
                    table.CheckConstraint("ck_assessments_passing_score", "passing_score BETWEEN 0 AND 100");
                    table.CheckConstraint("ck_assessments_row_version", "row_version > 0");
                    table.CheckConstraint("ck_assessments_status", "status IN ('DRAFT','PUBLISHED','ARCHIVED')");
                    table.CheckConstraint("ck_assessments_time_limit", "time_limit_minutes IS NULL OR time_limit_minutes > 0");
                    table.CheckConstraint("ck_assessments_type", "assessment_type IN ('PRACTICE','QUIZ','FINAL')");
                    table.CheckConstraint("ck_assessments_version", "version_no > 0");
                    table.ForeignKey(
                        name: "fk_assessments_assessments_supersedes_assessment_id",
                        column: x => x.supersedes_assessment_id,
                        principalTable: "assessments",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_assessments_courses_course_id",
                        column: x => x.course_id,
                        principalTable: "courses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_assessments_users_created_by_user_id",
                        column: x => x.created_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
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
                    table.CheckConstraint("ck_assigned_task_targets_level", "target_level BETWEEN 1 AND 3");
                    table.ForeignKey(
                        name: "fk_assigned_task_targets_competencies_competency_id",
                        column: x => x.competency_id,
                        principalTable: "competencies",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_assigned_task_targets_task_assignments_task_assignment_id",
                        column: x => x.task_assignment_id,
                        principalTable: "task_assignments",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "course_learning_outcomes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    course_id = table.Column<Guid>(type: "uuid", nullable: false),
                    code = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    competency_id = table.Column<Guid>(type: "uuid", nullable: false),
                    target_level = table.Column<short>(type: "smallint", nullable: false),
                    outcome_type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    statement = table.Column<string>(type: "text", nullable: false),
                    source_type = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    source_ref = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    assessment_method = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_course_learning_outcomes", x => x.id);
                    table.CheckConstraint("ck_course_learning_outcomes_level", "target_level BETWEEN 1 AND 3");
                    table.CheckConstraint("ck_course_learning_outcomes_source_type", "source_type IN ('OFFICIAL_FRAMEWORK','DIGITALENT_ADAPTATION','LOCAL_CONTEXT')");
                    table.CheckConstraint("ck_course_learning_outcomes_type", "outcome_type IN ('KNOWLEDGE','SKILL','ATTITUDE')");
                    table.ForeignKey(
                        name: "fk_course_learning_outcomes_competencies_competency_id",
                        column: x => x.competency_id,
                        principalTable: "competencies",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_course_learning_outcomes_courses_course_id",
                        column: x => x.course_id,
                        principalTable: "courses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "file_objects",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    organization_id = table.Column<Guid>(type: "uuid", nullable: true),
                    bucket = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    object_key = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    original_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    mime_type = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    size_bytes = table.Column<long>(type: "bigint", nullable: false),
                    checksum = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: true),
                    access_level = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    uploaded_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_file_objects", x => x.id);
                    table.CheckConstraint("ck_file_objects_access_level", "access_level IN ('PRIVATE','INTERNAL','PUBLIC_VERIFY')");
                    table.CheckConstraint("ck_file_objects_size", "size_bytes >= 0");
                    table.ForeignKey(
                        name: "fk_file_objects_organizations_organization_id",
                        column: x => x.organization_id,
                        principalTable: "organizations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_file_objects_users_uploaded_by_user_id",
                        column: x => x.uploaded_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "lesson_progress",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    enrollment_id = table.Column<Guid>(type: "uuid", nullable: false),
                    lesson_id = table.Column<Guid>(type: "uuid", nullable: false),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    progress_percent = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false, defaultValue: 0m),
                    last_accessed_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    completed_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_lesson_progress", x => x.id);
                    table.CheckConstraint("ck_lesson_progress_percent", "progress_percent BETWEEN 0 AND 100");
                    table.CheckConstraint("ck_lesson_progress_status", "status IN ('NOT_STARTED','IN_PROGRESS','COMPLETED')");
                    table.ForeignKey(
                        name: "fk_lesson_progress_enrollments_enrollment_id",
                        column: x => x.enrollment_id,
                        principalTable: "enrollments",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_lesson_progress_lessons_lesson_id",
                        column: x => x.lesson_id,
                        principalTable: "lessons",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
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
                    table.CheckConstraint("ck_practical_task_targets_level", "target_level BETWEEN 1 AND 3");
                    table.ForeignKey(
                        name: "fk_practical_task_targets_competencies_competency_id",
                        column: x => x.competency_id,
                        principalTable: "competencies",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_practical_task_targets_practical_task_templates_task_templa",
                        column: x => x.task_template_id,
                        principalTable: "practical_task_templates",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "question_banks",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    organization_id = table.Column<Guid>(type: "uuid", nullable: false),
                    title = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    owner_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_question_banks", x => x.id);
                    table.CheckConstraint("ck_question_banks_status", "status IN ('ACTIVE','ARCHIVED')");
                    table.ForeignKey(
                        name: "fk_question_banks_organizations_organization_id",
                        column: x => x.organization_id,
                        principalTable: "organizations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_question_banks_users_owner_user_id",
                        column: x => x.owner_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "assessment_attempts",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    assessment_id = table.Column<Guid>(type: "uuid", nullable: false),
                    enrollment_id = table.Column<Guid>(type: "uuid", nullable: false),
                    attempt_no = table.Column<int>(type: "integer", nullable: false),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValue: "STARTED"),
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
                    table.CheckConstraint("ck_assessment_attempts_attempt_no", "attempt_no >= 1");
                    table.CheckConstraint("ck_assessment_attempts_scored_after_start", "scored_at IS NULL OR scored_at >= started_at");
                    table.CheckConstraint("ck_assessment_attempts_status", "status IN ('STARTED','SUBMITTED','SCORED')");
                    table.CheckConstraint("ck_assessment_attempts_submitted_after_start", "submitted_at IS NULL OR submitted_at >= started_at");
                    table.ForeignKey(
                        name: "fk_assessment_attempts_assessments_assessment_id",
                        column: x => x.assessment_id,
                        principalTable: "assessments",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_assessment_attempts_enrollments_enrollment_id",
                        column: x => x.enrollment_id,
                        principalTable: "enrollments",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "certificate_templates",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    organization_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    version_no = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    template_html = table.Column<string>(type: "text", nullable: false),
                    background_file_object_id = table.Column<Guid>(type: "uuid", nullable: true),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValue: "DRAFT"),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_certificate_templates", x => x.id);
                    table.CheckConstraint("ck_certificate_templates_status", "status IN ('DRAFT','ACTIVE','ARCHIVED')");
                    table.CheckConstraint("ck_certificate_templates_version", "version_no > 0");
                    table.ForeignKey(
                        name: "fk_certificate_templates_file_objects_background_file_object_id",
                        column: x => x.background_file_object_id,
                        principalTable: "file_objects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_certificate_templates_organizations_organization_id",
                        column: x => x.organization_id,
                        principalTable: "organizations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_certificate_templates_users_created_by_user_id",
                        column: x => x.created_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "learning_materials",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    lesson_id = table.Column<Guid>(type: "uuid", nullable: false),
                    title = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    material_type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
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
                    table.CheckConstraint("ck_learning_materials_exactly_one_source", "(material_type = 'FILE' AND file_object_id IS NOT NULL AND external_url IS NULL) OR (material_type = 'LINK' AND external_url IS NOT NULL AND file_object_id IS NULL)");
                    table.CheckConstraint("ck_learning_materials_type", "material_type IN ('FILE','LINK')");
                    table.ForeignKey(
                        name: "fk_learning_materials_file_objects_file_object_id",
                        column: x => x.file_object_id,
                        principalTable: "file_objects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_learning_materials_lessons_lesson_id",
                        column: x => x.lesson_id,
                        principalTable: "lessons",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
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
                    table.ForeignKey(
                        name: "fk_task_submission_files_file_objects_file_object_id",
                        column: x => x.file_object_id,
                        principalTable: "file_objects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_task_submission_files_task_submissions_submission_id",
                        column: x => x.submission_id,
                        principalTable: "task_submissions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "questions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    bank_id = table.Column<Guid>(type: "uuid", nullable: false),
                    competency_id = table.Column<Guid>(type: "uuid", nullable: true),
                    question_type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    difficulty = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    content = table.Column<string>(type: "text", nullable: false),
                    explanation = table.Column<string>(type: "text", nullable: true),
                    ai_generated_flag = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_questions", x => x.id);
                    table.CheckConstraint("ck_questions_status", "status IN ('DRAFT','APPROVED','ARCHIVED')");
                    table.CheckConstraint("ck_questions_type", "question_type IN ('MULTIPLE_CHOICE','TRUE_FALSE')");
                    table.ForeignKey(
                        name: "fk_questions_competencies_competency_id",
                        column: x => x.competency_id,
                        principalTable: "competencies",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_questions_question_banks_bank_id",
                        column: x => x.bank_id,
                        principalTable: "question_banks",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_questions_users_created_by_user_id",
                        column: x => x.created_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
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
                    certificate_code = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    holder_name_snapshot = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    course_title_snapshot = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    primary_competency_snapshot = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: true),
                    issued_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    expires_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValue: "VALID"),
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
                    table.CheckConstraint("ck_certificates_expiry", "expires_at IS NULL OR expires_at >= issued_at");
                    table.CheckConstraint("ck_certificates_revocation_fields", "status <> 'REVOKED' OR (revoked_at IS NOT NULL AND revoked_by_user_id IS NOT NULL AND revocation_reason IS NOT NULL)");
                    table.CheckConstraint("ck_certificates_status", "status IN ('VALID','EXPIRED','REVOKED')");
                    table.ForeignKey(
                        name: "fk_certificates_assessment_attempts_assessment_attempt_id",
                        column: x => x.assessment_attempt_id,
                        principalTable: "assessment_attempts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_certificates_certificate_templates_certificate_template_id",
                        column: x => x.certificate_template_id,
                        principalTable: "certificate_templates",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_certificates_employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_certificates_enrollments_enrollment_id",
                        column: x => x.enrollment_id,
                        principalTable: "enrollments",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_certificates_file_objects_pdf_file_object_id",
                        column: x => x.pdf_file_object_id,
                        principalTable: "file_objects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_certificates_users_revoked_by_user_id",
                        column: x => x.revoked_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
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
                    table.CheckConstraint("ck_assessment_questions_points", "points > 0");
                    table.ForeignKey(
                        name: "fk_assessment_questions_assessments_assessment_id",
                        column: x => x.assessment_id,
                        principalTable: "assessments",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_assessment_questions_questions_question_id",
                        column: x => x.question_id,
                        principalTable: "questions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
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
                    table.ForeignKey(
                        name: "fk_question_options_questions_question_id",
                        column: x => x.question_id,
                        principalTable: "questions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

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
                    table.CheckConstraint("ck_assessment_answers_points_awarded", "points_awarded IS NULL OR points_awarded >= 0");
                    table.ForeignKey(
                        name: "fk_assessment_answers_assessment_attempts_attempt_id",
                        column: x => x.attempt_id,
                        principalTable: "assessment_attempts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_assessment_answers_question_options_selected_option_id",
                        column: x => x.selected_option_id,
                        principalTable: "question_options",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_assessment_answers_questions_question_id",
                        column: x => x.question_id,
                        principalTable: "questions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_assessment_answers_question_id",
                table: "assessment_answers",
                column: "question_id");

            migrationBuilder.CreateIndex(
                name: "ix_assessment_answers_selected_option_id",
                table: "assessment_answers",
                column: "selected_option_id");

            migrationBuilder.CreateIndex(
                name: "uq_assessment_answers_attempt_question",
                table: "assessment_answers",
                columns: new[] { "attempt_id", "question_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_assessment_attempts_enrollment_assessment_attempt",
                table: "assessment_attempts",
                columns: new[] { "enrollment_id", "assessment_id", "attempt_no" });

            migrationBuilder.CreateIndex(
                name: "uq_assessment_attempts_assessment_enrollment_attempt",
                table: "assessment_attempts",
                columns: new[] { "assessment_id", "enrollment_id", "attempt_no" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_assessment_questions_question_id",
                table: "assessment_questions",
                column: "question_id");

            migrationBuilder.CreateIndex(
                name: "ix_assessments_created_by_user_id",
                table: "assessments",
                column: "created_by_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_assessments_supersedes_assessment_id",
                table: "assessments",
                column: "supersedes_assessment_id");

            migrationBuilder.CreateIndex(
                name: "uq_assessments_course_code_version",
                table: "assessments",
                columns: new[] { "course_id", "code", "version_no" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ux_assessments_one_published_final",
                table: "assessments",
                column: "course_id",
                unique: true,
                filter: "is_final = true AND status = 'PUBLISHED'");

            migrationBuilder.CreateIndex(
                name: "ix_assigned_task_targets_competency_id",
                table: "assigned_task_targets",
                column: "competency_id");

            migrationBuilder.CreateIndex(
                name: "uq_assigned_task_targets_assignment_competency",
                table: "assigned_task_targets",
                columns: new[] { "task_assignment_id", "competency_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_certificate_templates_background_file_object_id",
                table: "certificate_templates",
                column: "background_file_object_id");

            migrationBuilder.CreateIndex(
                name: "ix_certificate_templates_created_by_user_id",
                table: "certificate_templates",
                column: "created_by_user_id");

            migrationBuilder.CreateIndex(
                name: "uq_certificate_templates_org_name_version",
                table: "certificate_templates",
                columns: new[] { "organization_id", "name", "version_no" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_certificates_assessment_attempt_id",
                table: "certificates",
                column: "assessment_attempt_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_certificates_certificate_code",
                table: "certificates",
                column: "certificate_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_certificates_certificate_template_id",
                table: "certificates",
                column: "certificate_template_id");

            migrationBuilder.CreateIndex(
                name: "ix_certificates_employee",
                table: "certificates",
                columns: new[] { "employee_id", "issued_at" },
                descending: new[] { false, true });

            migrationBuilder.CreateIndex(
                name: "ix_certificates_enrollment_id",
                table: "certificates",
                column: "enrollment_id");

            migrationBuilder.CreateIndex(
                name: "ix_certificates_pdf_file_object_id",
                table: "certificates",
                column: "pdf_file_object_id");

            migrationBuilder.CreateIndex(
                name: "ix_certificates_revoked_by_user_id",
                table: "certificates",
                column: "revoked_by_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_course_learning_outcomes_competency_id",
                table: "course_learning_outcomes",
                column: "competency_id");

            migrationBuilder.CreateIndex(
                name: "uq_course_learning_outcomes_course_code",
                table: "course_learning_outcomes",
                columns: new[] { "course_id", "code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_file_objects_object_key",
                table: "file_objects",
                column: "object_key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_file_objects_organization_id",
                table: "file_objects",
                column: "organization_id");

            migrationBuilder.CreateIndex(
                name: "ix_file_objects_uploaded_by_user_id",
                table: "file_objects",
                column: "uploaded_by_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_learning_materials_file_object_id",
                table: "learning_materials",
                column: "file_object_id");

            migrationBuilder.CreateIndex(
                name: "ix_learning_materials_lesson_id",
                table: "learning_materials",
                column: "lesson_id");

            migrationBuilder.CreateIndex(
                name: "ix_lesson_progress_lesson_id",
                table: "lesson_progress",
                column: "lesson_id");

            migrationBuilder.CreateIndex(
                name: "uq_lesson_progress_enrollment_lesson",
                table: "lesson_progress",
                columns: new[] { "enrollment_id", "lesson_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_practical_task_targets_competency_id",
                table: "practical_task_targets",
                column: "competency_id");

            migrationBuilder.CreateIndex(
                name: "uq_practical_task_targets_template_competency",
                table: "practical_task_targets",
                columns: new[] { "task_template_id", "competency_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_question_banks_organization_id",
                table: "question_banks",
                column: "organization_id");

            migrationBuilder.CreateIndex(
                name: "ix_question_banks_owner_user_id",
                table: "question_banks",
                column: "owner_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_question_options_question_id",
                table: "question_options",
                column: "question_id");

            migrationBuilder.CreateIndex(
                name: "ix_questions_bank_id",
                table: "questions",
                column: "bank_id");

            migrationBuilder.CreateIndex(
                name: "ix_questions_competency_id",
                table: "questions",
                column: "competency_id");

            migrationBuilder.CreateIndex(
                name: "ix_questions_created_by_user_id",
                table: "questions",
                column: "created_by_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_task_submission_files_file_object_id",
                table: "task_submission_files",
                column: "file_object_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "assessment_answers");

            migrationBuilder.DropTable(
                name: "assessment_questions");

            migrationBuilder.DropTable(
                name: "assigned_task_targets");

            migrationBuilder.DropTable(
                name: "certificates");

            migrationBuilder.DropTable(
                name: "course_learning_outcomes");

            migrationBuilder.DropTable(
                name: "learning_materials");

            migrationBuilder.DropTable(
                name: "lesson_progress");

            migrationBuilder.DropTable(
                name: "practical_task_targets");

            migrationBuilder.DropTable(
                name: "task_submission_files");

            migrationBuilder.DropTable(
                name: "question_options");

            migrationBuilder.DropTable(
                name: "assessment_attempts");

            migrationBuilder.DropTable(
                name: "certificate_templates");

            migrationBuilder.DropTable(
                name: "questions");

            migrationBuilder.DropTable(
                name: "assessments");

            migrationBuilder.DropTable(
                name: "file_objects");

            migrationBuilder.DropTable(
                name: "question_banks");
        }
    }
}
