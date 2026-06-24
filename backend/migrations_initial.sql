CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

START TRANSACTION;
CREATE TABLE ai_explanation_logs (
    id uuid NOT NULL,
    feature_type character varying(80) NOT NULL,
    source_entity_type character varying(80),
    source_entity_id uuid,
    input_snapshot_json jsonb NOT NULL,
    output_text text NOT NULL,
    model_provider character varying(80),
    model_name character varying(120),
    created_by_user_id uuid,
    created_at timestamptz NOT NULL,
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT "PK_ai_explanation_logs" PRIMARY KEY (id)
);

CREATE TABLE audit_logs (
    id uuid NOT NULL,
    organization_id uuid,
    actor_user_id uuid,
    action character varying(120) NOT NULL,
    entity_type character varying(120) NOT NULL,
    entity_id uuid,
    old_values_json jsonb,
    new_values_json jsonb,
    ip_address character varying(64),
    created_at timestamptz NOT NULL,
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT "PK_audit_logs" PRIMARY KEY (id)
);

CREATE TABLE certificate_templates (
    id uuid NOT NULL,
    organization_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    template_html text NOT NULL,
    background_file_object_id uuid,
    status character varying(30) NOT NULL,
    created_by_user_id uuid,
    created_at timestamptz NOT NULL,
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT "PK_certificate_templates" PRIMARY KEY (id)
);

CREATE TABLE certificate_verification_logs (
    id uuid NOT NULL,
    certificate_id uuid,
    certificate_code character varying(120) NOT NULL,
    verified_at timestamptz NOT NULL,
    result_status character varying(30) NOT NULL,
    verifier_ip character varying(64),
    user_agent text,
    created_at timestamptz NOT NULL,
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT "PK_certificate_verification_logs" PRIMARY KEY (id)
);

CREATE TABLE competency_categories (
    "Id" uuid NOT NULL,
    "OrganizationId" uuid NOT NULL,
    "Code" character varying(80) NOT NULL,
    "Name" character varying(255) NOT NULL,
    "Description" text,
    "SortOrder" integer NOT NULL,
    "Status" character varying(30) NOT NULL,
    "CreatedAt" timestamptz NOT NULL,
    "CreatedBy" uuid,
    "UpdatedAt" timestamptz,
    "UpdatedBy" uuid,
    CONSTRAINT "PK_competency_categories" PRIMARY KEY ("Id")
);

CREATE TABLE competency_levels (
    "Id" uuid NOT NULL,
    "OrganizationId" uuid NOT NULL,
    "LevelValue" integer NOT NULL,
    "Name" character varying(120) NOT NULL,
    "Description" text,
    "AchievementCriteria" text,
    "Status" character varying(30) NOT NULL,
    "CreatedAt" timestamptz NOT NULL,
    "CreatedBy" uuid,
    "UpdatedAt" timestamptz,
    "UpdatedBy" uuid,
    CONSTRAINT "PK_competency_levels" PRIMARY KEY ("Id")
);

CREATE TABLE courses (
    id uuid NOT NULL,
    organization_id uuid NOT NULL,
    code character varying(80) NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    difficulty_level character varying(30),
    estimated_duration_minutes integer,
    owner_trainer_id uuid,
    passing_score numeric(5,2),
    status character varying(30) NOT NULL,
    created_at timestamptz NOT NULL,
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT "PK_courses" PRIMARY KEY (id)
);

CREATE TABLE file_objects (
    id uuid NOT NULL,
    bucket_name character varying(120) NOT NULL,
    object_key text NOT NULL,
    original_file_name character varying(255) NOT NULL,
    content_type character varying(120) NOT NULL,
    file_size_bytes bigint NOT NULL,
    checksum_sha256 character varying(128),
    access_level character varying(30) NOT NULL,
    related_entity_type character varying(80),
    related_entity_id uuid,
    uploaded_by_user_id uuid,
    created_at timestamptz NOT NULL,
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT "PK_file_objects" PRIMARY KEY (id)
);

CREATE TABLE learning_recommendations (
    id uuid NOT NULL,
    employee_id uuid NOT NULL,
    source_skill_gap_result_id uuid,
    course_id uuid NOT NULL,
    priority_score numeric(6,2) NOT NULL,
    reason text NOT NULL,
    status character varying(30) NOT NULL,
    created_at timestamptz NOT NULL,
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT "PK_learning_recommendations" PRIMARY KEY (id)
);

CREATE TABLE notification_preferences (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    notification_type character varying(80) NOT NULL,
    in_app_enabled boolean NOT NULL,
    email_enabled boolean NOT NULL,
    created_at timestamptz NOT NULL,
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT "PK_notification_preferences" PRIMARY KEY (id)
);

