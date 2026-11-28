-- ============================================================================
-- DigiTalent AI — Canonical Database Schema v3.11
-- Target: PostgreSQL 16+
-- Source: DigiTalent_AI_Canonical_v3_10.sql + phụ đề video cho người khiếm thính
--
-- This file is the SINGLE SOURCE OF TRUTH for the data model in v3.11.
-- EF Core configurations and migrations are written to match it (migration AddPlatformAssetCaptions).
--
-- Changes v3.10 -> v3.11:
--   * Bảng mới platform_asset_captions: phụ đề của một video bài học (platform_assets kind VIDEO) theo ngôn ngữ
--     (hiện chỉ 'vi'). Phụ đề gắn với tệp video, không gắn với phiên bản chương trình học: tệp video dùng chung cho
--     mọi phiên bản, nên video đã có phụ đề thì ở phiên bản nào cũng có (spec docs/specs/2026-11-24-ai-video-captions.md).
--   * Hai bản phụ đề trên một dòng:
--       - draft_cues: bản nháp — AI tạo khi Platform Admin bấm nút (status PROCESSING -> READY / FAILED) hoặc người
--         tự nhập, Platform Admin sửa;
--       - published_cues: bản người học đang thấy. "Xuất bản phụ đề" chép bản nháp sang, có hiệu lực ngay, không cần
--         xuất bản lại phiên bản chương trình học. Tạo lại bằng AI chỉ ghi đè bản nháp.
--   * Một câu phụ đề = {"startMs": int, "endMs": int, "text": string}; các câu xếp theo thời gian, không chồng nhau,
--     tối đa 2000 câu, mỗi câu tối đa 200 ký tự — kiểm tra ở PlatformCaptionRules.
--   * status FAILED giữ nguyên draft_cues trước đó (lần AI lỗi không xóa bản nháp đang có), error_code cho biết lý do.
-- ============================================================================

BEGIN;

CREATE TABLE platform_asset_captions (
    id                    uuid PRIMARY KEY,
    asset_id              uuid NOT NULL REFERENCES platform_assets(id),
    language              varchar(10) NOT NULL DEFAULT 'vi',
    status                varchar(20) NOT NULL,                 -- bản nháp: PROCESSING / READY / FAILED
    source                varchar(20) NOT NULL,                 -- bản nháp: AI / MANUAL
    draft_cues            jsonb NOT NULL DEFAULT '[]'::jsonb,
    published_cues        jsonb,                                -- NULL = người học chưa có phụ đề
    published_at          timestamptz,
    published_by_user_id  uuid REFERENCES users(id),
    model                 varchar(100),                         -- model AI đã tạo bản nháp
    error_code            varchar(50),                          -- lý do khi status = FAILED
    requested_by_user_id  uuid REFERENCES users(id),            -- người bấm tạo bằng AI / người lưu gần nhất
    created_at            timestamptz NOT NULL,
    updated_at            timestamptz NOT NULL,
    CONSTRAINT uq_platform_asset_captions_asset_language UNIQUE (asset_id, language),
    CONSTRAINT ck_platform_asset_captions_language CHECK (language IN ('vi')),
    CONSTRAINT ck_platform_asset_captions_status CHECK (status IN ('PROCESSING','READY','FAILED')),
    CONSTRAINT ck_platform_asset_captions_source CHECK (source IN ('AI','MANUAL')),
    CONSTRAINT ck_platform_asset_captions_published CHECK ((published_cues IS NULL) = (published_at IS NULL)),
    CONSTRAINT ck_platform_asset_captions_error CHECK (status = 'FAILED' OR error_code IS NULL)
);

-- Việc AI còn dở được chạy lại khi máy chủ khởi động.
CREATE INDEX ix_platform_asset_captions_processing ON platform_asset_captions (updated_at) WHERE status = 'PROCESSING';
CREATE INDEX ix_platform_asset_captions_published_by_user_id ON platform_asset_captions (published_by_user_id);
CREATE INDEX ix_platform_asset_captions_requested_by_user_id ON platform_asset_captions (requested_by_user_id);

COMMENT ON TABLE platform_asset_captions IS
    'Phụ đề của một video bài học theo ngôn ngữ: bản nháp (AI tạo hoặc tự nhập, Platform Admin sửa) và bản người học đang thấy.';
COMMENT ON COLUMN platform_asset_captions.draft_cues IS 'Bản nháp: mảng {startMs, endMs, text} theo thời gian.';
COMMENT ON COLUMN platform_asset_captions.published_cues IS 'Bản người học thấy (NULL = chưa xuất bản); chép từ draft_cues khi xuất bản.';

COMMIT;
