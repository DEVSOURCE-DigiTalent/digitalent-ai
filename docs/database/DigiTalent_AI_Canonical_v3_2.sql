-- ============================================================================
-- DigiTalent AI — Canonical Database Schema v3.2
-- Target: PostgreSQL 16+
-- Source: DigiTalent_AI_Canonical_v3_1.sql + trần năng lực doanh nghiệp / phòng ban
--         + Platform catalog v2 (Platform Admin rebuild)
--
-- This file is the SINGLE SOURCE OF TRUTH for the data model in v3.2.
-- EF Core entities, configurations and migrations are written to match it.
--
-- Changes v3.1 -> v3.2:
--   Capability ceilings (Lý thuyết trần nhà — QuyTD13/Luồng vận hành Digital AI.html §III):
--   * Section 18: CAPABILITY CEILINGS
--       1. capability_ceilings: cấp cao nhất (0–3) doanh nghiệp, hoặc một phòng ban, mở cho từng lĩnh vực
--          năng lực (competency_categories). Ma trận 6 lĩnh vực × 3 cấp = 18 khóa là trần Digital AI;
--          các ô nằm dưới trần chính là lộ trình.
--          Quy tắc (kiểm tra ở tầng ứng dụng vì là ràng buộc giữa nhiều dòng):
--          trần phòng ban ≤ trần doanh nghiệp ≤ trần Digital AI (3), xét riêng từng lĩnh vực.
--          Phòng ban không có dòng nào ở một lĩnh vực thì kế thừa trần doanh nghiệp.
--   Platform catalog v2 (docs/specs/2026-10-15-platform-admin-v2.md):
--   * Section 12A (platform catalog) is reworked:
--       - platform_frameworks: several competency frameworks; each owns its domains and release history.
--       - platform_framework_domains.framework_id, wider code, status (ACTIVE / ARCHIVED = xóa lĩnh vực);
--         platform_framework_releases.framework_id
--         (version_no is unique per framework).
--       - platform_courses keeps the stable identity of a course (code) and mirrors the course as it is in
--         the CURRENT catalog version; draft_* columns and the (domain, level) uniqueness are dropped.
--       - platform_course_releases and platform_course_questions are dropped (replaced by catalog versions).
--   * Section 19: PLATFORM CATALOG VERSIONS & COURSE BUILDER
--       1. platform_catalog_versions: one version of the whole curriculum; one DRAFT and one CURRENT at most.
--       2. platform_catalog_courses: a course as it is in one version (info, price, final assessment).
--       3. platform_course_modules: modules of a course in a version, with the title of its review quiz.
--       4. platform_module_blocks: content blocks TEXT / SLIDE / IMAGE / VIDEO in order.
--       5. platform_slide_items: images and videos of a SLIDE block, in order.
--       6. platform_module_questions + platform_question_options: review questions of a module,
--          each linked to the block the learner reopens after a wrong answer.
--       7. platform_assets: uploaded image / video files (immutable, shared between versions).
--   Published versions are never edited: creating a draft deep-copies the CURRENT version; edits of a
--   DRAFT change its own rows only.
-- ============================================================================

\i DigiTalent_AI_Canonical_v3_1.sql

BEGIN;

-- ============================================================================
-- 12A. PLATFORM CATALOG — rework
-- ============================================================================

CREATE TABLE platform_frameworks (
    id                   uuid PRIMARY KEY,
    code                 varchar(30)  NOT NULL UNIQUE,     -- TT02_2025 for the Circular 02/2025 standard
    name                 varchar(250) NOT NULL,
    description          text         NOT NULL,
    status               varchar(20)  NOT NULL,
    current_version_no   int          NOT NULL DEFAULT 0,  -- 0 = never published
    sort_order           int          NOT NULL,
    created_by_user_id   uuid REFERENCES users(id),
    created_at           timestamptz  NOT NULL,
    updated_at           timestamptz  NOT NULL,
    CONSTRAINT ck_platform_frameworks_status CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED')),
    CONSTRAINT ck_platform_frameworks_version CHECK (current_version_no >= 0),
    CONSTRAINT ck_platform_frameworks_published CHECK (status <> 'PUBLISHED' OR current_version_no >= 1)
);

ALTER TABLE platform_framework_domains
    ADD COLUMN framework_id uuid NOT NULL REFERENCES platform_frameworks(id),
    ALTER COLUMN code TYPE varchar(40);
-- Xóa lĩnh vực = ARCHIVED (only while no course of the version in use or the draft is in it); archived domains
-- stay for courses of retired versions and the audit log.
ALTER TABLE platform_framework_domains
    ADD COLUMN status varchar(20) NOT NULL DEFAULT 'ACTIVE',
    ADD CONSTRAINT ck_platform_framework_domains_status CHECK (status IN ('ACTIVE','ARCHIVED'));
CREATE INDEX ix_platform_framework_domains_framework ON platform_framework_domains (framework_id, sort_order);

ALTER TABLE platform_framework_releases
    ADD COLUMN framework_id uuid NOT NULL REFERENCES platform_frameworks(id),
    DROP CONSTRAINT platform_framework_releases_version_no_key,
    ADD CONSTRAINT uq_platform_framework_releases_framework_version UNIQUE (framework_id, version_no);

