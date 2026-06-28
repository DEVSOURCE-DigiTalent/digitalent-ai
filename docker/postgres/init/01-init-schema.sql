-- DigiTalent AI - Database Schema Initialization
-- Auto-executed by PostgreSQL on first container start
-- Generated from EF Core Migration: InitialCreate

-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. Auth & RBAC
-- ============================================================

CREATE TABLE users (
    id uuid NOT NULL,
    email character varying(255) NOT NULL,
    password_hash text NOT NULL,
    full_name character varying(255) NOT NULL,
    avatar_url text,
    status character varying(30) NOT NULL,
    email_verified_at timestamptz,
    last_login_at timestamptz,
    failed_login_count integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT pk_users PRIMARY KEY (id)
);

CREATE TABLE roles (
    id uuid NOT NULL,
    code character varying(80) NOT NULL,
    name character varying(120) NOT NULL,
    description text,
    scope_type character varying(30) NOT NULL,
    is_system_role boolean NOT NULL DEFAULT false,
    status character varying(30) NOT NULL DEFAULT 'ACTIVE',
    created_at timestamptz NOT NULL DEFAULT NOW(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT pk_roles PRIMARY KEY (id)
);

CREATE TABLE permissions (
    id uuid NOT NULL,
    code character varying(120) NOT NULL,
    module character varying(80) NOT NULL,
    action character varying(80) NOT NULL,
    description text,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT pk_permissions PRIMARY KEY (id)
);

CREATE TABLE user_roles (
    user_id uuid NOT NULL,
    role_id uuid NOT NULL,
    assigned_by uuid,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT pk_user_roles PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_roles_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_user_roles_roles FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
);

CREATE TABLE role_permissions (
    role_id uuid NOT NULL,
    permission_id uuid NOT NULL,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT pk_role_permissions PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_role_permissions_roles FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
    CONSTRAINT fk_role_permissions_permissions FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

CREATE TABLE refresh_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_hash text NOT NULL,
    expires_at timestamptz NOT NULL,
    revoked_at timestamptz,
    replaced_by_token_id uuid,
    ip_address character varying(64),
    user_agent text,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT pk_refresh_tokens PRIMARY KEY (id),
    CONSTRAINT fk_refresh_tokens_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_refresh_tokens_replaced_by FOREIGN KEY (replaced_by_token_id) REFERENCES refresh_tokens(id) ON DELETE RESTRICT
);

-- ============================================================
-- 2. Organization
-- ============================================================

CREATE TABLE organizations (
    id uuid NOT NULL,
    code character varying(80) NOT NULL,
    name character varying(255) NOT NULL,
    domain character varying(255),
    status character varying(30) NOT NULL DEFAULT 'ACTIVE',
    created_at timestamptz NOT NULL DEFAULT NOW(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT pk_organizations PRIMARY KEY (id)
);

CREATE TABLE departments (
    id uuid NOT NULL,
    organization_id uuid NOT NULL,
    parent_department_id uuid,
    manager_employee_id uuid,
    code character varying(80) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    status character varying(30) NOT NULL DEFAULT 'ACTIVE',
    created_at timestamptz NOT NULL DEFAULT NOW(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT pk_departments PRIMARY KEY (id),
    CONSTRAINT fk_departments_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE RESTRICT,
    CONSTRAINT fk_departments_parent FOREIGN KEY (parent_department_id) REFERENCES departments(id) ON DELETE RESTRICT
);

CREATE TABLE job_positions (
    id uuid NOT NULL,
    organization_id uuid NOT NULL,
    department_id uuid,
    code character varying(80) NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    level_name character varying(80),
    status character varying(30) NOT NULL DEFAULT 'ACTIVE',
    created_at timestamptz NOT NULL DEFAULT NOW(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT pk_job_positions PRIMARY KEY (id),
    CONSTRAINT fk_job_positions_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE RESTRICT
);

CREATE TABLE employees (
    id uuid NOT NULL,
    organization_id uuid NOT NULL,
    user_id uuid,
    department_id uuid NOT NULL,
    job_position_id uuid NOT NULL,
    direct_manager_id uuid,
    employee_code character varying(80) NOT NULL,
    full_name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(50),
    employment_status character varying(30) NOT NULL DEFAULT 'ACTIVE',
    joined_at date,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT pk_employees PRIMARY KEY (id),
    CONSTRAINT fk_employees_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE RESTRICT,
    CONSTRAINT fk_employees_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_employees_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
    CONSTRAINT fk_employees_job_position FOREIGN KEY (job_position_id) REFERENCES job_positions(id) ON DELETE RESTRICT,
    CONSTRAINT fk_employees_manager FOREIGN KEY (direct_manager_id) REFERENCES employees(id) ON DELETE RESTRICT
);

-- ============================================================
-- 3. Competency
-- ============================================================

CREATE TABLE competency_categories (
    id uuid NOT NULL,
    organization_id uuid NOT NULL,
    code character varying(80) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    sort_order integer NOT NULL DEFAULT 0,
    status character varying(30) NOT NULL DEFAULT 'ACTIVE',
    created_at timestamptz NOT NULL DEFAULT NOW(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT pk_competency_categories PRIMARY KEY (id)
);

CREATE TABLE competencies (
    id uuid NOT NULL,
    category_id uuid NOT NULL,
    code character varying(80) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    status character varying(30) NOT NULL DEFAULT 'ACTIVE',
    created_at timestamptz NOT NULL DEFAULT NOW(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT pk_competencies PRIMARY KEY (id),
    CONSTRAINT fk_competencies_category FOREIGN KEY (category_id) REFERENCES competency_categories(id) ON DELETE RESTRICT
);

CREATE TABLE competency_levels (
    id uuid NOT NULL,
    organization_id uuid NOT NULL,
    level_value integer NOT NULL,
    name character varying(120) NOT NULL,
    description text,
    achievement_criteria text,
    status character varying(30) NOT NULL DEFAULT 'ACTIVE',
    created_at timestamptz NOT NULL DEFAULT NOW(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT pk_competency_levels PRIMARY KEY (id)
);

CREATE TABLE position_competency_requirements (
    id uuid NOT NULL,
    job_position_id uuid NOT NULL,
    competency_id uuid NOT NULL,
    required_level_value integer NOT NULL,
    weight numeric(5,2) NOT NULL,
    is_mandatory boolean NOT NULL DEFAULT false,
    effective_from date,
    effective_to date,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT pk_position_competency_requirements PRIMARY KEY (id),
    CONSTRAINT fk_pcr_job_position FOREIGN KEY (job_position_id) REFERENCES job_positions(id) ON DELETE RESTRICT,
    CONSTRAINT fk_pcr_competency FOREIGN KEY (competency_id) REFERENCES competencies(id) ON DELETE RESTRICT
);

CREATE TABLE employee_competency_profiles (
    id uuid NOT NULL,
    employee_id uuid NOT NULL,
    competency_id uuid NOT NULL,
    current_level_value integer NOT NULL,
    confidence_score numeric(5,2),
    last_evidence_id uuid,
    last_evaluated_at timestamptz,
    updated_by uuid,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    created_by uuid,
    updated_at timestamptz,
    CONSTRAINT pk_employee_competency_profiles PRIMARY KEY (id),
    CONSTRAINT fk_ecp_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE RESTRICT,
    CONSTRAINT fk_ecp_competency FOREIGN KEY (competency_id) REFERENCES competencies(id) ON DELETE RESTRICT
);

CREATE TABLE competency_evidences (
    id uuid NOT NULL,
    employee_id uuid NOT NULL,
    competency_id uuid NOT NULL,
    evidence_type character varying(30) NOT NULL,
    source_entity_type character varying(80) NOT NULL,
    source_entity_id uuid NOT NULL,
    evidence_score numeric(5,2),
    confirmed_level_value integer,
    verified_by_user_id uuid,
    status character varying(30) NOT NULL DEFAULT 'PENDING',
    notes text,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT pk_competency_evidences PRIMARY KEY (id),
    CONSTRAINT fk_ce_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE RESTRICT,
    CONSTRAINT fk_ce_competency FOREIGN KEY (competency_id) REFERENCES competencies(id) ON DELETE RESTRICT
);
-- ============================================================
-- 4. Learning
-- ============================================================

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
    status character varying(30) NOT NULL DEFAULT 'DRAFT',
    created_at timestamptz NOT NULL DEFAULT NOW(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT pk_courses PRIMARY KEY (id)
);

CREATE TABLE course_modules (
    id uuid NOT NULL,
    course_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    sort_order integer NOT NULL DEFAULT 0,
    status character varying(30) NOT NULL DEFAULT 'ACTIVE',
    created_at timestamptz NOT NULL DEFAULT NOW(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT pk_course_modules PRIMARY KEY (id),
    CONSTRAINT fk_course_modules_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE RESTRICT
);

CREATE TABLE lessons (
    id uuid NOT NULL,
    module_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    content_type character varying(30) NOT NULL DEFAULT 'TEXT',
    content_body text,
    estimated_minutes integer,
    sort_order integer NOT NULL DEFAULT 0,
    is_required boolean NOT NULL DEFAULT true,
    status character varying(30) NOT NULL DEFAULT 'DRAFT',
    created_at timestamptz NOT NULL DEFAULT NOW(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT pk_lessons PRIMARY KEY (id),
    CONSTRAINT fk_lessons_module FOREIGN KEY (module_id) REFERENCES course_modules(id) ON DELETE RESTRICT
);

CREATE TABLE learning_materials (
    id uuid NOT NULL,
    course_id uuid,
    lesson_id uuid,
    file_object_id uuid,
    material_type character varying(30) NOT NULL,
    external_url text,
    title character varying(255) NOT NULL,
    sort_order integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT pk_learning_materials PRIMARY KEY (id)
);

CREATE TABLE course_competencies (
    course_id uuid NOT NULL,
    competency_id uuid NOT NULL,
    target_level_value integer,
    coverage_weight numeric(5,2) NOT NULL,
    notes text,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT pk_course_competencies PRIMARY KEY (course_id, competency_id),
    CONSTRAINT fk_cc_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE RESTRICT,
    CONSTRAINT fk_cc_competency FOREIGN KEY (competency_id) REFERENCES competencies(id) ON DELETE RESTRICT
);

CREATE TABLE course_assignments (
    id uuid NOT NULL,
    course_id uuid NOT NULL,
    assignment_type character varying(30) NOT NULL DEFAULT 'EMPLOYEE',
    target_employee_id uuid,
    target_department_id uuid,
    target_job_position_id uuid,
    assigned_by_user_id uuid NOT NULL,
    due_date date,
    status character varying(30) NOT NULL DEFAULT 'ACTIVE',
    created_at timestamptz NOT NULL DEFAULT NOW(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT pk_course_assignments PRIMARY KEY (id),
    CONSTRAINT fk_course_assignments_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE RESTRICT
);

CREATE TABLE enrollments (
    id uuid NOT NULL,
    course_id uuid NOT NULL,
    employee_id uuid NOT NULL,
    course_assignment_id uuid,
    status character varying(30) NOT NULL DEFAULT 'ASSIGNED',
    progress_percentage numeric(5,2) NOT NULL DEFAULT 0,
    started_at timestamptz,
    completed_at timestamptz,
    due_date date,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT pk_enrollments PRIMARY KEY (id),
    CONSTRAINT fk_enrollments_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE RESTRICT,
    CONSTRAINT fk_enrollments_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE TABLE lesson_progress (
    id uuid NOT NULL,
    enrollment_id uuid NOT NULL,
    lesson_id uuid NOT NULL,
    status character varying(30) NOT NULL DEFAULT 'NOT_STARTED',
    progress_percent numeric(5,2) NOT NULL DEFAULT 0,
    last_accessed_at timestamptz,
    completed_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT pk_lesson_progress PRIMARY KEY (id),
    CONSTRAINT fk_lesson_progress_enrollment FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE RESTRICT
);

-- ============================================================
-- 5. Assessment
-- ============================================================

CREATE TABLE question_banks (
    id uuid NOT NULL,
    organization_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    owner_trainer_id uuid,
    status character varying(30) NOT NULL DEFAULT 'ACTIVE',
    created_at timestamptz NOT NULL DEFAULT NOW(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT pk_question_banks PRIMARY KEY (id)
);

CREATE TABLE questions (
    id uuid NOT NULL,
    bank_id uuid NOT NULL,
    competency_id uuid,
    question_type character varying(30) NOT NULL DEFAULT 'SINGLE_CHOICE',
    difficulty character varying(30),
    content text NOT NULL,
    explanation text,
    ai_generated_flag boolean NOT NULL DEFAULT false,
    status character varying(30) NOT NULL DEFAULT 'DRAFT',
    created_at timestamptz NOT NULL DEFAULT NOW(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT pk_questions PRIMARY KEY (id),
    CONSTRAINT fk_questions_bank FOREIGN KEY (bank_id) REFERENCES question_banks(id) ON DELETE RESTRICT
);

CREATE TABLE question_options (
    id uuid NOT NULL,
    question_id uuid NOT NULL,
    content text NOT NULL,
    is_correct boolean NOT NULL DEFAULT false,
    sort_order integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT pk_question_options PRIMARY KEY (id),
    CONSTRAINT fk_question_options_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE RESTRICT
);

CREATE TABLE assessments (
    id uuid NOT NULL,
    course_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    assessment_type character varying(30) NOT NULL DEFAULT 'QUIZ',
    time_limit_minutes integer,
    max_attempts integer,
    passing_score numeric(5,2) NOT NULL,
    status character varying(30) NOT NULL DEFAULT 'DRAFT',
    created_at timestamptz NOT NULL DEFAULT NOW(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT pk_assessments PRIMARY KEY (id),
    CONSTRAINT fk_assessments_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE RESTRICT
);

CREATE TABLE assessment_questions (
    assessment_id uuid NOT NULL,
    question_id uuid NOT NULL,
    score_weight numeric(6,2) NOT NULL,
    sort_order integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT pk_assessment_questions PRIMARY KEY (assessment_id, question_id),
    CONSTRAINT fk_aq_assessment FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE RESTRICT,
    CONSTRAINT fk_aq_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE RESTRICT
);

CREATE TABLE assessment_attempts (
    id uuid NOT NULL,
    assessment_id uuid NOT NULL,
    enrollment_id uuid NOT NULL,
    employee_id uuid NOT NULL,
    attempt_no integer NOT NULL,
    status character varying(30) NOT NULL DEFAULT 'IN_PROGRESS',
    started_at timestamptz NOT NULL,
    submitted_at timestamptz,
    score numeric(6,2),
    passed boolean,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT pk_assessment_attempts PRIMARY KEY (id),
    CONSTRAINT fk_aa_assessment FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE RESTRICT
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
    created_at timestamptz NOT NULL DEFAULT NOW(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT pk_assessment_answers PRIMARY KEY (id),
    CONSTRAINT fk_aan_attempt FOREIGN KEY (attempt_id) REFERENCES assessment_attempts(id) ON DELETE RESTRICT,
    CONSTRAINT fk_aan_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE RESTRICT
);

-- ============================================================
-- 6. Certificate
-- ============================================================

CREATE TABLE certificate_templates (
    id uuid NOT NULL,
    organization_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    template_html text NOT NULL,
    background_file_object_id uuid,
    status character varying(30) NOT NULL DEFAULT 'DRAFT',
    created_by_user_id uuid,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT pk_certificate_templates PRIMARY KEY (id)
);

CREATE TABLE certificates (
    id uuid NOT NULL,
    employee_id uuid NOT NULL,
    course_id uuid NOT NULL,
    assessment_attempt_id uuid,
    certificate_template_id uuid NOT NULL,
    certificate_code character varying(120) NOT NULL,
    qr_url text NOT NULL,
    status character varying(30) NOT NULL DEFAULT 'VALID',
    issued_at timestamptz NOT NULL,
    expires_at timestamptz,
    revoked_at timestamptz,
    revoked_reason text,
    pdf_file_object_id uuid,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT pk_certificates PRIMARY KEY (id),
    CONSTRAINT fk_certificates_template FOREIGN KEY (certificate_template_id) REFERENCES certificate_templates(id) ON DELETE RESTRICT,
    CONSTRAINT fk_certificates_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    CONSTRAINT fk_certificates_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE TABLE certificate_verification_logs (
    id uuid NOT NULL,
    certificate_id uuid,
    certificate_code character varying(120) NOT NULL,
    verified_at timestamptz NOT NULL,
    result_status character varying(30) NOT NULL,
    verifier_ip character varying(64),
    user_agent text,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT pk_certificate_verification_logs PRIMARY KEY (id)
);

-- ============================================================
-- 7. Task
-- ============================================================

CREATE TABLE practical_tasks (
    id uuid NOT NULL,
    organization_id uuid NOT NULL,
    related_course_id uuid,
    competency_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    expected_output text NOT NULL,
    evaluation_criteria jsonb NOT NULL,
    source_type character varying(30) NOT NULL DEFAULT 'MANUAL',
    status character varying(30) NOT NULL DEFAULT 'DRAFT',
    created_at timestamptz NOT NULL DEFAULT NOW(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT pk_practical_tasks PRIMARY KEY (id)
);

CREATE TABLE task_assignments (
    id uuid NOT NULL,
    task_id uuid NOT NULL,
    employee_id uuid NOT NULL,
    assigned_by_user_id uuid NOT NULL,
    manager_employee_id uuid,
    deadline timestamptz,
    status character varying(30) NOT NULL DEFAULT 'ASSIGNED',
    progress_percent numeric(5,2) NOT NULL DEFAULT 0,
    assigned_at timestamptz NOT NULL,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT pk_task_assignments PRIMARY KEY (id),
    CONSTRAINT fk_ta_task FOREIGN KEY (task_id) REFERENCES practical_tasks(id) ON DELETE RESTRICT,
    CONSTRAINT fk_ta_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE TABLE task_submissions (
    id uuid NOT NULL,
    task_assignment_id uuid NOT NULL,
    submitted_by_user_id uuid NOT NULL,
    submission_text text,
    file_object_id uuid,
    submitted_at timestamptz NOT NULL,
    status character varying(30) NOT NULL DEFAULT 'SUBMITTED',
    created_at timestamptz NOT NULL DEFAULT NOW(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT pk_task_submissions PRIMARY KEY (id),
    CONSTRAINT fk_ts_assignment FOREIGN KEY (task_assignment_id) REFERENCES task_assignments(id) ON DELETE RESTRICT
);

CREATE TABLE task_evaluations (
    id uuid NOT NULL,
    task_assignment_id uuid NOT NULL,
    evaluator_user_id uuid NOT NULL,
    task_score numeric(5,2) NOT NULL,
    feedback text,
    confirmed_competency_id uuid NOT NULL,
    confirmed_level_value integer,
    evaluation_status character varying(30) NOT NULL DEFAULT 'PASSED',
    evaluated_at timestamptz NOT NULL,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT pk_task_evaluations PRIMARY KEY (id),
    CONSTRAINT fk_te_assignment FOREIGN KEY (task_assignment_id) REFERENCES task_assignments(id) ON DELETE RESTRICT
);

-- ============================================================
-- 8. Intelligence
-- ============================================================

CREATE TABLE skill_gap_results (
    id uuid NOT NULL,
    employee_id uuid NOT NULL,
    job_position_id uuid NOT NULL,
    overall_gap_score numeric(6,2) NOT NULL,
    generated_at timestamptz NOT NULL,
    generated_by character varying(30) NOT NULL DEFAULT 'SYSTEM',
    snapshot_json jsonb,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT pk_skill_gap_results PRIMARY KEY (id)
);

CREATE TABLE skill_gap_items (
    id uuid NOT NULL,
    skill_gap_result_id uuid NOT NULL,
    competency_id uuid NOT NULL,
    required_level_value integer NOT NULL,
    current_level_value integer NOT NULL,
    gap_level integer NOT NULL,
    priority character varying(30) NOT NULL DEFAULT 'LOW',
    recommended_action text,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT pk_skill_gap_items PRIMARY KEY (id),
    CONSTRAINT fk_sgi_result FOREIGN KEY (skill_gap_result_id) REFERENCES skill_gap_results(id) ON DELETE RESTRICT
);

CREATE TABLE learning_recommendations (
    id uuid NOT NULL,
    employee_id uuid NOT NULL,
    source_skill_gap_result_id uuid,
    course_id uuid NOT NULL,
    priority_score numeric(6,2) NOT NULL,
    reason text NOT NULL,
    status character varying(30) NOT NULL DEFAULT 'NEW',
    created_at timestamptz NOT NULL DEFAULT NOW(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT pk_learning_recommendations PRIMARY KEY (id)
);

CREATE TABLE training_risk_scores (
    id uuid NOT NULL,
    enrollment_id uuid NOT NULL,
    employee_id uuid NOT NULL,
    risk_score numeric(5,2) NOT NULL,
    risk_level character varying(30) NOT NULL DEFAULT 'LOW',
    inactivity_score numeric(5,2) NOT NULL,
    low_score_rate numeric(5,2) NOT NULL,
    deadline_pressure numeric(5,2) NOT NULL,
    failed_attempt_rate numeric(5,2) NOT NULL,
    progress_delay numeric(5,2) NOT NULL,
    generated_at timestamptz NOT NULL,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT pk_training_risk_scores PRIMARY KEY (id)
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
    readiness_level character varying(30) NOT NULL DEFAULT 'NOT_READY',
    generated_at timestamptz NOT NULL,
    snapshot_json jsonb,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT pk_readiness_scores PRIMARY KEY (id)
);

CREATE TABLE promotion_readiness_results (
    id uuid NOT NULL,
    employee_id uuid NOT NULL,
    target_job_position_id uuid NOT NULL,
    readiness_percent numeric(5,2) NOT NULL,
    missing_weight numeric(6,2) NOT NULL,
    recommendation_text text,
    generated_at timestamptz NOT NULL,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT pk_promotion_readiness_results PRIMARY KEY (id)
);

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
    created_at timestamptz NOT NULL DEFAULT NOW(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT pk_ai_explanation_logs PRIMARY KEY (id)
);

-- ============================================================
-- 9. Shared
-- ============================================================

CREATE TABLE file_objects (
    id uuid NOT NULL,
    bucket_name character varying(120) NOT NULL,
    object_key text NOT NULL,
    original_file_name character varying(255) NOT NULL,
    content_type character varying(120) NOT NULL,
    file_size_bytes bigint NOT NULL,
    checksum_sha256 character varying(128),
    access_level character varying(30) NOT NULL DEFAULT 'PRIVATE',
    related_entity_type character varying(80),
    related_entity_id uuid,
    uploaded_by_user_id uuid,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT pk_file_objects PRIMARY KEY (id)
);

CREATE TABLE notifications (
    id uuid NOT NULL,
    recipient_user_id uuid NOT NULL,
    type character varying(80) NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    related_entity_type character varying(80),
    related_entity_id uuid,
    is_read boolean NOT NULL DEFAULT false,
    read_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT pk_notifications PRIMARY KEY (id)
);

CREATE TABLE notification_preferences (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    notification_type character varying(80) NOT NULL,
    in_app_enabled boolean NOT NULL DEFAULT true,
    email_enabled boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT pk_notification_preferences PRIMARY KEY (id)
);

CREATE TABLE scoring_configs (
    id uuid NOT NULL,
    organization_id uuid NOT NULL,
    config_type character varying(80) NOT NULL,
    version integer NOT NULL,
    is_active boolean NOT NULL,
    description text,
    created_by_user_id uuid,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT pk_scoring_configs PRIMARY KEY (id)
);

CREATE TABLE scoring_config_items (
    id uuid NOT NULL,
    scoring_config_id uuid NOT NULL,
    component_code character varying(120) NOT NULL,
    weight numeric(6,4) NOT NULL,
    min_value numeric(8,2),
    max_value numeric(8,2),
    notes text,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT pk_scoring_config_items PRIMARY KEY (id),
    CONSTRAINT fk_sci_config FOREIGN KEY (scoring_config_id) REFERENCES scoring_configs(id) ON DELETE RESTRICT
);

CREATE TABLE system_settings (
    id uuid NOT NULL,
    organization_id uuid,
    setting_key character varying(120) NOT NULL,
    setting_value jsonb NOT NULL,
    description text,
    updated_by_user_id uuid,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT pk_system_settings PRIMARY KEY (id)
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
    created_at timestamptz NOT NULL DEFAULT NOW(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    CONSTRAINT pk_audit_logs PRIMARY KEY (id)
);

-- ============================================================
-- Indexes
-- ============================================================

-- Users
CREATE UNIQUE INDEX ux_users_email ON users (email);
CREATE INDEX ix_users_status ON users (status);

-- Roles
CREATE UNIQUE INDEX ux_roles_code ON roles (code);

-- Permissions
CREATE UNIQUE INDEX ux_permissions_code ON permissions (code);

-- User Roles
CREATE INDEX ix_user_roles_role_id ON user_roles (role_id);

-- Role Permissions
CREATE INDEX ix_role_permissions_permission_id ON role_permissions (permission_id);

-- Refresh Tokens
CREATE UNIQUE INDEX ux_refresh_tokens_token_hash ON refresh_tokens (token_hash);
CREATE INDEX ix_refresh_tokens_user_id ON refresh_tokens (user_id);

-- Organizations
CREATE UNIQUE INDEX ux_organizations_code ON organizations (code);

-- Departments
CREATE UNIQUE INDEX ux_departments_org_code ON departments (organization_id, code);
CREATE INDEX ix_departments_parent ON departments (parent_department_id);

-- Job Positions
CREATE UNIQUE INDEX ux_positions_org_code ON job_positions (organization_id, code);

-- Employees
CREATE UNIQUE INDEX ux_employees_org_code ON employees (organization_id, employee_code);
CREATE UNIQUE INDEX ix_employees_user_id ON employees (user_id)
    WHERE user_id IS NOT NULL;
CREATE INDEX ix_employees_department ON employees (department_id);
CREATE INDEX ix_employees_job_position ON employees (job_position_id);
CREATE INDEX ix_employees_manager ON employees (direct_manager_id);

-- Competency
CREATE UNIQUE INDEX ux_competency_categories_org_code ON competency_categories (organization_id, code);
CREATE UNIQUE INDEX ux_competencies_category_code ON competencies (category_id, code);
CREATE UNIQUE INDEX ux_position_competency_req ON position_competency_requirements (job_position_id, competency_id)
    WHERE effective_to IS NULL;
CREATE INDEX ix_pcr_competency ON position_competency_requirements (competency_id);
CREATE UNIQUE INDEX ux_employee_competency ON employee_competency_profiles (employee_id, competency_id);
CREATE INDEX ix_ecp_competency ON employee_competency_profiles (competency_id);
CREATE INDEX ix_ecp_last_evidence ON employee_competency_profiles (last_evidence_id);
CREATE INDEX ix_evidence_employee_competency ON competency_evidences (employee_id, competency_id);
CREATE INDEX ix_evidence_competency ON competency_evidences (competency_id);

-- Learning
CREATE UNIQUE INDEX ux_courses_org_code ON courses (organization_id, code);
CREATE INDEX ix_course_modules_course ON course_modules (course_id);
CREATE INDEX ix_lessons_module ON lessons (module_id);
CREATE INDEX ix_course_competencies_competency ON course_competencies (competency_id);
CREATE INDEX ix_course_assignments_course ON course_assignments (course_id);
CREATE INDEX ix_enrollments_employee ON enrollments (employee_id);
CREATE UNIQUE INDEX ux_enrollment_course_employee ON enrollments (course_id, employee_id);
CREATE UNIQUE INDEX ux_lesson_progress ON lesson_progress (enrollment_id, lesson_id);
CREATE INDEX ix_learning_materials_course ON learning_materials (course_id);

-- Assessment
CREATE INDEX ix_questions_bank ON questions (bank_id);
CREATE INDEX ix_question_options_question ON question_options (question_id);
CREATE INDEX ix_assessments_course ON assessments (course_id);
CREATE INDEX ix_assessment_questions_question ON assessment_questions (question_id);
CREATE INDEX ix_attempts_employee_assessment ON assessment_attempts (employee_id, assessment_id);
CREATE INDEX ix_attempts_assessment ON assessment_attempts (assessment_id);
CREATE INDEX ix_answers_attempt ON assessment_answers (attempt_id);
CREATE INDEX ix_answers_question ON assessment_answers (question_id);

-- Certificate
CREATE UNIQUE INDEX ux_certificates_code ON certificates (certificate_code);
CREATE INDEX ix_certificates_employee_status ON certificates (employee_id, status);
CREATE INDEX ix_certificates_template ON certificates (certificate_template_id);
CREATE INDEX ix_certificates_course ON certificates (course_id);
CREATE INDEX ix_certificates_expires_at ON certificates (expires_at);

-- Task
CREATE INDEX ix_task_assignments_employee_status ON task_assignments (employee_id, status);
CREATE INDEX ix_task_assignments_task ON task_assignments (task_id);
CREATE INDEX ix_task_submissions_assignment ON task_submissions (task_assignment_id);
CREATE INDEX ix_task_evaluations_assignment ON task_evaluations (task_assignment_id);

-- Intelligence
CREATE INDEX ix_skill_gap_items_result ON skill_gap_items (skill_gap_result_id);
CREATE INDEX ix_risk_enrollment_generated ON training_risk_scores (enrollment_id, generated_at);
CREATE INDEX ix_readiness_employee_generated ON readiness_scores (employee_id, generated_at);

-- Shared
CREATE UNIQUE INDEX ux_file_objects_object_key ON file_objects (object_key);
CREATE INDEX ix_notifications_recipient_isread ON notifications (recipient_user_id, is_read);
CREATE INDEX ix_scoring_config_items_config ON scoring_config_items (scoring_config_id);
CREATE INDEX ix_audit_entity ON audit_logs (entity_type, entity_id);
CREATE INDEX ix_audit_actor ON audit_logs (actor_user_id);
