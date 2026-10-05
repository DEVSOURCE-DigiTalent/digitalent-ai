-- ============================================================================
-- DigiTalent AI — Canonical Database Schema v2.3
-- Target: PostgreSQL
-- Source: DigiTalent_AI_Canonical_Database_Design_v2.2 + team decisions 26/09/2026
--
-- This file is the SINGLE SOURCE OF TRUTH for the data model. EF Core entities,
-- configurations and migrations are written to match it; Report 4 Section 2 and
-- docs/07 describe it. Change this file first, then the code and the documents.
--
-- Addendum 2026-10-05 (organization overview page, OW-01) — 3 new tables, 2 new columns:
--   * organizations.setup_completed_at: onboarding state ("setup not finished" banner).
--   * organization_subscriptions (new): current plan, status and seat limit.
--   * training_batches (new): "running training batches" KPI.
--   * audit_logs.entity_label: human-readable target shown in "recent activity".
--   * recommendation_decisions (new): HR decision on a recommended course
--     (pending recommendations KPI = recommended, not enrolled, no open decision).
--
-- Changes v2.2 -> v2.3:
--   * employees.job_position_id is NULLABLE (new hire without a position ->
--     skill gap returns NOT_ASSIGNED).
--   * RBAC stored in roles / user_roles / role_permissions; 5 roles only
--     (SYSTEM_ADMIN, HR_MANAGER, DEPARTMENT_MANAGER, TRAINER, EMPLOYEE).
--     Public certificate verification needs no role.
--   * Every table with a surrogate id has created_at + updated_at (timestamptz,
--     NOT NULL). Join tables with composite keys do not.
--   * CHECK constraints added to all status / level columns that lacked one.
--   * assessments get a stable code; version key = (course_id, code, version_no).
--   * question_banks.owner_trainer_employee_id -> owner_user_id (actors are users).
--   * Indexes added on hot foreign-key paths (PostgreSQL does not index FKs).
--   * Every section is tagged with its delivery phase:
--       Phase 1 Foundation  : organization, identity & access, job architecture
--       Phase 2 Competency  : competency library, requirement sets, skill gap
--       Phase 3 Learning    : courses, assignment, enrollment, assessment, certificate
--       Phase 4 Evidence    : practical tasks, evidence, profile, shared services
--       Optional            : Intelligence extension
--
-- Scope created by this script:
--   * 55 core tables
--   * 4 non-blocking Intelligence extension tables
--   * password_reset_tokens is intentionally NOT created by default (conditional)
--
-- Design principles preserved:
--   * UUID primary keys
--   * CompetencyLevel stored as SMALLINT: BASIC=1, INTERMEDIATE=2, ADVANCED=3
--   * No CareerGrade
--   * Versioned requirements / courses / assessments
--   * Historical certificates, attempts, submissions, evaluations and evidence
--     are protected by normal FK RESTRICT/NO ACTION semantics (no cascading delete)
--   * PostgreSQL partial indexes enforce the critical single-active invariants
--
-- IMPORTANT:
-- Cross-row / cross-aggregate business rules such as Requirement Set activation
-- (9..14 items and SUM(weight_percent)=100), same-organization validation,
-- prerequisite-cycle detection, published-content immutability, all-target evidence
-- finalization and manager-scope authorization remain application transaction rules
-- unless deliberately implemented later using triggers/stronger composite FKs.
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. ORGANIZATION + IDENTITY & ACCESS  [Phase 1]
-- ============================================================================

CREATE TABLE organizations (
    id              uuid PRIMARY KEY,
    code            varchar(50)  NOT NULL UNIQUE,
    name            varchar(200) NOT NULL,
    domain          varchar(255),
    status          varchar(30)  NOT NULL,
    setup_completed_at timestamptz,          -- NULL = onboarding wizard not finished
    created_at      timestamptz  NOT NULL,
    updated_at      timestamptz  NOT NULL,
    CONSTRAINT ck_organizations_status
        CHECK (status IN ('ACTIVE','INACTIVE'))
);

-- One current subscription per organization (plan history is out of scope).
CREATE TABLE organization_subscriptions (
    id               uuid PRIMARY KEY,
    organization_id  uuid NOT NULL UNIQUE REFERENCES organizations(id),
    plan_code        varchar(50)  NOT NULL,
    plan_name        varchar(100) NOT NULL,
    status           varchar(30)  NOT NULL,
    seat_limit       integer,                 -- NULL = unlimited
    renews_at        timestamptz,
    created_at       timestamptz  NOT NULL,
    updated_at       timestamptz  NOT NULL,
    CONSTRAINT ck_organization_subscriptions_status
        CHECK (status IN ('ACTIVE','EXPIRED','PAYMENT_REQUIRED')),
    CONSTRAINT ck_organization_subscriptions_seat_limit
        CHECK (seat_limit IS NULL OR seat_limit > 0)
);

CREATE TABLE users (
    id                  uuid PRIMARY KEY,
    organization_id     uuid REFERENCES organizations(id),
    email               varchar(255) NOT NULL,
    password_hash       text         NOT NULL,
    display_name        varchar(200) NOT NULL,
    avatar_url          text,
    status              varchar(30)  NOT NULL,
    failed_login_count  integer      NOT NULL DEFAULT 0,
    locked_until        timestamptz,
    last_login_at       timestamptz,
    created_at          timestamptz  NOT NULL,
    updated_at          timestamptz  NOT NULL,
    CONSTRAINT ck_users_status
        CHECK (status IN ('ACTIVE','INACTIVE','LOCKED')),
    CONSTRAINT ck_users_failed_login_count
        CHECK (failed_login_count >= 0)
);

CREATE UNIQUE INDEX ux_users_email_normalized
    ON users (lower(email));

CREATE TABLE roles (
    id          uuid PRIMARY KEY,
    code        varchar(80)  NOT NULL UNIQUE,
    name        varchar(120) NOT NULL,
    description text,
    scope_type  varchar(30)  NOT NULL,
    status      varchar(30)  NOT NULL,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ck_roles_scope_type
        CHECK (scope_type IN ('GLOBAL','ORGANIZATION','DEPARTMENT','SELF')),
    CONSTRAINT ck_roles_status
        CHECK (status IN ('ACTIVE','INACTIVE'))
);