-- platform_courses = stable identity (code) + mirror of the course in the CURRENT catalog version.
-- version_no = the catalog version currently in use. Updated only when a catalog version is published.
ALTER TABLE platform_courses
    DROP CONSTRAINT uq_platform_courses_domain_level,
    DROP CONSTRAINT ck_platform_courses_draft_price,
    DROP CONSTRAINT ck_platform_courses_draft_sales_status,
    DROP COLUMN draft_title,
    DROP COLUMN draft_outcome,
    DROP COLUMN draft_price_per_seat,
    DROP COLUMN draft_sales_status,
    ALTER COLUMN code TYPE varchar(30);
CREATE INDEX ix_platform_courses_domain_level ON platform_courses (domain_id, level);

DROP TABLE platform_course_questions;
DROP TABLE platform_course_releases;

-- ============================================================================
-- 18. CAPABILITY CEILINGS
-- ============================================================================

-- 18.1. Trần năng lực theo lĩnh vực.
--   department_id IS NULL      → trần của doanh nghiệp (một dòng cho mỗi lĩnh vực).
--   department_id IS NOT NULL  → trần riêng của phòng ban (≤ trần doanh nghiệp cùng lĩnh vực).
--   ceiling_level: 0 = không mở lĩnh vực, 1 Cơ bản, 2 Trung cấp, 3 Nâng cao.
CREATE TABLE capability_ceilings (
    id                      uuid PRIMARY KEY,
    organization_id         uuid NOT NULL REFERENCES organizations(id),
    department_id           uuid REFERENCES departments(id),
    competency_category_id  uuid NOT NULL REFERENCES competency_categories(id),
    ceiling_level           smallint NOT NULL,
    updated_by_user_id      uuid REFERENCES users(id),
    created_at              timestamptz NOT NULL DEFAULT now(),
    updated_at              timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ck_capability_ceilings_level
        CHECK (ceiling_level BETWEEN 0 AND 3)
);

CREATE UNIQUE INDEX uq_capability_ceilings_organization_category
    ON capability_ceilings(organization_id, competency_category_id)
    WHERE department_id IS NULL;
CREATE UNIQUE INDEX uq_capability_ceilings_department_category
    ON capability_ceilings(department_id, competency_category_id)
    WHERE department_id IS NOT NULL;
CREATE INDEX ix_capability_ceilings_competency_category_id
    ON capability_ceilings(competency_category_id);
CREATE INDEX ix_capability_ceilings_updated_by_user_id
    ON capability_ceilings(updated_by_user_id);

-- ============================================================================
-- 19. PLATFORM CATALOG VERSIONS & COURSE BUILDER
-- ============================================================================

CREATE TABLE platform_catalog_versions (
    id                    uuid PRIMARY KEY,
    version_no            int           NOT NULL UNIQUE,
    status                varchar(20)   NOT NULL,
    based_on_version_id   uuid REFERENCES platform_catalog_versions(id),
    release_note          varchar(1000),
    created_by_user_id    uuid REFERENCES users(id),
    published_by_user_id  uuid REFERENCES users(id),
    published_at          timestamptz,
    created_at            timestamptz   NOT NULL,
    updated_at            timestamptz   NOT NULL,
    CONSTRAINT ck_platform_catalog_versions_version CHECK (version_no >= 1),
    CONSTRAINT ck_platform_catalog_versions_status CHECK (status IN ('DRAFT','CURRENT','RETIRED')),
    CONSTRAINT ck_platform_catalog_versions_published CHECK (status = 'DRAFT' OR published_at IS NOT NULL)
);

-- At most one draft and one version in use (the "anchor").
CREATE UNIQUE INDEX ux_platform_catalog_versions_draft ON platform_catalog_versions (status) WHERE status = 'DRAFT';
CREATE UNIQUE INDEX ux_platform_catalog_versions_current ON platform_catalog_versions (status) WHERE status = 'CURRENT';

CREATE TABLE platform_catalog_courses (
    id               uuid PRIMARY KEY,
    version_id       uuid          NOT NULL REFERENCES platform_catalog_versions(id),
    course_id        uuid          NOT NULL REFERENCES platform_courses(id),
    change_kind      varchar(20)   NOT NULL,             -- relative to the version it was copied from
    domain_id        uuid          NOT NULL REFERENCES platform_framework_domains(id),
    level            smallint      NOT NULL,
    title            varchar(250)  NOT NULL,
    outcome          text          NOT NULL,
    price_per_seat   bigint        NOT NULL,             -- VND
    sales_status     varchar(20)   NOT NULL,
    final_title      varchar(250)  NOT NULL,
    final_prompt     text          NOT NULL,             -- sanitized HTML
    final_criteria   jsonb         NOT NULL,             -- JSON array of criterion titles
    created_at       timestamptz   NOT NULL,
    updated_at       timestamptz   NOT NULL,
    CONSTRAINT uq_platform_catalog_courses_version_course UNIQUE (version_id, course_id),
    CONSTRAINT ck_platform_catalog_courses_change CHECK (change_kind IN ('NEW','EDITED','UNCHANGED')),
    CONSTRAINT ck_platform_catalog_courses_level CHECK (level BETWEEN 1 AND 3),
    CONSTRAINT ck_platform_catalog_courses_price CHECK (price_per_seat >= 0 AND (level > 1 OR price_per_seat = 0)),
    CONSTRAINT ck_platform_catalog_courses_sales_status CHECK (sales_status IN ('OPEN','PAUSED'))
);