CREATE TABLE notifications (
    id uuid NOT NULL,
    recipient_user_id uuid NOT NULL,
    type character varying(80) NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    related_entity_type character varying(80),
    related_entity_id uuid,
    is_read boolean NOT NULL,
    read_at timestamptz,
    created_at timestamptz NOT NULL,
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT "PK_notifications" PRIMARY KEY (id)
);

CREATE TABLE organizations (
    "Id" uuid NOT NULL,
    "Code" character varying(80) NOT NULL,
    "Name" character varying(255) NOT NULL,
    "Domain" character varying(255),
    "Status" character varying(30) NOT NULL,
    "CreatedAt" timestamptz NOT NULL,
    "CreatedBy" uuid,
    "UpdatedAt" timestamptz,
    "UpdatedBy" uuid,
    CONSTRAINT "PK_organizations" PRIMARY KEY ("Id")
);

CREATE TABLE permissions (
    "Id" uuid NOT NULL,
    "Code" character varying(120) NOT NULL,
    "Module" character varying(80) NOT NULL,
    "Action" character varying(80) NOT NULL,
    "Description" text,
    "CreatedAt" timestamp with time zone NOT NULL,
    "CreatedBy" uuid,
    "UpdatedAt" timestamp with time zone,
    "UpdatedBy" uuid,
    CONSTRAINT "PK_permissions" PRIMARY KEY ("Id")
);

CREATE TABLE practical_tasks (
    id uuid NOT NULL,
    organization_id uuid NOT NULL,
    related_course_id uuid,
    competency_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    expected_output text NOT NULL,
    evaluation_criteria jsonb NOT NULL,
    source_type character varying(30) NOT NULL,
    status character varying(30) NOT NULL,
    created_at timestamptz NOT NULL,
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT "PK_practical_tasks" PRIMARY KEY (id)
);

CREATE TABLE promotion_readiness_results (
    id uuid NOT NULL,
    employee_id uuid NOT NULL,
    target_job_position_id uuid NOT NULL,
    readiness_percent numeric(5,2) NOT NULL,
    missing_weight numeric(6,2) NOT NULL,
    recommendation_text text,
    generated_at timestamptz NOT NULL,
    created_at timestamptz NOT NULL,
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT "PK_promotion_readiness_results" PRIMARY KEY (id)
);

CREATE TABLE question_banks (
    id uuid NOT NULL,
    organization_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    owner_trainer_id uuid,
    status character varying(30) NOT NULL,
    created_at timestamptz NOT NULL,
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT "PK_question_banks" PRIMARY KEY (id)
);

CREATE TABLE readiness_scores (
    id uuid NOT NULL,
    employee_id uuid NOT NULL,
    job_position_id uuid NOT NULL,
    competency_score numeric(5,2) NOT NULL,
    certificate_score numeric(5,2) NOT NULL,
    learning_progress_score numeric(5,2) NOT NULL,
    compliance_score numeric(5,2) NOT NULL,
    task_performance_score numeric(5,2) NOT NULL,
    total_score numeric(5,2) NOT NULL,
    readiness_level character varying(30) NOT NULL,
    generated_at timestamptz NOT NULL,
    snapshot_json jsonb,
    created_at timestamptz NOT NULL,
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT "PK_readiness_scores" PRIMARY KEY (id)
);

CREATE TABLE roles (
    "Id" uuid NOT NULL,
    "Code" character varying(80) NOT NULL,
    "Name" character varying(120) NOT NULL,
    "Description" text,
    "ScopeType" character varying(30) NOT NULL,
    "IsSystemRole" boolean NOT NULL,
    "Status" character varying(30) NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "CreatedBy" uuid,
    "UpdatedAt" timestamp with time zone,
    "UpdatedBy" uuid,
    CONSTRAINT "PK_roles" PRIMARY KEY ("Id")
);

CREATE TABLE scoring_configs (
    id uuid NOT NULL,
    organization_id uuid NOT NULL,
    config_type character varying(80) NOT NULL,
    version integer NOT NULL,
    is_active boolean NOT NULL,
    description text,
    created_by_user_id uuid,
    created_at timestamptz NOT NULL,
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT "PK_scoring_configs" PRIMARY KEY (id)
);

CREATE TABLE skill_gap_results (
    id uuid NOT NULL,
    employee_id uuid NOT NULL,
    job_position_id uuid NOT NULL,
    overall_gap_score numeric(6,2) NOT NULL,
    generated_at timestamptz NOT NULL,
    generated_by character varying(30) NOT NULL,
    snapshot_json jsonb,
    created_at timestamptz NOT NULL,
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT "PK_skill_gap_results" PRIMARY KEY (id)
);

