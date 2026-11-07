-- ============================================================================
-- DigiTalent AI — Canonical Database Schema v3.6
-- Target: PostgreSQL 16+
-- Source: DigiTalent_AI_Canonical_v3_5.sql + khối nội dung PDF + góp ý và báo lỗi của người dùng
--
-- This file is the SINGLE SOURCE OF TRUTH for the data model in v3.6.
-- EF Core configurations and migrations are written to match it (migrations AddUserFeedbacks,
-- AddFeedbackScreenshots, AddFeedbackRating, AddPdfBlockAndAssetType).
--
-- Changes v3.5 -> v3.6:
--   * platform_assets nhận thêm kind PDF, tối đa 50 MB.
--   * platform_module_blocks nhận thêm block_type PDF, gắn tệp qua asset_id như IMAGE / VIDEO.
--   * Bảng mới user_feedbacks: góp ý và báo lỗi người dùng gửi, quản trị nền tảng phản hồi.
-- ============================================================================

BEGIN;

CREATE TABLE user_feedbacks (
    id                   uuid PRIMARY KEY,
    user_id              uuid NOT NULL REFERENCES users(id),
    organization_id      uuid REFERENCES organizations(id),
    type                 varchar(20) NOT NULL,
    title                varchar(200) NOT NULL,
    description          varchar(5000) NOT NULL,
    page_url             varchar(500),
    status               varchar(20) NOT NULL,
    rating               integer,                   -- 1..5, kiểm tra ở CreateFeedbackValidator
    screenshots          jsonb,                     -- tối đa 3 ảnh data:image/*;base64, kiểm tra ở CreateFeedbackValidator
    admin_note           varchar(2000),
    resolved_by_user_id  uuid REFERENCES users(id),
    resolved_at          timestamptz,
    created_at           timestamptz NOT NULL,
    updated_at           timestamptz NOT NULL,
    CONSTRAINT ck_user_feedbacks_type CHECK (type IN ('BUG', 'FEEDBACK', 'SUGGESTION')),
    CONSTRAINT ck_user_feedbacks_status CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
    CONSTRAINT ck_user_feedbacks_title_length CHECK (char_length(title) BETWEEN 5 AND 200),
    CONSTRAINT ck_user_feedbacks_description_length CHECK (char_length(description) BETWEEN 10 AND 5000)
);

CREATE INDEX ix_user_feedbacks_user ON user_feedbacks (user_id);
CREATE INDEX ix_user_feedbacks_status ON user_feedbacks (status);
CREATE INDEX ix_user_feedbacks_org ON user_feedbacks (organization_id);

ALTER TABLE platform_assets DROP CONSTRAINT ck_platform_assets_kind;
ALTER TABLE platform_assets ADD CONSTRAINT ck_platform_assets_kind
    CHECK (kind IN ('IMAGE','VIDEO','PDF'));

ALTER TABLE platform_assets DROP CONSTRAINT ck_platform_assets_size;
ALTER TABLE platform_assets ADD CONSTRAINT ck_platform_assets_size CHECK (
    size_bytes > 0
    AND (kind <> 'IMAGE' OR size_bytes <= 10485760)      -- 10 MB
    AND (kind <> 'VIDEO' OR size_bytes <= 524288000)     -- 500 MB
    AND (kind <> 'PDF' OR size_bytes <= 52428800));      -- 50 MB

ALTER TABLE platform_module_blocks DROP CONSTRAINT ck_platform_module_blocks_type;
ALTER TABLE platform_module_blocks ADD CONSTRAINT ck_platform_module_blocks_type
    CHECK (block_type IN ('TEXT','SLIDE','IMAGE','VIDEO','PDF'));

ALTER TABLE platform_module_blocks DROP CONSTRAINT ck_platform_module_blocks_asset;
ALTER TABLE platform_module_blocks ADD CONSTRAINT ck_platform_module_blocks_asset
    CHECK (asset_id IS NULL OR block_type IN ('IMAGE','VIDEO','PDF'));

COMMIT;