CREATE INDEX ix_platform_catalog_courses_course ON platform_catalog_courses (course_id);

CREATE TABLE platform_course_modules (
    id                  uuid PRIMARY KEY,
    catalog_course_id   uuid          NOT NULL REFERENCES platform_catalog_courses(id),
    sort_order          int           NOT NULL,
    title               varchar(250)  NOT NULL,
    quiz_title          varchar(250)  NOT NULL,
    created_at          timestamptz   NOT NULL,
    updated_at          timestamptz   NOT NULL
);

CREATE INDEX ix_platform_course_modules_course ON platform_course_modules (catalog_course_id, sort_order);

CREATE TABLE platform_assets (
    id                   uuid PRIMARY KEY,
    kind                 varchar(10)   NOT NULL,
    file_name            varchar(255)  NOT NULL,
    content_type         varchar(100)  NOT NULL,
    size_bytes           bigint        NOT NULL,
    storage_key          varchar(500)  NOT NULL UNIQUE,
    uploaded_by_user_id  uuid REFERENCES users(id),
    created_at           timestamptz   NOT NULL,
    updated_at           timestamptz   NOT NULL,
    CONSTRAINT ck_platform_assets_kind CHECK (kind IN ('IMAGE','VIDEO')),
    CONSTRAINT ck_platform_assets_size CHECK (
        size_bytes > 0
        AND (kind <> 'IMAGE' OR size_bytes <= 10485760)      -- 10 MB
        AND (kind <> 'VIDEO' OR size_bytes <= 524288000))    -- 500 MB
);

CREATE TABLE platform_module_blocks (
    id           uuid PRIMARY KEY,
    module_id    uuid          NOT NULL REFERENCES platform_course_modules(id),
    sort_order   int           NOT NULL,
    block_type   varchar(10)   NOT NULL,
    body_html    text,                                   -- TEXT only (sanitized HTML)
    asset_id     uuid REFERENCES platform_assets(id),    -- IMAGE / VIDEO only; NULL until uploaded
    caption      varchar(500),
    alt_text     varchar(500),
    created_at   timestamptz   NOT NULL,
    updated_at   timestamptz   NOT NULL,
    CONSTRAINT ck_platform_module_blocks_type CHECK (block_type IN ('TEXT','SLIDE','IMAGE','VIDEO')),
    CONSTRAINT ck_platform_module_blocks_text CHECK ((block_type = 'TEXT') = (body_html IS NOT NULL)),
    CONSTRAINT ck_platform_module_blocks_asset CHECK (asset_id IS NULL OR block_type IN ('IMAGE','VIDEO'))
);

CREATE INDEX ix_platform_module_blocks_module ON platform_module_blocks (module_id, sort_order);

CREATE TABLE platform_slide_items (
    id           uuid PRIMARY KEY,
    block_id     uuid          NOT NULL REFERENCES platform_module_blocks(id),
    sort_order   int           NOT NULL,
    asset_id     uuid          NOT NULL REFERENCES platform_assets(id),
    caption      varchar(500),
    created_at   timestamptz   NOT NULL,
    updated_at   timestamptz   NOT NULL
);

CREATE INDEX ix_platform_slide_items_block ON platform_slide_items (block_id, sort_order);

CREATE TABLE platform_module_questions (
    id              uuid PRIMARY KEY,
    module_id       uuid           NOT NULL REFERENCES platform_course_modules(id),
    sort_order      int            NOT NULL,
    question_text   varchar(1000)  NOT NULL,
    explanation     varchar(1000),
    block_id        uuid REFERENCES platform_module_blocks(id),  -- block reopened after a wrong answer
    created_at      timestamptz    NOT NULL,
    updated_at      timestamptz    NOT NULL
);

CREATE INDEX ix_platform_module_questions_module ON platform_module_questions (module_id, sort_order);

CREATE TABLE platform_question_options (
    id            uuid PRIMARY KEY,
    question_id   uuid          NOT NULL REFERENCES platform_module_questions(id),
    sort_order    int           NOT NULL,
    option_text   varchar(500)  NOT NULL,
    is_correct    boolean       NOT NULL,
    created_at    timestamptz   NOT NULL,
    updated_at    timestamptz   NOT NULL
);

CREATE INDEX ix_platform_question_options_question ON platform_question_options (question_id, sort_order);
-- Exactly one correct option per question (at most one here; "at least one" is checked before publishing).
CREATE UNIQUE INDEX ux_platform_question_options_correct ON platform_question_options (question_id) WHERE is_correct;

COMMIT;