CREATE TABLE system_settings (
    id uuid NOT NULL,
    organization_id uuid,
    setting_key character varying(120) NOT NULL,
    setting_value jsonb NOT NULL,
    description text,
    updated_by_user_id uuid,
    created_at timestamptz NOT NULL,
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT "PK_system_settings" PRIMARY KEY (id)
);

CREATE TABLE training_risk_scores (
    id uuid NOT NULL,
    enrollment_id uuid NOT NULL,
    employee_id uuid NOT NULL,
    risk_score numeric(5,2) NOT NULL,
    risk_level character varying(30) NOT NULL,
    inactivity_score numeric(5,2) NOT NULL,
    low_score_rate numeric(5,2) NOT NULL,
    deadline_pressure numeric(5,2) NOT NULL,
    failed_attempt_rate numeric(5,2) NOT NULL,
    progress_delay numeric(5,2) NOT NULL,
    generated_at timestamptz NOT NULL,
    created_at timestamptz NOT NULL,
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT "PK_training_risk_scores" PRIMARY KEY (id)
);

CREATE TABLE users (
    "Id" uuid NOT NULL,
    "Email" character varying(255) NOT NULL,
    "PasswordHash" text NOT NULL,
    "FullName" character varying(255) NOT NULL,
    "AvatarUrl" text,
    "Status" character varying(30) NOT NULL,
    "EmailVerifiedAt" timestamptz,
    "LastLoginAt" timestamptz,
    "FailedLoginCount" integer NOT NULL,
    "CreatedAt" timestamptz NOT NULL,
    "CreatedBy" uuid,
    "UpdatedAt" timestamptz,
    "UpdatedBy" uuid,
    CONSTRAINT "PK_users" PRIMARY KEY ("Id")
);

CREATE TABLE competencies (
    "Id" uuid NOT NULL,
    "CategoryId" uuid NOT NULL,
    "Code" character varying(80) NOT NULL,
    "Name" character varying(255) NOT NULL,
    "Description" text,
    "Status" character varying(30) NOT NULL,
    "CreatedAt" timestamptz NOT NULL,
    "CreatedBy" uuid,
    "UpdatedAt" timestamptz,
    "UpdatedBy" uuid,
    CONSTRAINT "PK_competencies" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_competencies_competency_categories_CategoryId" FOREIGN KEY ("CategoryId") REFERENCES competency_categories ("Id") ON DELETE RESTRICT
);

CREATE TABLE assessments (
    id uuid NOT NULL,
    course_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    assessment_type character varying(30) NOT NULL,
    time_limit_minutes integer,
    max_attempts integer,
    passing_score numeric(5,2) NOT NULL,
    status character varying(30) NOT NULL,
    created_at timestamptz NOT NULL,
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT "PK_assessments" PRIMARY KEY (id),
    CONSTRAINT "FK_assessments_courses_course_id" FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE RESTRICT
);

CREATE TABLE course_assignments (
    id uuid NOT NULL,
    course_id uuid NOT NULL,
    assignment_type character varying(30) NOT NULL,
    target_employee_id uuid,
    target_department_id uuid,
    target_job_position_id uuid,
    assigned_by_user_id uuid NOT NULL,
    due_date date,
    status character varying(30) NOT NULL,
    created_at timestamptz NOT NULL,
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT "PK_course_assignments" PRIMARY KEY (id),
    CONSTRAINT "FK_course_assignments_courses_course_id" FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE RESTRICT
);

CREATE TABLE course_modules (
    id uuid NOT NULL,
    course_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    sort_order integer NOT NULL,
    status character varying(30) NOT NULL,
    created_at timestamptz NOT NULL,
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT "PK_course_modules" PRIMARY KEY (id),
    CONSTRAINT "FK_course_modules_courses_course_id" FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE RESTRICT
);

CREATE TABLE learning_materials (
    id uuid NOT NULL,
    course_id uuid,
    lesson_id uuid,
    file_object_id uuid,
    material_type character varying(30) NOT NULL,
    external_url text,
    title character varying(255) NOT NULL,
    sort_order integer NOT NULL,
    created_at timestamptz NOT NULL,
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT "PK_learning_materials" PRIMARY KEY (id),
    CONSTRAINT "FK_learning_materials_courses_course_id" FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE RESTRICT
);

CREATE TABLE departments (
    "Id" uuid NOT NULL,
    "OrganizationId" uuid NOT NULL,
    "ParentDepartmentId" uuid,
    "ManagerEmployeeId" uuid,
    "Code" character varying(80) NOT NULL,
    "Name" character varying(255) NOT NULL,
    "Description" text,
    "Status" character varying(30) NOT NULL,
    "CreatedAt" timestamptz NOT NULL,
    "CreatedBy" uuid,
    "UpdatedAt" timestamptz,
    "UpdatedBy" uuid,
    CONSTRAINT "PK_departments" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_departments_departments_ParentDepartmentId" FOREIGN KEY ("ParentDepartmentId") REFERENCES departments ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_departments_organizations_OrganizationId" FOREIGN KEY ("OrganizationId") REFERENCES organizations ("Id") ON DELETE RESTRICT
);