CREATE TABLE permissions (
    id          uuid PRIMARY KEY,
    code        varchar(120) NOT NULL UNIQUE,
    module      varchar(80)  NOT NULL,
    action      varchar(80)  NOT NULL,
    description text,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE user_roles (
    user_id             uuid NOT NULL REFERENCES users(id),
    role_id             uuid NOT NULL REFERENCES roles(id),
    assigned_by_user_id uuid REFERENCES users(id),
    assigned_at         timestamptz NOT NULL,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE role_permissions (
    role_id       uuid NOT NULL REFERENCES roles(id),
    permission_id uuid NOT NULL REFERENCES permissions(id),
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE refresh_tokens (
    id                   uuid PRIMARY KEY,
    user_id              uuid NOT NULL REFERENCES users(id),
    token_hash           text NOT NULL UNIQUE,
    expires_at           timestamptz NOT NULL,
    revoked_at           timestamptz,
    replaced_by_token_id uuid REFERENCES refresh_tokens(id),
    ip_hash              varchar(128),
    user_agent           text,
    created_at           timestamptz NOT NULL,
    updated_at           timestamptz NOT NULL DEFAULT now()
);

-- Shared file metadata is created early because learning/certificate/task tables use it.
-- [Phase 3] — first used by learning materials.
CREATE TABLE file_objects (
    id                  uuid PRIMARY KEY,
    organization_id     uuid REFERENCES organizations(id),
    bucket              varchar(100) NOT NULL,
    object_key          varchar(500) NOT NULL UNIQUE,
    original_name       varchar(255) NOT NULL,
    mime_type           varchar(150),
    size_bytes          bigint NOT NULL,
    checksum            varchar(128),
    access_level        varchar(30) NOT NULL,
    uploaded_by_user_id uuid REFERENCES users(id),
    created_at          timestamptz NOT NULL,
    updated_at          timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ck_file_objects_size
        CHECK (size_bytes >= 0),
    CONSTRAINT ck_file_objects_access_level
        CHECK (access_level IN ('PRIVATE','INTERNAL','PUBLIC_VERIFY'))
);

-- ============================================================================
-- 2. ORGANIZATION & JOB ARCHITECTURE  [Phase 1]
-- ============================================================================

CREATE TABLE job_families (
    id              uuid PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES organizations(id),
    code            varchar(50)  NOT NULL,
    name            varchar(180) NOT NULL,
    description     text,
    status          varchar(30)  NOT NULL,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_job_families_org_code UNIQUE (organization_id, code),
    CONSTRAINT ck_job_families_status
        CHECK (status IN ('ACTIVE','INACTIVE','ARCHIVED'))
);

CREATE TABLE job_positions (
    id              uuid PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES organizations(id),
    job_family_id   uuid REFERENCES job_families(id),
    code            varchar(50)  NOT NULL,
    name            varchar(180) NOT NULL,
    description     text,
    status          varchar(30)  NOT NULL,
    created_at      timestamptz  NOT NULL,
    updated_at      timestamptz  NOT NULL,
    CONSTRAINT uq_job_positions_org_code UNIQUE (organization_id, code),
    CONSTRAINT ck_job_positions_status
        CHECK (status IN ('ACTIVE','INACTIVE','ARCHIVED'))
);

-- manager_employee_id is declared now but its FK is added after employees exists.
CREATE TABLE departments (
    id                    uuid PRIMARY KEY,
    organization_id       uuid NOT NULL REFERENCES organizations(id),
    parent_department_id  uuid REFERENCES departments(id),
    manager_employee_id   uuid,
    code                  varchar(50)  NOT NULL,
    name                  varchar(180) NOT NULL,
    description           text,
    status                varchar(30)  NOT NULL,
    created_at            timestamptz  NOT NULL,
    updated_at            timestamptz  NOT NULL,
    CONSTRAINT uq_departments_org_code UNIQUE (organization_id, code),
    CONSTRAINT ck_departments_status
        CHECK (status IN ('ACTIVE','INACTIVE','ARCHIVED')),
    CONSTRAINT ck_departments_not_own_parent
        CHECK (parent_department_id IS NULL OR parent_department_id <> id)
);

CREATE TABLE employees (
    id                 uuid PRIMARY KEY,
    organization_id    uuid NOT NULL REFERENCES organizations(id),
    user_id             uuid UNIQUE REFERENCES users(id),
    department_id       uuid NOT NULL REFERENCES departments(id),
    job_position_id     uuid REFERENCES job_positions(id),   -- NULL = not assigned yet (v2.3)
    direct_manager_id   uuid REFERENCES employees(id),
    employee_code       varchar(50)  NOT NULL,
    full_name           varchar(200) NOT NULL,
    work_email          varchar(255),
    phone               varchar(50),
    status              varchar(30)  NOT NULL,
    joined_at           date,
    created_at          timestamptz  NOT NULL,
    updated_at          timestamptz  NOT NULL,
    CONSTRAINT uq_employees_org_employee_code UNIQUE (organization_id, employee_code),
    CONSTRAINT ck_employees_status
        CHECK (status IN ('ACTIVE','INACTIVE','TRANSFERRED','ARCHIVED')),
    CONSTRAINT ck_employees_not_own_manager
        CHECK (direct_manager_id IS NULL OR direct_manager_id <> id)
);

ALTER TABLE departments
    ADD CONSTRAINT fk_departments_manager_employee
    FOREIGN KEY (manager_employee_id) REFERENCES employees(id);

CREATE UNIQUE INDEX ux_employees_work_email_per_org
    ON employees (organization_id, lower(work_email))
    WHERE work_email IS NOT NULL;

CREATE INDEX ix_employees_job_position
    ON employees (job_position_id);

CREATE INDEX ix_employees_direct_manager
    ON employees (direct_manager_id);

CREATE INDEX ix_departments_parent
    ON departments (parent_department_id);

CREATE INDEX ix_user_roles_role
    ON user_roles (role_id);

CREATE INDEX ix_refresh_tokens_user
    ON refresh_tokens (user_id);

CREATE INDEX ix_employees_department_status
    ON employees (department_id, status);

-- ============================================================================
-- 3. COMPETENCY & REQUIREMENTS  [Phase 2]
-- ============================================================================

CREATE TABLE competency_frameworks (
    id            uuid PRIMARY KEY,
    code          varchar(60)  NOT NULL,
    version       varchar(60)  NOT NULL,
    name          varchar(250) NOT NULL,
    authority     varchar(200),
    jurisdiction  varchar(40),
    source_url    text,
    is_active     boolean NOT NULL DEFAULT true,
    created_at    timestamptz NOT NULL DEFAULT now(),
    updated_at    timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_competency_frameworks_code_version UNIQUE (code, version)
);

CREATE TABLE competency_categories (
    id              uuid PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES organizations(id),
    code            varchar(50)  NOT NULL,
    name            varchar(180) NOT NULL,
    description     text,
    sort_order      integer NOT NULL DEFAULT 0,
    status          varchar(30) NOT NULL DEFAULT 'ACTIVE',
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_competency_categories_org_code UNIQUE (organization_id, code),
    CONSTRAINT ck_competency_categories_status
        CHECK (status IN ('ACTIVE','INACTIVE','ARCHIVED'))
);

CREATE TABLE competencies (
    id               uuid PRIMARY KEY,
    category_id      uuid NOT NULL REFERENCES competency_categories(id),
    code             varchar(80)  NOT NULL,
    name             varchar(200) NOT NULL,
    description      text,
    competency_type  varchar(30)  NOT NULL,
    status           varchar(30)  NOT NULL,
    created_at       timestamptz  NOT NULL,
    updated_at       timestamptz  NOT NULL,
    CONSTRAINT uq_competencies_category_code UNIQUE (category_id, code),
    CONSTRAINT ck_competencies_type
        CHECK (competency_type IN ('CORE_DIGITAL','PROFESSIONAL','INTERNAL','BEHAVIOURAL')),
    CONSTRAINT ck_competencies_status
        CHECK (status IN ('DRAFT','ACTIVE','ARCHIVED'))
);

CREATE TABLE competency_framework_mappings (
    id                  uuid PRIMARY KEY,
    competency_id       uuid NOT NULL REFERENCES competencies(id),
    framework_id        uuid NOT NULL REFERENCES competency_frameworks(id),
    source_area_code    varchar(50),
    source_code         varchar(100) NOT NULL,
    source_name         varchar(250),
    source_level_text   varchar(100),
    relationship        varchar(30) NOT NULL,
    is_primary          boolean NOT NULL DEFAULT false,
    mapping_note        text,
    source_url          text,
    reviewed_by_user_id uuid REFERENCES users(id),
    reviewed_at         timestamptz,
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_competency_framework_mapping
        UNIQUE (competency_id, framework_id, source_code),
    CONSTRAINT ck_competency_framework_mapping_relationship
        CHECK (relationship IN ('DIRECT','STRONG_OVERLAP','PARTIAL_OVERLAP'))
);

CREATE TABLE competency_level_criteria (
    id                   uuid PRIMARY KEY,
    competency_id        uuid NOT NULL REFERENCES competencies(id),
    level                smallint NOT NULL,
    indicator_code       varchar(60) NOT NULL,
    behavior_indicator   text NOT NULL,
    assessment_guidance  text,
    evidence_guidance    text,
    source_note          text,
    sort_order           integer NOT NULL DEFAULT 0,
    created_at           timestamptz NOT NULL DEFAULT now(),
    updated_at           timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_competency_level_criteria
        UNIQUE (competency_id, level, indicator_code),
    CONSTRAINT ck_competency_level_criteria_level
        CHECK (level BETWEEN 1 AND 3)
);

CREATE TABLE position_requirement_sets (
    id                    uuid PRIMARY KEY,
    job_position_id       uuid NOT NULL REFERENCES job_positions(id),
    version_no            integer NOT NULL,
    status                varchar(30) NOT NULL DEFAULT 'DRAFT',
    effective_from        date,
    effective_to          date,
    review_date           date,
    created_by_user_id    uuid NOT NULL REFERENCES users(id),
    activated_by_user_id  uuid REFERENCES users(id),
    activated_at          timestamptz,
    created_at            timestamptz NOT NULL DEFAULT now(),
    updated_at            timestamptz NOT NULL DEFAULT now(),
    row_version           bigint NOT NULL DEFAULT 1,
    CONSTRAINT uq_position_requirement_sets_position_version
        UNIQUE (job_position_id, version_no),
    CONSTRAINT ck_position_requirement_sets_version
        CHECK (version_no > 0),
    CONSTRAINT ck_position_requirement_sets_status
        CHECK (status IN ('DRAFT','ACTIVE','ARCHIVED')),
    CONSTRAINT ck_position_requirement_sets_dates
        CHECK (effective_to IS NULL OR effective_from IS NULL OR effective_to >= effective_from),
    CONSTRAINT ck_position_requirement_sets_row_version
        CHECK (row_version > 0)
);

CREATE UNIQUE INDEX ux_requirement_sets_one_active
    ON position_requirement_sets(job_position_id)
    WHERE status = 'ACTIVE';

CREATE TABLE position_requirement_items (
    id                           uuid PRIMARY KEY,
    requirement_set_id           uuid NOT NULL REFERENCES position_requirement_sets(id),
    competency_id                uuid NOT NULL REFERENCES competencies(id),
    required_level               smallint NOT NULL,
    weight_percent               numeric(5,2) NOT NULL,
    is_mandatory                 boolean NOT NULL DEFAULT true,
    requires_practical_evidence  boolean NOT NULL DEFAULT true,
    note                         text,
    created_at                   timestamptz NOT NULL DEFAULT now(),
    updated_at                   timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_position_requirement_items_set_competency
        UNIQUE (requirement_set_id, competency_id),
    CONSTRAINT ck_position_required_level
        CHECK (required_level BETWEEN 1 AND 3),
    CONSTRAINT ck_position_weight
        CHECK (weight_percent > 0 AND weight_percent <= 100)
);

CREATE INDEX ix_position_requirement_items_competency
    ON position_requirement_items (competency_id);

-- ============================================================================
-- 4. COURSE CONTENT (VERSIONED LEARNING DEFINITION)  [Phase 3]
-- ============================================================================

CREATE TABLE courses (
    id                           uuid PRIMARY KEY,
    organization_id              uuid NOT NULL REFERENCES organizations(id),
    code                         varchar(50) NOT NULL,
    version_no                   integer NOT NULL,
    supersedes_course_id         uuid REFERENCES courses(id),
    title                        varchar(250) NOT NULL,
    short_name                   varchar(120),
    description                  text,
    purpose                      text,
    entry_level                  smallint,
    estimated_duration_minutes   integer,
    certificate_enabled          boolean NOT NULL DEFAULT true,
    certificate_validity_days    integer,
    status                       varchar(30) NOT NULL DEFAULT 'DRAFT',
    created_by_user_id           uuid NOT NULL REFERENCES users(id),
    created_at                   timestamptz NOT NULL DEFAULT now(),
    updated_at                   timestamptz NOT NULL DEFAULT now(),
    row_version                  bigint NOT NULL DEFAULT 1,
    CONSTRAINT uq_courses_org_code_version
        UNIQUE (organization_id, code, version_no),
    CONSTRAINT ck_courses_version
        CHECK (version_no > 0),
    CONSTRAINT ck_courses_entry_level
        CHECK (entry_level IS NULL OR entry_level BETWEEN 1 AND 3),
    CONSTRAINT ck_courses_duration
        CHECK (estimated_duration_minutes IS NULL OR estimated_duration_minutes >= 0),
    CONSTRAINT ck_courses_certificate_validity_days
        CHECK (certificate_validity_days IS NULL OR certificate_validity_days > 0),
    CONSTRAINT ck_courses_status
        CHECK (status IN ('DRAFT','REVIEW','PUBLISHED','ARCHIVED')),
    CONSTRAINT ck_courses_not_self_supersede
        CHECK (supersedes_course_id IS NULL OR supersedes_course_id <> id),
    CONSTRAINT ck_courses_row_version
        CHECK (row_version > 0)
);

CREATE TABLE course_competencies (
    course_id        uuid NOT NULL REFERENCES courses(id),
    competency_id    uuid NOT NULL REFERENCES competencies(id),
    target_level     smallint NOT NULL,
    coverage_type    varchar(30) NOT NULL,
    coverage_weight  numeric(5,2),
    note             text,
    PRIMARY KEY (course_id, competency_id),
    CONSTRAINT ck_course_target_level
        CHECK (target_level BETWEEN 1 AND 3),
    CONSTRAINT ck_course_coverage_type
        CHECK (coverage_type IN ('PRIMARY','SECONDARY','SUPPORTING')),
    CONSTRAINT ck_course_coverage_weight
        CHECK (coverage_weight IS NULL OR coverage_weight BETWEEN 0 AND 100)
);

CREATE INDEX ix_course_competencies_competency_target_level
    ON course_competencies (competency_id, target_level);

CREATE TABLE course_prerequisites (
    course_id              uuid NOT NULL REFERENCES courses(id),
    prerequisite_course_id uuid NOT NULL REFERENCES courses(id),
    PRIMARY KEY (course_id, prerequisite_course_id),
    CONSTRAINT ck_course_prerequisite_not_self
        CHECK (course_id <> prerequisite_course_id)
);

CREATE TABLE course_learning_outcomes (
    id                 uuid PRIMARY KEY,
    course_id          uuid NOT NULL REFERENCES courses(id),
    code               varchar(80) NOT NULL,
    competency_id      uuid NOT NULL REFERENCES competencies(id),
    target_level       smallint NOT NULL,
    outcome_type       varchar(30) NOT NULL,
    statement          text NOT NULL,
    source_type        varchar(40) NOT NULL,
    source_ref         varchar(150),
    assessment_method  varchar(80),
    sort_order         integer NOT NULL,
    created_at         timestamptz NOT NULL DEFAULT now(),
    updated_at         timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_course_learning_outcomes_course_code UNIQUE (course_id, code),
    CONSTRAINT ck_course_learning_outcomes_level
        CHECK (target_level BETWEEN 1 AND 3),
    CONSTRAINT ck_course_learning_outcomes_type
        CHECK (outcome_type IN ('KNOWLEDGE','SKILL','ATTITUDE')),
    CONSTRAINT ck_course_learning_outcomes_source_type
        CHECK (source_type IN ('OFFICIAL_FRAMEWORK','DIGITALENT_ADAPTATION','LOCAL_CONTEXT'))
);

CREATE TABLE course_modules (
    id                 uuid PRIMARY KEY,
    course_id          uuid NOT NULL REFERENCES courses(id),
    code               varchar(80),
    title              varchar(250) NOT NULL,
    description        text,
    purpose            text,
    estimated_minutes  integer,
    sort_order         integer NOT NULL,
    is_required        boolean NOT NULL,
    status             varchar(30) NOT NULL,
    created_at         timestamptz NOT NULL DEFAULT now(),
    updated_at         timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ck_course_modules_estimated_minutes
        CHECK (estimated_minutes IS NULL OR estimated_minutes >= 0),
    CONSTRAINT ck_course_modules_status
        CHECK (status IN ('ACTIVE','ARCHIVED'))
);

CREATE INDEX ix_course_modules_course_sort_order
    ON course_modules (course_id, sort_order);

CREATE TABLE lessons (
    id                 uuid PRIMARY KEY,
    module_id          uuid NOT NULL REFERENCES course_modules(id),
    code               varchar(80),
    title              varchar(250) NOT NULL,
    lesson_type        varchar(30) NOT NULL,
    content_body       text,
    estimated_minutes  integer,
    sort_order         integer NOT NULL,
    is_required        boolean NOT NULL,
    completion_rule    varchar(50) NOT NULL,
    status             varchar(30) NOT NULL,
    created_at         timestamptz NOT NULL DEFAULT now(),
    updated_at         timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ck_lessons_type
        CHECK (lesson_type IN ('TEXT','VIDEO','CASE_STUDY','GUIDED_PRACTICE','WORKPLACE_SCENARIO','QUIZ','REFLECTION','ASSIGNMENT')),
    CONSTRAINT ck_lessons_completion_rule
        CHECK (completion_rule IN ('VIEW','MANUAL_COMPLETE','PASS_CHECK','SUBMIT_ACTIVITY')),
    CONSTRAINT ck_lessons_estimated_minutes
        CHECK (estimated_minutes IS NULL OR estimated_minutes >= 0),
    CONSTRAINT ck_lessons_status
        CHECK (status IN ('ACTIVE','ARCHIVED'))
);

CREATE INDEX ix_lessons_module_sort_order
    ON lessons (module_id, sort_order);

CREATE TABLE lesson_learning_outcomes (
    lesson_id           uuid NOT NULL REFERENCES lessons(id),
    learning_outcome_id uuid NOT NULL REFERENCES course_learning_outcomes(id),
    PRIMARY KEY (lesson_id, learning_outcome_id)
);

CREATE TABLE learning_materials (
    id              uuid PRIMARY KEY,
    lesson_id       uuid NOT NULL REFERENCES lessons(id),
    title           varchar(250) NOT NULL,
    material_type   varchar(30) NOT NULL,
    file_object_id  uuid REFERENCES file_objects(id),
    external_url    text,
    sort_order      integer NOT NULL,
    is_required     boolean NOT NULL,
    created_at      timestamptz NOT NULL,
    updated_at      timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ck_learning_materials_type
        CHECK (material_type IN ('FILE','LINK')),
    CONSTRAINT ck_learning_materials_exactly_one_source
        CHECK (
            (material_type = 'FILE' AND file_object_id IS NOT NULL AND external_url IS NULL)
            OR
            (material_type = 'LINK' AND external_url IS NOT NULL AND file_object_id IS NULL)
        )
);

-- ============================================================================
-- 5. PRACTICAL TASK & WORK EVIDENCE (MULTI-TARGET)  [Phase 4]
-- ============================================================================

CREATE TABLE practical_task_templates (
    id                        uuid PRIMARY KEY,
    organization_id           uuid NOT NULL REFERENCES organizations(id),
    related_course_id         uuid REFERENCES courses(id),
    title                     varchar(250) NOT NULL,
    description               text NOT NULL,
    expected_output           text NOT NULL,
    general_marking_criteria  jsonb,
    source_type               varchar(30) NOT NULL,
    status                    varchar(30) NOT NULL,
    created_by_user_id        uuid NOT NULL REFERENCES users(id),
    created_at                timestamptz NOT NULL,
    updated_at                timestamptz NOT NULL,
    CONSTRAINT ck_practical_task_templates_source_type
        CHECK (source_type IN ('MANUAL','AI_DRAFT')),
    CONSTRAINT ck_practical_task_templates_status
        CHECK (status IN ('DRAFT','ACTIVE','ARCHIVED'))
);

CREATE TABLE practical_task_targets (
    id                uuid PRIMARY KEY,
    task_template_id  uuid NOT NULL REFERENCES practical_task_templates(id),
    competency_id     uuid NOT NULL REFERENCES competencies(id),
    target_level      smallint NOT NULL,
    rubric_criteria   jsonb,
    sort_order        integer NOT NULL,
    created_at        timestamptz NOT NULL DEFAULT now(),
    updated_at        timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_practical_task_targets_template_competency
        UNIQUE (task_template_id, competency_id),
    CONSTRAINT ck_practical_task_targets_level
        CHECK (target_level BETWEEN 1 AND 3)
);

CREATE TABLE task_assignments (
    id                        uuid PRIMARY KEY,
    task_template_id          uuid REFERENCES practical_task_templates(id),
    employee_id               uuid NOT NULL REFERENCES employees(id),
    prompting_course_id       uuid REFERENCES courses(id),
    assigned_by_user_id       uuid NOT NULL REFERENCES users(id),
    reviewer_user_id          uuid NOT NULL REFERENCES users(id),
    assigned_at               timestamptz NOT NULL,
    due_at                    timestamptz,
    status                    varchar(30) NOT NULL,
    title_snapshot            varchar(250) NOT NULL,
    description_snapshot      text NOT NULL,
    expected_output_snapshot  text NOT NULL,
    created_at                timestamptz NOT NULL DEFAULT now(),
    updated_at                timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ck_task_assignments_status
        CHECK (status IN ('ASSIGNED','SUBMITTED','NEEDS_REVISION','PASSED','FAILED','CANCELLED'))
);

CREATE INDEX ix_task_assignments_employee_status
    ON task_assignments (employee_id, status);

CREATE INDEX ix_task_assignments_reviewer_status_due
    ON task_assignments (reviewer_user_id, status, due_at);

CREATE TABLE assigned_task_targets (
    id                  uuid PRIMARY KEY,
    task_assignment_id  uuid NOT NULL REFERENCES task_assignments(id),
    competency_id       uuid NOT NULL REFERENCES competencies(id),
    target_level        smallint NOT NULL,
    rubric_snapshot     jsonb,
    sort_order          integer NOT NULL,
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_assigned_task_targets_assignment_competency
        UNIQUE (task_assignment_id, competency_id),
    CONSTRAINT ck_assigned_task_targets_level
        CHECK (target_level BETWEEN 1 AND 3)
);

CREATE TABLE task_submissions (
    id                        uuid PRIMARY KEY,
    task_assignment_id        uuid NOT NULL REFERENCES task_assignments(id),
    version_no                integer NOT NULL,
    supersedes_submission_id  uuid REFERENCES task_submissions(id),
    submission_note           text,
    submission_url            text,
    submitted_at              timestamptz NOT NULL,
    status                    varchar(30) NOT NULL,
    created_at                timestamptz NOT NULL DEFAULT now(),
    updated_at                timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_task_submissions_assignment_version
        UNIQUE (task_assignment_id, version_no),
    CONSTRAINT ck_task_submissions_version
        CHECK (version_no > 0),
    CONSTRAINT ck_task_submissions_status
        CHECK (status IN ('SUBMITTED','UNDER_REVIEW','SUPERSEDED')),
    CONSTRAINT ck_task_submissions_not_self_supersede
        CHECK (supersedes_submission_id IS NULL OR supersedes_submission_id <> id)
);

CREATE INDEX ix_task_submissions_assignment
    ON task_submissions (task_assignment_id, version_no DESC);

CREATE TABLE task_submission_files (
    submission_id   uuid NOT NULL REFERENCES task_submissions(id),
    file_object_id  uuid NOT NULL REFERENCES file_objects(id),
    sort_order      integer NOT NULL,
    PRIMARY KEY (submission_id, file_object_id)
);

CREATE TABLE task_evaluations (
    id                   uuid PRIMARY KEY,
    task_submission_id   uuid NOT NULL UNIQUE REFERENCES task_submissions(id),
    reviewer_user_id     uuid NOT NULL REFERENCES users(id),
    overall_score        numeric(5,2),
    verdict              varchar(30) NOT NULL,
    counts_as_evidence   boolean NOT NULL DEFAULT false,
    feedback             text,
    evaluated_at         timestamptz NOT NULL,
    finalization_key     uuid UNIQUE,
    row_version          bigint NOT NULL DEFAULT 1,
    created_at           timestamptz NOT NULL DEFAULT now(),
    updated_at           timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ck_task_evaluations_score
        CHECK (overall_score IS NULL OR overall_score BETWEEN 0 AND 100),
    CONSTRAINT ck_task_evaluations_verdict
        CHECK (verdict IN ('PASSED','NEEDS_REVISION','FAILED')),
    CONSTRAINT ck_task_evaluations_evidence_requires_pass
        CHECK (NOT counts_as_evidence OR verdict = 'PASSED'),
    CONSTRAINT ck_task_evaluations_row_version
        CHECK (row_version > 0)
);

CREATE TABLE competency_evaluation_results (
    id                  uuid PRIMARY KEY,
    task_evaluation_id  uuid NOT NULL REFERENCES task_evaluations(id),
    competency_id       uuid NOT NULL REFERENCES competencies(id),
    target_level        smallint NOT NULL,
    score               numeric(5,2),
    verdict             varchar(30) NOT NULL,
    level_confirming    boolean NOT NULL DEFAULT false,
    confirmed_level     smallint,
    feedback            text,
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_competency_evaluation_results_eval_competency
        UNIQUE (task_evaluation_id, competency_id),
    CONSTRAINT ck_competency_evaluation_results_target_level
        CHECK (target_level BETWEEN 1 AND 3),
    CONSTRAINT ck_competency_evaluation_results_verdict
        CHECK (verdict IN ('PASSED','NEEDS_REVISION','FAILED')),
    CONSTRAINT ck_competency_evaluation_results_confirmed_level
        CHECK (confirmed_level IS NULL OR confirmed_level BETWEEN 1 AND 3),
    CONSTRAINT ck_competency_evaluation_results_confirm_rule
        CHECK (
            NOT level_confirming
            OR (verdict = 'PASSED' AND confirmed_level IS NOT NULL)
        )
);

-- ============================================================================
-- 6. CONFIRMED COMPETENCY EVIDENCE + PROFILE  [Phase 4]
-- ============================================================================

CREATE TABLE competency_evidences (
    id                               uuid PRIMARY KEY,
    employee_id                      uuid NOT NULL REFERENCES employees(id),
    competency_id                    uuid NOT NULL REFERENCES competencies(id),
    competency_evaluation_result_id  uuid UNIQUE REFERENCES competency_evaluation_results(id),
    source_type                      varchar(30) NOT NULL,
    status                           varchar(30) NOT NULL,
    is_level_confirming              boolean NOT NULL DEFAULT false,
    confirmed_level                  smallint,
    score                            numeric(5,2),
    review_note                      text,
    confirmed_by_user_id             uuid REFERENCES users(id),
    confirmed_at                     timestamptz,
    supersedes_evidence_id           uuid REFERENCES competency_evidences(id),
    created_at                       timestamptz NOT NULL DEFAULT now(),
    updated_at                       timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ck_competency_evidences_source_type
        CHECK (source_type IN ('PRACTICAL_TASK','MANUAL_OVERRIDE','MIGRATION')),
    CONSTRAINT ck_competency_evidences_status
        CHECK (status IN ('PENDING','CONFIRMED','REJECTED','SUPERSEDED')),
    CONSTRAINT ck_competency_evidences_confirmed_level
        CHECK (confirmed_level IS NULL OR confirmed_level BETWEEN 1 AND 3),
    CONSTRAINT ck_competency_evidences_level_confirming_rule
        CHECK (
            NOT is_level_confirming
            OR (
                status = 'CONFIRMED'
                AND confirmed_level IS NOT NULL
                AND confirmed_at IS NOT NULL
                AND confirmed_by_user_id IS NOT NULL
            )
        ),
    CONSTRAINT ck_competency_evidences_practical_task_result
        CHECK (
            source_type <> 'PRACTICAL_TASK'
            OR competency_evaluation_result_id IS NOT NULL
        ),
    CONSTRAINT ck_competency_evidences_not_self_supersede
        CHECK (supersedes_evidence_id IS NULL OR supersedes_evidence_id <> id)
);

CREATE INDEX ix_competency_evidences_employee_competency_status_created
    ON competency_evidences (employee_id, competency_id, status, created_at DESC);

CREATE TABLE employee_competency_profiles (
    id                            uuid PRIMARY KEY,
    employee_id                   uuid NOT NULL REFERENCES employees(id),
    competency_id                 uuid NOT NULL REFERENCES competencies(id),
    confirmed_level               smallint NOT NULL,
    latest_confirming_evidence_id uuid REFERENCES competency_evidences(id),
    confirmed_at                  timestamptz NOT NULL,
    updated_at                    timestamptz NOT NULL,
    row_version                   bigint NOT NULL DEFAULT 1,
    created_at                    timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_employee_competency_profiles_employee_competency
        UNIQUE (employee_id, competency_id),
    CONSTRAINT ck_profile_confirmed_level
        CHECK (confirmed_level BETWEEN 1 AND 3),
    CONSTRAINT ck_employee_competency_profiles_row_version
        CHECK (row_version > 0)
);

-- ============================================================================
-- 7. CAPABILITY / SKILL GAP  [Phase 2]
-- ============================================================================

CREATE TABLE skill_gap_runs (
    id                   uuid PRIMARY KEY,
    employee_id          uuid NOT NULL REFERENCES employees(id),
    requirement_set_id   uuid NOT NULL REFERENCES position_requirement_sets(id),
    generated_at         timestamptz NOT NULL,
    generated_by         varchar(30) NOT NULL,
    gap_count            integer NOT NULL,
    calculation_version  varchar(30) NOT NULL,
    summary_snapshot     jsonb,
    created_at           timestamptz NOT NULL DEFAULT now(),
    updated_at           timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ck_skill_gap_runs_generated_by
        CHECK (generated_by IN ('SYSTEM','USER_REQUEST')),
    CONSTRAINT ck_skill_gap_runs_gap_count
        CHECK (gap_count >= 0)
);

CREATE INDEX ix_skill_gap_runs_employee_generated_desc
    ON skill_gap_runs (employee_id, generated_at DESC);

CREATE TABLE skill_gap_items (
    id                    uuid PRIMARY KEY,
    skill_gap_run_id      uuid NOT NULL REFERENCES skill_gap_runs(id),
    competency_id         uuid NOT NULL REFERENCES competencies(id),
    required_level        smallint NOT NULL,
    current_level         smallint,
    gap_steps             smallint NOT NULL,
    weight_percent        numeric(5,2) NOT NULL,
    mandatory             boolean NOT NULL,
    mandatory_multiplier  numeric(4,2) NOT NULL DEFAULT 1.00,
    priority_score        numeric(8,2) NOT NULL,
    severity              varchar(20),
    created_at            timestamptz NOT NULL DEFAULT now(),
    updated_at            timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_skill_gap_items_run_competency
        UNIQUE (skill_gap_run_id, competency_id),
    CONSTRAINT ck_gap_required_level
        CHECK (required_level BETWEEN 1 AND 3),
    CONSTRAINT ck_gap_current_level
        CHECK (current_level IS NULL OR current_level BETWEEN 1 AND 3),
    CONSTRAINT ck_gap_steps_nonnegative
        CHECK (gap_steps >= 0),
    CONSTRAINT ck_skill_gap_items_weight
        CHECK (weight_percent > 0 AND weight_percent <= 100),
    CONSTRAINT ck_skill_gap_items_multiplier
        CHECK (mandatory_multiplier >= 0),
    CONSTRAINT ck_skill_gap_items_severity
        CHECK (severity IS NULL OR severity IN ('LOW','MEDIUM','HIGH'))
);

-- HR / manager decision on a course recommended to an employee (one row per pair, updated in place).
-- REOPENED puts the recommendation back to "pending" without deleting the history row.
CREATE TABLE recommendation_decisions (
    id                  uuid PRIMARY KEY,
    employee_id         uuid NOT NULL REFERENCES employees(id),
    course_id           uuid NOT NULL REFERENCES courses(id),
    skill_gap_run_id    uuid REFERENCES skill_gap_runs(id),   -- snapshot the decision was based on
    status              varchar(30) NOT NULL,
    reason              text,
    decided_by_user_id  uuid NOT NULL REFERENCES users(id),
    decided_at          timestamptz NOT NULL,
    created_at          timestamptz NOT NULL,
    updated_at          timestamptz NOT NULL,
    CONSTRAINT uq_recommendation_decisions_employee_course
        UNIQUE (employee_id, course_id),
    CONSTRAINT ck_recommendation_decisions_status
        CHECK (status IN ('ACCEPTED','DISMISSED','REOPENED'))
);

-- ============================================================================
-- 8. LEARNING ASSIGNMENT / ENROLLMENT / PROGRESS  [Phase 3]
-- ============================================================================

CREATE TABLE training_batches (
    id                    uuid PRIMARY KEY,
    organization_id       uuid NOT NULL REFERENCES organizations(id),
    name                  varchar(200) NOT NULL,
    status                varchar(30)  NOT NULL,
    start_date            date,
    end_date              date,
    created_by_user_id    uuid NOT NULL REFERENCES users(id),
    created_at            timestamptz NOT NULL,
    updated_at            timestamptz NOT NULL,
    CONSTRAINT ck_training_batches_status
        CHECK (status IN ('DRAFT','RUNNING','COMPLETED','CANCELLED')),
    CONSTRAINT ck_training_batches_dates
        CHECK (start_date IS NULL OR end_date IS NULL OR end_date >= start_date)
);

CREATE INDEX ix_training_batches_org_status
    ON training_batches (organization_id, status);

CREATE TABLE course_assignments (
    id                       uuid PRIMARY KEY,
    course_id                uuid NOT NULL REFERENCES courses(id),
    employee_id              uuid NOT NULL REFERENCES employees(id),
    assignment_source        varchar(30) NOT NULL,
    source_department_id     uuid REFERENCES departments(id),
    source_job_position_id   uuid REFERENCES job_positions(id),
    source_skill_gap_run_id  uuid REFERENCES skill_gap_runs(id),
    assigned_by_user_id      uuid NOT NULL REFERENCES users(id),
    assigned_at              timestamptz NOT NULL,
    due_date                 date,
    status                   varchar(30) NOT NULL,
    created_at               timestamptz NOT NULL DEFAULT now(),
    updated_at               timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ck_course_assignments_source
        CHECK (assignment_source IN ('MANUAL','SKILL_GAP','DEPARTMENT','POSITION')),
    CONSTRAINT ck_course_assignments_status
        CHECK (status IN ('ACTIVE','CANCELLED'))
);

CREATE INDEX ix_course_assignments_employee
    ON course_assignments (employee_id, status);

CREATE TABLE enrollments (
    id                    uuid PRIMARY KEY,
    course_assignment_id  uuid UNIQUE REFERENCES course_assignments(id),
    employee_id           uuid NOT NULL REFERENCES employees(id),
    course_id             uuid NOT NULL REFERENCES courses(id),
    status                varchar(30) NOT NULL,
    progress_percent      numeric(5,2) NOT NULL DEFAULT 0,
    started_at            timestamptz,
    completed_at          timestamptz,
    due_date              date,
    created_at            timestamptz NOT NULL,
    updated_at            timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ck_enrollments_status
        CHECK (status IN ('NOT_STARTED','IN_PROGRESS','READY_FOR_ASSESSMENT','COMPLETED','CANCELLED')),
    CONSTRAINT ck_enrollment_progress
        CHECK (progress_percent BETWEEN 0 AND 100),
    CONSTRAINT ck_enrollments_completion_time
        CHECK (completed_at IS NULL OR started_at IS NULL OR completed_at >= started_at)
);

CREATE INDEX ix_enrollments_employee_status
    ON enrollments (employee_id, status);

CREATE UNIQUE INDEX ux_enrollments_one_active
    ON enrollments(employee_id, course_id)
    WHERE status IN ('NOT_STARTED','IN_PROGRESS','READY_FOR_ASSESSMENT');

CREATE TABLE lesson_progress (
    id                uuid PRIMARY KEY,
    enrollment_id     uuid NOT NULL REFERENCES enrollments(id),
    lesson_id         uuid NOT NULL REFERENCES lessons(id),
    status            varchar(30) NOT NULL,
    progress_percent  numeric(5,2) NOT NULL DEFAULT 0,
    last_accessed_at  timestamptz,
    completed_at      timestamptz,
    created_at        timestamptz NOT NULL DEFAULT now(),
    updated_at        timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_lesson_progress_enrollment_lesson UNIQUE (enrollment_id, lesson_id),
    CONSTRAINT ck_lesson_progress_status
        CHECK (status IN ('NOT_STARTED','IN_PROGRESS','COMPLETED')),
    CONSTRAINT ck_lesson_progress_percent
        CHECK (progress_percent BETWEEN 0 AND 100)
);

-- ============================================================================
-- 9. ASSESSMENT  [Phase 3]
-- ============================================================================

CREATE TABLE question_banks (
    id                         uuid PRIMARY KEY,
    organization_id            uuid NOT NULL REFERENCES organizations(id),
    title                      varchar(250) NOT NULL,
    description                text,
    owner_user_id              uuid REFERENCES users(id),
    status                     varchar(30) NOT NULL,
    created_at                 timestamptz NOT NULL,
    updated_at                 timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ck_question_banks_status
        CHECK (status IN ('ACTIVE','ARCHIVED'))
);

CREATE TABLE questions (
    id                  uuid PRIMARY KEY,
    bank_id             uuid NOT NULL REFERENCES question_banks(id),
    competency_id       uuid REFERENCES competencies(id),
    question_type       varchar(30) NOT NULL,
    difficulty          varchar(30),
    content             text NOT NULL,
    explanation         text,
    ai_generated_flag   boolean NOT NULL DEFAULT false,
    status              varchar(30) NOT NULL,
    created_by_user_id  uuid NOT NULL REFERENCES users(id),
    created_at          timestamptz NOT NULL,
    updated_at          timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ck_questions_type
        CHECK (question_type IN ('MULTIPLE_CHOICE','TRUE_FALSE')),
    CONSTRAINT ck_questions_status
        CHECK (status IN ('DRAFT','APPROVED','ARCHIVED'))
);

CREATE TABLE question_options (
    id           uuid PRIMARY KEY,
    question_id  uuid NOT NULL REFERENCES questions(id),
    content      text NOT NULL,
    is_correct   boolean NOT NULL,
    sort_order   integer NOT NULL,
    created_at   timestamptz NOT NULL DEFAULT now(),
    updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE assessments (
    id                       uuid PRIMARY KEY,
    course_id                uuid NOT NULL REFERENCES courses(id),
    code                     varchar(50)  NOT NULL,   -- stable across versions (v2.3)
    version_no               integer NOT NULL,
    supersedes_assessment_id uuid REFERENCES assessments(id),
    title                    varchar(250) NOT NULL,
    assessment_type          varchar(30) NOT NULL,
    is_final                 boolean NOT NULL DEFAULT false,
    time_limit_minutes       integer,
    max_attempts             integer,
    passing_score            numeric(5,2) NOT NULL,
    status                   varchar(30) NOT NULL DEFAULT 'DRAFT',
    created_by_user_id       uuid NOT NULL REFERENCES users(id),
    created_at               timestamptz NOT NULL DEFAULT now(),
    row_version              bigint NOT NULL DEFAULT 1,
    updated_at               timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_assessments_course_code_version
        UNIQUE (course_id, code, version_no),
    CONSTRAINT ck_assessments_version
        CHECK (version_no > 0),
    CONSTRAINT ck_assessments_type
        CHECK (assessment_type IN ('PRACTICE','QUIZ','FINAL')),
    CONSTRAINT ck_assessments_time_limit
        CHECK (time_limit_minutes IS NULL OR time_limit_minutes > 0),
    CONSTRAINT ck_assessments_max_attempts
        CHECK (max_attempts IS NULL OR max_attempts > 0),
    CONSTRAINT ck_assessments_passing_score
        CHECK (passing_score BETWEEN 0 AND 100),
    CONSTRAINT ck_assessments_status
        CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED')),
    CONSTRAINT ck_assessments_final_type
        CHECK (NOT is_final OR assessment_type = 'FINAL'),
    CONSTRAINT ck_assessments_not_self_supersede
        CHECK (supersedes_assessment_id IS NULL OR supersedes_assessment_id <> id),
    CONSTRAINT ck_assessments_row_version
        CHECK (row_version > 0)
);

CREATE UNIQUE INDEX ux_assessments_one_published_final
    ON assessments(course_id)
    WHERE is_final = true AND status = 'PUBLISHED';

CREATE TABLE assessment_questions (
    assessment_id  uuid NOT NULL REFERENCES assessments(id),
    question_id    uuid NOT NULL REFERENCES questions(id),
    points         numeric(7,2) NOT NULL,
    sort_order     integer NOT NULL,
    PRIMARY KEY (assessment_id, question_id),
    CONSTRAINT ck_assessment_questions_points
        CHECK (points > 0)
);

CREATE TABLE assessment_attempts (
    id              uuid PRIMARY KEY,
    assessment_id   uuid NOT NULL REFERENCES assessments(id),
    enrollment_id   uuid NOT NULL REFERENCES enrollments(id),
    attempt_no      integer NOT NULL,
    status          varchar(30) NOT NULL DEFAULT 'STARTED',
    started_at      timestamptz NOT NULL,
    submitted_at    timestamptz,
    scored_at       timestamptz,
    score           numeric(6,2),
    passed          boolean,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_assessment_attempts_assessment_enrollment_attempt
        UNIQUE (assessment_id, enrollment_id, attempt_no),
    CONSTRAINT ck_assessment_attempts_attempt_no
        CHECK (attempt_no >= 1),
    CONSTRAINT ck_assessment_attempts_status
        CHECK (status IN ('STARTED','SUBMITTED','SCORED')),
    CONSTRAINT ck_assessment_attempts_submitted_after_start
        CHECK (submitted_at IS NULL OR submitted_at >= started_at),
    CONSTRAINT ck_assessment_attempts_scored_after_start
        CHECK (scored_at IS NULL OR scored_at >= started_at)
);

CREATE INDEX ix_assessment_attempts_enrollment_assessment_attempt
    ON assessment_attempts (enrollment_id, assessment_id, attempt_no);

CREATE TABLE assessment_answers (
    id                  uuid PRIMARY KEY,
    attempt_id          uuid NOT NULL REFERENCES assessment_attempts(id),
    question_id         uuid NOT NULL REFERENCES questions(id),
    selected_option_id  uuid REFERENCES question_options(id),
    answer_text         text,
    is_correct          boolean,
    points_awarded      numeric(7,2),
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_assessment_answers_attempt_question UNIQUE (attempt_id, question_id),
    CONSTRAINT ck_assessment_answers_points_awarded
        CHECK (points_awarded IS NULL OR points_awarded >= 0)
);

-- ============================================================================
-- 10. CERTIFICATE  [Phase 3]
-- ============================================================================

CREATE TABLE certificate_templates (
    id                         uuid PRIMARY KEY,
    organization_id            uuid NOT NULL REFERENCES organizations(id),
    name                       varchar(255) NOT NULL,
    version_no                 integer NOT NULL DEFAULT 1,
    template_html              text NOT NULL,
    background_file_object_id  uuid REFERENCES file_objects(id),
    status                     varchar(30) NOT NULL DEFAULT 'DRAFT',
    created_by_user_id         uuid REFERENCES users(id),
    created_at                 timestamptz NOT NULL DEFAULT now(),
    updated_at                 timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_certificate_templates_org_name_version
        UNIQUE (organization_id, name, version_no),
    CONSTRAINT ck_certificate_templates_version
        CHECK (version_no > 0),
    CONSTRAINT ck_certificate_templates_status
        CHECK (status IN ('DRAFT','ACTIVE','ARCHIVED'))
);

CREATE TABLE certificates (
    id                           uuid PRIMARY KEY,
    employee_id                  uuid NOT NULL REFERENCES employees(id),
    enrollment_id                uuid NOT NULL REFERENCES enrollments(id),
    assessment_attempt_id        uuid NOT NULL UNIQUE REFERENCES assessment_attempts(id),
    certificate_template_id      uuid NOT NULL REFERENCES certificate_templates(id),
    certificate_code             varchar(100) NOT NULL UNIQUE,
    holder_name_snapshot         varchar(200) NOT NULL,
    course_title_snapshot        varchar(250) NOT NULL,
    primary_competency_snapshot  varchar(250),
    issued_at                    timestamptz NOT NULL,
    expires_at                   timestamptz,
    status                       varchar(30) NOT NULL DEFAULT 'VALID',
    pdf_file_object_id           uuid REFERENCES file_objects(id),
    revoked_at                   timestamptz,
    revoked_by_user_id           uuid REFERENCES users(id),
    revocation_reason            text,
    created_at                   timestamptz NOT NULL DEFAULT now(),
    updated_at                   timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ck_certificates_status
        CHECK (status IN ('VALID','EXPIRED','REVOKED')),
    CONSTRAINT ck_certificates_expiry
        CHECK (expires_at IS NULL OR expires_at >= issued_at),
    CONSTRAINT ck_certificates_revocation_fields
        CHECK (
            status <> 'REVOKED'
            OR (revoked_at IS NOT NULL AND revoked_by_user_id IS NOT NULL AND revocation_reason IS NOT NULL)
        )
);

CREATE INDEX ix_certificates_employee
    ON certificates (employee_id, issued_at DESC);

CREATE TABLE certificate_verification_logs (
    id                uuid PRIMARY KEY,
    certificate_id    uuid REFERENCES certificates(id),
    certificate_code  varchar(100) NOT NULL,
    result_status     varchar(30) NOT NULL,
    ip_hash           varchar(128),
    user_agent        text,
    verified_at       timestamptz NOT NULL,
    created_at        timestamptz NOT NULL DEFAULT now(),
    updated_at        timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ck_certificate_verification_logs_result
        CHECK (result_status IN ('VALID','EXPIRED','REVOKED','NOT_FOUND'))
);

-- ============================================================================
-- 11. SHARED / INFRASTRUCTURE  [Phase 1: audit_logs, system_settings | Phase 3: notifications]
-- ============================================================================

CREATE TABLE notifications (
    id                   uuid PRIMARY KEY,
    recipient_user_id    uuid NOT NULL REFERENCES users(id),
    type                 varchar(50) NOT NULL,
    title                varchar(250) NOT NULL,
    message              text NOT NULL,
    related_entity_type  varchar(80),
    related_entity_id    uuid,
    is_read              boolean NOT NULL DEFAULT false,
    read_at              timestamptz,
    created_at           timestamptz NOT NULL,
    updated_at           timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ck_notifications_read_at
        CHECK ((is_read = false AND read_at IS NULL) OR is_read = true)
);

CREATE INDEX ix_notifications_recipient_unread
    ON notifications (recipient_user_id, is_read, created_at DESC);

CREATE TABLE audit_logs (
    id               uuid PRIMARY KEY,
    organization_id  uuid REFERENCES organizations(id),
    actor_user_id    uuid REFERENCES users(id),
    action           varchar(120) NOT NULL,
    entity_type      varchar(100) NOT NULL,
    entity_id        uuid,
    entity_label     varchar(255),
    old_values       jsonb,
    new_values       jsonb,
    ip_hash          varchar(128),
    created_at       timestamptz NOT NULL,
    updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ix_audit_logs_entity_created_desc
    ON audit_logs (entity_type, entity_id, created_at DESC);

CREATE TABLE system_settings (
    id                  uuid PRIMARY KEY,
    organization_id     uuid REFERENCES organizations(id),
    key                 varchar(150) NOT NULL,
    value               jsonb NOT NULL,
    description         text,
    updated_by_user_id  uuid REFERENCES users(id),
    updated_at          timestamptz NOT NULL,
    created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX ux_system_settings_global
    ON system_settings(key)
    WHERE organization_id IS NULL;

CREATE UNIQUE INDEX ux_system_settings_per_org
    ON system_settings(organization_id, key)
    WHERE organization_id IS NOT NULL;

-- ============================================================================
-- 12. NON-BLOCKING INTELLIGENCE EXTENSION (4 TABLES)  [Optional]
-- ============================================================================

CREATE TABLE scoring_configs (
    id                  uuid PRIMARY KEY,
    organization_id     uuid NOT NULL REFERENCES organizations(id),
    config_type         varchar(80) NOT NULL,
    version             integer NOT NULL,
    is_active           boolean NOT NULL DEFAULT false,
    description         text,
    created_by_user_id  uuid REFERENCES users(id),
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_scoring_configs_org_type_version
        UNIQUE (organization_id, config_type, version),
    CONSTRAINT ck_scoring_configs_version
        CHECK (version > 0),
    CONSTRAINT ck_scoring_configs_type
        CHECK (config_type IN ('RECOMMENDATION_WEIGHTS','TRAINING_RISK','READINESS'))
);

CREATE UNIQUE INDEX ux_scoring_configs_active
    ON scoring_configs(organization_id, config_type)
    WHERE is_active = true;

CREATE TABLE scoring_config_items (
    id                 uuid PRIMARY KEY,
    scoring_config_id  uuid NOT NULL REFERENCES scoring_configs(id),
    component_code     varchar(120) NOT NULL,
    weight             numeric(6,4) NOT NULL,
    min_value          numeric(8,2),
    max_value          numeric(8,2),
    notes              text,
    created_at         timestamptz NOT NULL DEFAULT now(),
    updated_at         timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_scoring_config_items_config_component
        UNIQUE (scoring_config_id, component_code),
    CONSTRAINT ck_scoring_config_items_range
        CHECK (max_value IS NULL OR min_value IS NULL OR max_value >= min_value)
);

CREATE TABLE training_risk_scores (
    id                    uuid PRIMARY KEY,
    enrollment_id         uuid NOT NULL REFERENCES enrollments(id),
    employee_id           uuid NOT NULL REFERENCES employees(id),
    risk_score            numeric(5,2) NOT NULL,
    risk_level            varchar(30) NOT NULL,
    inactivity_score      numeric(5,2) NOT NULL,
    low_score_rate        numeric(5,2) NOT NULL,
    deadline_pressure     numeric(5,2) NOT NULL,
    failed_attempt_rate   numeric(5,2) NOT NULL,
    progress_delay        numeric(5,2) NOT NULL,
    scoring_config_id     uuid REFERENCES scoring_configs(id),
    generated_at          timestamptz NOT NULL,
    created_at            timestamptz NOT NULL DEFAULT now(),
    updated_at            timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ck_training_risk_scores_level
        CHECK (risk_level IN ('LOW','MEDIUM','HIGH'))
);

CREATE TABLE readiness_scores (
    id                        uuid PRIMARY KEY,
    employee_id               uuid NOT NULL REFERENCES employees(id),
    job_position_id           uuid NOT NULL REFERENCES job_positions(id),
    requirement_set_id        uuid REFERENCES position_requirement_sets(id),
    competency_score          numeric(5,2) NOT NULL,
    certificate_score         numeric(5,2) NOT NULL,
    learning_progress_score   numeric(5,2) NOT NULL,
    compliance_score          numeric(5,2) NOT NULL,
    task_performance_score    numeric(5,2) NOT NULL,
    total_score               numeric(5,2) NOT NULL,
    readiness_level           varchar(30) NOT NULL,
    scoring_config_id         uuid REFERENCES scoring_configs(id),
    generated_at              timestamptz NOT NULL,
    snapshot_json             jsonb,
    created_at                timestamptz NOT NULL DEFAULT now(),
    updated_at                timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- 13. CONDITIONAL AUTH TABLE — NOT CREATED BY DEFAULT
-- ============================================================================
-- The canonical design says password_reset_tokens is conditional on the actual
-- password-reset strategy. Uncomment ONLY when persistent one-time/revocable
-- reset tokens are required by the implemented Auth flow.
--
-- CREATE TABLE password_reset_tokens (
--     id          uuid PRIMARY KEY,
--     user_id     uuid NOT NULL REFERENCES users(id),
--     token_hash  text NOT NULL UNIQUE,
--     expires_at  timestamptz NOT NULL,
--     used_at     timestamptz,
--     created_at  timestamptz NOT NULL
-- );

-- ============================================================================
-- 14. APPLICATION-LEVEL TRANSACTION CONTRACTS (DOCUMENTED, NOT TRIGGERS)
-- ============================================================================
-- A. Requirement Set activation:
--    lock JobPosition -> validate 9..14 items -> validate SUM(weight_percent)=100
--    -> archive old ACTIVE -> activate draft -> write audit -> commit.
--
-- B. Final assessment + certificate:
--    validate attempt/enrollment/course version -> score -> complete enrollment
--    -> issue certificate only for qualifying FINAL pass -> audit -> commit.
--
-- C. Work evidence finalization:
--    authorize reviewer -> latest submission -> every assigned target PASSED
--    -> evaluation + per-target results + evidence + profile updates + audit
--    in one transaction. If any target fails/revision: create no confirming evidence.
--
-- D. Profile rule:
--    course completion/certificate NEVER directly raises confirmed competency.
--    Only reviewed level-confirming evidence may update employee_competency_profiles.
--
-- E. Historical record rule:
--    do not cascade-delete attempts/certificates/submissions/evaluations/evidence.

-- ============================================================================
-- 15. REFERENCE DATA — THE FIVE SYSTEM ROLES (v2.3)
-- ============================================================================
-- Permissions and role_permissions are seeded by the application from
-- Domain/Constants/Authorization (Permissions.cs, RolePermissions.cs).

INSERT INTO roles (id, code, name, scope_type, status) VALUES
    (gen_random_uuid(), 'SYSTEM_ADMIN',       'System Administrator',  'GLOBAL',       'ACTIVE'),
    (gen_random_uuid(), 'HR_MANAGER',         'HR / Training Manager', 'ORGANIZATION', 'ACTIVE'),
    (gen_random_uuid(), 'DEPARTMENT_MANAGER', 'Department Manager',    'DEPARTMENT',   'ACTIVE'),
    (gen_random_uuid(), 'TRAINER',            'Internal Trainer',      'SELF',         'ACTIVE'),
    (gen_random_uuid(), 'EMPLOYEE',           'Employee',              'SELF',         'ACTIVE');

COMMIT;