CREATE TABLE job_positions (
    "Id" uuid NOT NULL,
    "OrganizationId" uuid NOT NULL,
    "DepartmentId" uuid,
    "Code" character varying(80) NOT NULL,
    "Title" character varying(255) NOT NULL,
    "Description" text,
    "LevelName" character varying(80),
    "Status" character varying(30) NOT NULL,
    "CreatedAt" timestamptz NOT NULL,
    "CreatedBy" uuid,
    "UpdatedAt" timestamptz,
    "UpdatedBy" uuid,
    CONSTRAINT "PK_job_positions" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_job_positions_organizations_OrganizationId" FOREIGN KEY ("OrganizationId") REFERENCES organizations ("Id") ON DELETE RESTRICT
);

CREATE TABLE questions (
    id uuid NOT NULL,
    bank_id uuid NOT NULL,
    competency_id uuid,
    question_type character varying(30) NOT NULL,
    difficulty character varying(30),
    content text NOT NULL,
    explanation text,
    ai_generated_flag boolean NOT NULL,
    status character varying(30) NOT NULL,
    created_at timestamptz NOT NULL,
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT "PK_questions" PRIMARY KEY (id),
    CONSTRAINT "FK_questions_question_banks_bank_id" FOREIGN KEY (bank_id) REFERENCES question_banks (id) ON DELETE RESTRICT
);

CREATE TABLE role_permissions (
    "RoleId" uuid NOT NULL,
    "PermissionId" uuid NOT NULL,
    "Id" uuid NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "CreatedBy" uuid,
    "UpdatedAt" timestamp with time zone,
    "UpdatedBy" uuid,
    CONSTRAINT "PK_role_permissions" PRIMARY KEY ("RoleId", "PermissionId"),
    CONSTRAINT "FK_role_permissions_permissions_PermissionId" FOREIGN KEY ("PermissionId") REFERENCES permissions ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_role_permissions_roles_RoleId" FOREIGN KEY ("RoleId") REFERENCES roles ("Id") ON DELETE RESTRICT
);

CREATE TABLE scoring_config_items (
    id uuid NOT NULL,
    scoring_config_id uuid NOT NULL,
    component_code character varying(120) NOT NULL,
    weight numeric(6,4) NOT NULL,
    min_value numeric(8,2),
    max_value numeric(8,2),
    notes text,
    created_at timestamptz NOT NULL,
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT "PK_scoring_config_items" PRIMARY KEY (id),
    CONSTRAINT "FK_scoring_config_items_scoring_configs_scoring_config_id" FOREIGN KEY (scoring_config_id) REFERENCES scoring_configs (id) ON DELETE RESTRICT
);

CREATE TABLE skill_gap_items (
    id uuid NOT NULL,
    skill_gap_result_id uuid NOT NULL,
    competency_id uuid NOT NULL,
    required_level_value integer NOT NULL,
    current_level_value integer NOT NULL,
    gap_level integer NOT NULL,
    priority character varying(30) NOT NULL,
    recommended_action text,
    created_at timestamptz NOT NULL,
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT "PK_skill_gap_items" PRIMARY KEY (id),
    CONSTRAINT "FK_skill_gap_items_skill_gap_results_skill_gap_result_id" FOREIGN KEY (skill_gap_result_id) REFERENCES skill_gap_results (id) ON DELETE RESTRICT
);

CREATE TABLE refresh_tokens (
    "Id" uuid NOT NULL,
    "UserId" uuid NOT NULL,
    "TokenHash" text NOT NULL,
    "ExpiresAt" timestamptz NOT NULL,
    "RevokedAt" timestamptz,
    "ReplacedByTokenId" uuid,
    "IpAddress" character varying(64),
    "UserAgent" text,
    "CreatedAt" timestamptz NOT NULL,
    "CreatedBy" uuid,
    "UpdatedAt" timestamptz,
    "UpdatedBy" uuid,
    CONSTRAINT "PK_refresh_tokens" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_refresh_tokens_refresh_tokens_ReplacedByTokenId" FOREIGN KEY ("ReplacedByTokenId") REFERENCES refresh_tokens ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_refresh_tokens_users_UserId" FOREIGN KEY ("UserId") REFERENCES users ("Id") ON DELETE RESTRICT
);

CREATE TABLE user_roles (
    "UserId" uuid NOT NULL,
    "RoleId" uuid NOT NULL,
    "AssignedBy" uuid,
    "Id" uuid NOT NULL,
    "CreatedAt" timestamptz NOT NULL,
    "CreatedBy" uuid,
    "UpdatedAt" timestamp with time zone,
    "UpdatedBy" uuid,
    CONSTRAINT "PK_user_roles" PRIMARY KEY ("UserId", "RoleId"),
    CONSTRAINT "FK_user_roles_roles_RoleId" FOREIGN KEY ("RoleId") REFERENCES roles ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_user_roles_users_UserId" FOREIGN KEY ("UserId") REFERENCES users ("Id") ON DELETE RESTRICT
);

CREATE TABLE course_competencies (
    course_id uuid NOT NULL,
    competency_id uuid NOT NULL,
    target_level_value integer,
    coverage_weight numeric(5,2) NOT NULL,
    notes text,
    "Id" uuid NOT NULL,
    created_at timestamptz NOT NULL,
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT "PK_course_competencies" PRIMARY KEY (course_id, competency_id),
    CONSTRAINT "FK_course_competencies_competencies_competency_id" FOREIGN KEY (competency_id) REFERENCES competencies ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_course_competencies_courses_course_id" FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE RESTRICT
);

CREATE TABLE assessment_attempts (
    id uuid NOT NULL,
    assessment_id uuid NOT NULL,
    enrollment_id uuid NOT NULL,
    employee_id uuid NOT NULL,
    attempt_no integer NOT NULL,
    status character varying(30) NOT NULL,
    started_at timestamptz NOT NULL,
    submitted_at timestamptz,
    score numeric(6,2),
    passed boolean,
    created_at timestamptz NOT NULL,
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT "PK_assessment_attempts" PRIMARY KEY (id),
    CONSTRAINT "FK_assessment_attempts_assessments_assessment_id" FOREIGN KEY (assessment_id) REFERENCES assessments (id) ON DELETE RESTRICT
);

CREATE TABLE lessons (
    id uuid NOT NULL,
    module_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    content_type character varying(30) NOT NULL,
    content_body text,
    estimated_minutes integer,
    sort_order integer NOT NULL,
    is_required boolean NOT NULL,
    status character varying(30) NOT NULL,
    created_at timestamptz NOT NULL,
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT "PK_lessons" PRIMARY KEY (id),
    CONSTRAINT "FK_lessons_course_modules_module_id" FOREIGN KEY (module_id) REFERENCES course_modules (id) ON DELETE RESTRICT
);

CREATE TABLE employees (
    "Id" uuid NOT NULL,
    "OrganizationId" uuid NOT NULL,
    "UserId" uuid,
    "DepartmentId" uuid NOT NULL,
    "JobPositionId" uuid NOT NULL,
    "DirectManagerId" uuid,
    "EmployeeCode" character varying(80) NOT NULL,
    "FullName" character varying(255) NOT NULL,
    "Email" character varying(255) NOT NULL,
    "Phone" character varying(50),
    "EmploymentStatus" character varying(30) NOT NULL,
    "JoinedAt" date,
    "CreatedAt" timestamptz NOT NULL,
    "CreatedBy" uuid,
    "UpdatedAt" timestamptz,
    "UpdatedBy" uuid,
    CONSTRAINT "PK_employees" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_employees_departments_DepartmentId" FOREIGN KEY ("DepartmentId") REFERENCES departments ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_employees_employees_DirectManagerId" FOREIGN KEY ("DirectManagerId") REFERENCES employees ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_employees_job_positions_JobPositionId" FOREIGN KEY ("JobPositionId") REFERENCES job_positions ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_employees_organizations_OrganizationId" FOREIGN KEY ("OrganizationId") REFERENCES organizations ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_employees_users_UserId" FOREIGN KEY ("UserId") REFERENCES users ("Id") ON DELETE RESTRICT
);

CREATE TABLE position_competency_requirements (
    "Id" uuid NOT NULL,
    "JobPositionId" uuid NOT NULL,
    "CompetencyId" uuid NOT NULL,
    "RequiredLevelValue" integer NOT NULL,
    "Weight" numeric(5,2) NOT NULL,
    "IsMandatory" boolean NOT NULL,
    "EffectiveFrom" date,
    "EffectiveTo" date,
    "CreatedAt" timestamptz NOT NULL,
    "CreatedBy" uuid,
    "UpdatedAt" timestamptz,
    "UpdatedBy" uuid,
    CONSTRAINT "PK_position_competency_requirements" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_position_competency_requirements_competencies_CompetencyId" FOREIGN KEY ("CompetencyId") REFERENCES competencies ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_position_competency_requirements_job_positions_JobPositionId" FOREIGN KEY ("JobPositionId") REFERENCES job_positions ("Id") ON DELETE RESTRICT
);

CREATE TABLE assessment_questions (
    assessment_id uuid NOT NULL,
    question_id uuid NOT NULL,
    score_weight numeric(6,2) NOT NULL,
    sort_order integer NOT NULL,
    "Id" uuid NOT NULL,
    created_at timestamptz NOT NULL,
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT "PK_assessment_questions" PRIMARY KEY (assessment_id, question_id),
    CONSTRAINT "FK_assessment_questions_assessments_assessment_id" FOREIGN KEY (assessment_id) REFERENCES assessments (id) ON DELETE RESTRICT,
    CONSTRAINT "FK_assessment_questions_questions_question_id" FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE RESTRICT
);

CREATE TABLE question_options (
    id uuid NOT NULL,
    question_id uuid NOT NULL,
    content text NOT NULL,
    is_correct boolean NOT NULL,
    sort_order integer NOT NULL,
    created_at timestamptz NOT NULL,
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT "PK_question_options" PRIMARY KEY (id),
    CONSTRAINT "FK_question_options_questions_question_id" FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE RESTRICT
);

CREATE TABLE assessment_answers (
    id uuid NOT NULL,
    attempt_id uuid NOT NULL,
    question_id uuid NOT NULL,
    selected_option_id uuid,
    answer_text text,
    is_correct boolean,
    score_awarded numeric(6,2),
    graded_by_user_id uuid,
    created_at timestamptz NOT NULL,
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT "PK_assessment_answers" PRIMARY KEY (id),
    CONSTRAINT "FK_assessment_answers_assessment_attempts_attempt_id" FOREIGN KEY (attempt_id) REFERENCES assessment_attempts (id) ON DELETE RESTRICT,
    CONSTRAINT "FK_assessment_answers_questions_question_id" FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE RESTRICT
);

CREATE TABLE certificates (
    id uuid NOT NULL,
    employee_id uuid NOT NULL,
    course_id uuid NOT NULL,
    assessment_attempt_id uuid,
    certificate_template_id uuid NOT NULL,
    certificate_code character varying(120) NOT NULL,
    qr_url text NOT NULL,
    status character varying(30) NOT NULL,
    issued_at timestamptz NOT NULL,
    expires_at timestamptz,
    revoked_at timestamptz,
    revoked_reason text,
    pdf_file_object_id uuid,
    created_at timestamptz NOT NULL,
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT "PK_certificates" PRIMARY KEY (id),
    CONSTRAINT "FK_certificates_certificate_templates_certificate_template_id" FOREIGN KEY (certificate_template_id) REFERENCES certificate_templates (id) ON DELETE RESTRICT,
    CONSTRAINT "FK_certificates_courses_course_id" FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
    CONSTRAINT "FK_certificates_employees_employee_id" FOREIGN KEY (employee_id) REFERENCES employees ("Id") ON DELETE CASCADE
);

CREATE TABLE competency_evidences (
    "Id" uuid NOT NULL,
    "EmployeeId" uuid NOT NULL,
    "CompetencyId" uuid NOT NULL,
    "EvidenceType" character varying(30) NOT NULL,
    "SourceEntityType" character varying(80) NOT NULL,
    "SourceEntityId" uuid NOT NULL,
    "EvidenceScore" numeric(5,2),
    "ConfirmedLevelValue" integer,
    "VerifiedByUserId" uuid,
    "Status" character varying(30) NOT NULL,
    "Notes" text,
    "CreatedAt" timestamptz NOT NULL,
    "CreatedBy" uuid,
    "UpdatedAt" timestamptz,
    "UpdatedBy" uuid,
    CONSTRAINT "PK_competency_evidences" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_competency_evidences_competencies_CompetencyId" FOREIGN KEY ("CompetencyId") REFERENCES competencies ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_competency_evidences_employees_EmployeeId" FOREIGN KEY ("EmployeeId") REFERENCES employees ("Id") ON DELETE RESTRICT
);

CREATE TABLE enrollments (
    id uuid NOT NULL,
    course_id uuid NOT NULL,
    employee_id uuid NOT NULL,
    course_assignment_id uuid,
    status character varying(30) NOT NULL,
    progress_percentage numeric(5,2) NOT NULL,
    started_at timestamptz,
    completed_at timestamptz,
    due_date date,
    created_at timestamptz NOT NULL,
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT "PK_enrollments" PRIMARY KEY (id),
    CONSTRAINT "FK_enrollments_courses_course_id" FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE RESTRICT,
    CONSTRAINT "FK_enrollments_employees_employee_id" FOREIGN KEY (employee_id) REFERENCES employees ("Id") ON DELETE CASCADE
);

CREATE TABLE task_assignments (
    id uuid NOT NULL,
    task_id uuid NOT NULL,
    employee_id uuid NOT NULL,
    assigned_by_user_id uuid NOT NULL,
    manager_employee_id uuid,
    deadline timestamptz,
    status character varying(30) NOT NULL,
    progress_percent numeric(5,2) NOT NULL,
    assigned_at timestamptz NOT NULL,
    created_at timestamptz NOT NULL,
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT "PK_task_assignments" PRIMARY KEY (id),
    CONSTRAINT "FK_task_assignments_employees_employee_id" FOREIGN KEY (employee_id) REFERENCES employees ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_task_assignments_practical_tasks_task_id" FOREIGN KEY (task_id) REFERENCES practical_tasks (id) ON DELETE RESTRICT
);

CREATE TABLE employee_competency_profiles (
    "Id" uuid NOT NULL,
    "EmployeeId" uuid NOT NULL,
    "CompetencyId" uuid NOT NULL,
    "CurrentLevelValue" integer NOT NULL,
    "ConfidenceScore" numeric(5,2),
    "LastEvidenceId" uuid,
    "LastEvaluatedAt" timestamptz,
    "UpdatedBy" uuid,
    "CreatedAt" timestamptz NOT NULL,
    "CreatedBy" uuid,
    "UpdatedAt" timestamptz,
    CONSTRAINT "PK_employee_competency_profiles" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_employee_competency_profiles_competencies_CompetencyId" FOREIGN KEY ("CompetencyId") REFERENCES competencies ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_employee_competency_profiles_competency_evidences_LastEvide~" FOREIGN KEY ("LastEvidenceId") REFERENCES competency_evidences ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_employee_competency_profiles_employees_EmployeeId" FOREIGN KEY ("EmployeeId") REFERENCES employees ("Id") ON DELETE RESTRICT
);

CREATE TABLE lesson_progress (
    id uuid NOT NULL,
    enrollment_id uuid NOT NULL,
    lesson_id uuid NOT NULL,
    status character varying(30) NOT NULL,
    progress_percent numeric(5,2) NOT NULL,
    last_accessed_at timestamptz,
    completed_at timestamptz,
    created_at timestamptz NOT NULL,
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT "PK_lesson_progress" PRIMARY KEY (id),
    CONSTRAINT "FK_lesson_progress_enrollments_enrollment_id" FOREIGN KEY (enrollment_id) REFERENCES enrollments (id) ON DELETE RESTRICT
);

CREATE TABLE task_evaluations (
    id uuid NOT NULL,
    task_assignment_id uuid NOT NULL,
    evaluator_user_id uuid NOT NULL,
    task_score numeric(5,2) NOT NULL,
    feedback text,
    confirmed_competency_id uuid NOT NULL,
    confirmed_level_value integer,
    evaluation_status character varying(30) NOT NULL,
    evaluated_at timestamptz NOT NULL,
    created_at timestamptz NOT NULL,
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT "PK_task_evaluations" PRIMARY KEY (id),
    CONSTRAINT "FK_task_evaluations_task_assignments_task_assignment_id" FOREIGN KEY (task_assignment_id) REFERENCES task_assignments (id) ON DELETE RESTRICT
);

CREATE TABLE task_submissions (
    id uuid NOT NULL,
    task_assignment_id uuid NOT NULL,
    submitted_by_user_id uuid NOT NULL,
    submission_text text,
    file_object_id uuid,
    submitted_at timestamptz NOT NULL,
    status character varying(30) NOT NULL,
    created_at timestamptz NOT NULL,
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT "PK_task_submissions" PRIMARY KEY (id),
    CONSTRAINT "FK_task_submissions_task_assignments_task_assignment_id" FOREIGN KEY (task_assignment_id) REFERENCES task_assignments (id) ON DELETE RESTRICT
);

CREATE INDEX "IX_assessment_answers_attempt_id" ON assessment_answers (attempt_id);

CREATE INDEX "IX_assessment_answers_question_id" ON assessment_answers (question_id);

CREATE INDEX "IX_assessment_attempts_assessment_id" ON assessment_attempts (assessment_id);

CREATE INDEX ix_attempts_employee_assessment ON assessment_attempts (employee_id, assessment_id);

CREATE INDEX "IX_assessment_questions_question_id" ON assessment_questions (question_id);

CREATE INDEX "IX_assessments_course_id" ON assessments (course_id);

CREATE INDEX ix_audit_actor ON audit_logs (actor_user_id);

CREATE INDEX ix_audit_entity ON audit_logs (entity_type, entity_id);

CREATE INDEX ix_cert_employee_status ON certificates (employee_id, status);

CREATE INDEX "IX_certificates_certificate_template_id" ON certificates (certificate_template_id);

CREATE INDEX "IX_certificates_course_id" ON certificates (course_id);

CREATE INDEX ix_certificates_expires_at ON certificates (expires_at);

CREATE UNIQUE INDEX ux_certificates_code ON certificates (certificate_code);

CREATE UNIQUE INDEX ux_competencies_category_code ON competencies ("CategoryId", "Code");

CREATE UNIQUE INDEX ux_competency_categories_org_code ON competency_categories ("OrganizationId", "Code");

CREATE INDEX "IX_competency_evidences_CompetencyId" ON competency_evidences ("CompetencyId");

CREATE INDEX ix_evidence_employee_competency ON competency_evidences ("EmployeeId", "CompetencyId");

CREATE INDEX "IX_course_assignments_course_id" ON course_assignments (course_id);

CREATE INDEX "IX_course_competencies_competency_id" ON course_competencies (competency_id);

CREATE INDEX "IX_course_modules_course_id" ON course_modules (course_id);

CREATE UNIQUE INDEX ux_courses_org_code ON courses (organization_id, code);

CREATE INDEX "IX_departments_ParentDepartmentId" ON departments ("ParentDepartmentId");

CREATE UNIQUE INDEX ux_departments_org_code ON departments ("OrganizationId", "Code");

CREATE INDEX "IX_employee_competency_profiles_CompetencyId" ON employee_competency_profiles ("CompetencyId");

CREATE INDEX "IX_employee_competency_profiles_LastEvidenceId" ON employee_competency_profiles ("LastEvidenceId");

CREATE UNIQUE INDEX ux_employee_competency ON employee_competency_profiles ("EmployeeId", "CompetencyId");

CREATE INDEX ix_employees_department ON employees ("DepartmentId");

CREATE INDEX "IX_employees_DirectManagerId" ON employees ("DirectManagerId");

CREATE INDEX "IX_employees_JobPositionId" ON employees ("JobPositionId");

CREATE UNIQUE INDEX ix_employees_user_id ON employees ("UserId");

CREATE UNIQUE INDEX ux_employees_org_code ON employees ("OrganizationId", "EmployeeCode");

CREATE INDEX "IX_enrollments_employee_id" ON enrollments (employee_id);

CREATE UNIQUE INDEX ux_enrollment_course_employee ON enrollments (course_id, employee_id);

CREATE UNIQUE INDEX ux_file_objects_object_key ON file_objects (object_key);

CREATE UNIQUE INDEX ux_positions_org_code ON job_positions ("OrganizationId", "Code");

CREATE INDEX "IX_learning_materials_course_id" ON learning_materials (course_id);

CREATE UNIQUE INDEX ux_lesson_progress ON lesson_progress (enrollment_id, lesson_id);

CREATE INDEX "IX_lessons_module_id" ON lessons (module_id);

CREATE INDEX ix_notifications_recipient_isread ON notifications (recipient_user_id, is_read);

CREATE UNIQUE INDEX ux_organizations_code ON organizations ("Code");

CREATE UNIQUE INDEX ux_permissions_code ON permissions ("Code");

CREATE INDEX "IX_position_competency_requirements_CompetencyId" ON position_competency_requirements ("CompetencyId");

CREATE UNIQUE INDEX ux_position_competency_requirements_position_competency ON position_competency_requirements ("JobPositionId", "CompetencyId");

CREATE INDEX "IX_question_options_question_id" ON question_options (question_id);

CREATE INDEX "IX_questions_bank_id" ON questions (bank_id);

CREATE INDEX ix_readiness_employee_generated ON readiness_scores (employee_id, generated_at);

CREATE INDEX "IX_refresh_tokens_ReplacedByTokenId" ON refresh_tokens ("ReplacedByTokenId");

CREATE INDEX "IX_refresh_tokens_UserId" ON refresh_tokens ("UserId");

CREATE UNIQUE INDEX ux_refresh_tokens_token_hash ON refresh_tokens ("TokenHash");

CREATE INDEX "IX_role_permissions_PermissionId" ON role_permissions ("PermissionId");

CREATE UNIQUE INDEX ux_roles_code ON roles ("Code");

CREATE INDEX "IX_scoring_config_items_scoring_config_id" ON scoring_config_items (scoring_config_id);

CREATE INDEX "IX_skill_gap_items_skill_gap_result_id" ON skill_gap_items (skill_gap_result_id);

CREATE INDEX ix_task_assign_employee_status ON task_assignments (employee_id, status);

CREATE INDEX "IX_task_assignments_task_id" ON task_assignments (task_id);

CREATE INDEX "IX_task_evaluations_task_assignment_id" ON task_evaluations (task_assignment_id);

CREATE INDEX "IX_task_submissions_task_assignment_id" ON task_submissions (task_assignment_id);

CREATE INDEX ix_risk_enrollment_generated ON training_risk_scores (enrollment_id, generated_at);

CREATE INDEX "IX_user_roles_RoleId" ON user_roles ("RoleId");

CREATE UNIQUE INDEX ux_users_email ON users ("Email");

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260624184131_InitialCreate', '10.0.9');

COMMIT;

