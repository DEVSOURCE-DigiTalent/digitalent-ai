-- ============================================================================
-- DigiTalent AI — Canonical Database Schema v3.13
-- Target: PostgreSQL 16+
-- Source: DigiTalent_AI_Canonical_v3_12.sql + video ngôn ngữ ký hiệu cho video bài học
--
-- This file is the SINGLE SOURCE OF TRUTH for the data model in v3.13.
-- EF Core configurations and migrations are written to match it (migrations AddSignLanguageVideoTracks +
-- AddSignVideoProgressStage).
--
-- Changes v3.12 -> v3.13 (spec docs/specs/2026-11-24-sign-language-video.md):
--   * sign_glosses: biến thể và quyền sử dụng.
--       sign_language (VSL), region (VN = cả nước; VN-BAC / VN-TRUNG / VN-NAM…), variant (người ra dấu khác, ngữ cảnh,
--       phiên bản từ điển), is_preferred (ký hiệu mặc định của từ), priority, synonyms (jsonb, khoá tra của các từ đồng
--       nghĩa), consent_confirmed (bên sở hữu video và người ra dấu đã cho phép), signer_name, video_duration_ms (độ dài
--       video đo được khi dựng, xoá khi đổi video).
--       Một ký hiệu đang dùng cho mỗi chữ × loại × ngôn ngữ ký hiệu × vùng × biến thể (biến thể trống tính là một giá trị:
--       NULLS NOT DISTINCT); tối đa một ký hiệu mặc định cho mỗi chữ × loại × ngôn ngữ ký hiệu.
--       Video ký hiệu chỉ được thêm khi có nguồn + giấy phép + consent_confirmed (kiểm ở ứng dụng, mã SIGN_LICENSE_MISSING);
--       dựng video chỉ dùng ký hiệu đủ ba thông tin đó.
--   * Bảng mới platform_sign_language_tracks: video ngôn ngữ ký hiệu của một video bài học (một dòng cho mỗi video ×
--       ngôn ngữ ký hiệu). Bản nháp (bản đồ ký hiệu + output_asset_id) và bản người học xem (published_output_asset_id,
--       giữ nguyên khi bản nháp đổi). Không bao giờ sửa phụ đề (platform_asset_captions).
--       status: ANALYZING (dành cho bước AI sắp trật tự sau này) / MISSING_GLOSSES / READY_TO_RENDER / RENDERING / READY /
--       FAILED / PUBLISHED. Không có dòng = NONE (chưa tạo).
--   * Bảng mới platform_sign_language_segments: mỗi câu phụ đề của track và chuỗi ký hiệu nói câu đó (sequence jsonb:
--       sourceText, normalizedText, glossId, gloss, assetId, matchType, confidence, isManualOverride, isMissing, skipped,
--       durationMs, startMs, endMs, timingMeasured, note, hint, candidateIds), từ còn thiếu (missing jsonb), độ tin cậy,
--       kiểm duyệt (review_status PENDING / APPROVED / SKIPPED, review_note, reviewed_by_user_id, reviewed_at).
--   * Tiến trình dựng theo từng bước (migration AddSignVideoProgressStage): progress_stage QUEUED (chờ đến lượt) →
--       DOWNLOADING (đọc video bài giảng) → PREPARING_CLIPS (chuẩn hóa từng video ký hiệu) → JOINING (xếp và ghép theo
--       giờ phụ đề) → COMPOSING (dựng video đầu ra) → CHECKING (kiểm tra) → SAVING (lưu vào kho) + progress_detail.
--   * Video dựng ra là một platform_assets kind VIDEO mới (thư mục lưu "platform-assets/sign-language"), tối đa 500 MB
--       như video tải lên.
-- Rollback (Down của migration): xoá hai bảng mới và các cột mới; trước khi tạo lại chỉ mục cũ (một ký hiệu cho mỗi chữ ×
--   loại) các biến thể thừa được chuyển sang ARCHIVED (giữ ký hiệu mặc định, rồi ký hiệu cả nước, rồi ký hiệu cũ nhất) —
--   lưu trữ, không xoá.
-- ============================================================================

BEGIN;

-- ----- sign_glosses: variants and rights ------------------------------------------------------

DROP INDEX ux_sign_glosses_normalized_kind;

ALTER TABLE sign_glosses
    ADD COLUMN sign_language      varchar(10)  NOT NULL DEFAULT 'VSL',
    ADD COLUMN region             varchar(13)  NOT NULL DEFAULT 'VN',
    ADD COLUMN variant            varchar(50),
    ADD COLUMN is_preferred       boolean      NOT NULL DEFAULT false,
    ADD COLUMN priority           smallint     NOT NULL DEFAULT 0,
    ADD COLUMN synonyms           jsonb        NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN consent_confirmed  boolean      NOT NULL DEFAULT false,
    ADD COLUMN signer_name        varchar(200),
    ADD COLUMN video_duration_ms  integer,
    ADD CONSTRAINT ck_sign_glosses_sign_language CHECK (sign_language ~ '^[A-Z]{2,10}$'),
    ADD CONSTRAINT ck_sign_glosses_region CHECK (region ~ '^[A-Z]{2}(-[A-Z]{2,10})?$'),
    ADD CONSTRAINT ck_sign_glosses_synonyms CHECK (jsonb_typeof(synonyms) = 'array'),
    ADD CONSTRAINT ck_sign_glosses_video_duration CHECK (video_duration_ms IS NULL OR video_duration_ms > 0);

-- Một ký hiệu đang dùng cho mỗi chữ × loại × ngôn ngữ ký hiệu × vùng × biến thể.
CREATE UNIQUE INDEX ux_sign_glosses_variant ON sign_glosses (normalized, kind, sign_language, region, variant)
    NULLS NOT DISTINCT WHERE status <> 'ARCHIVED';
-- Tối đa một ký hiệu mặc định cho mỗi chữ × loại × ngôn ngữ ký hiệu.
CREATE UNIQUE INDEX ux_sign_glosses_preferred ON sign_glosses (normalized, kind, sign_language)
    WHERE is_preferred AND status <> 'ARCHIVED';

COMMENT ON COLUMN sign_glosses.consent_confirmed IS 'Bên sở hữu video và người ra dấu đã cho phép dùng trong DigiTalent (bắt buộc khi có video).';
COMMENT ON COLUMN sign_glosses.synonyms IS 'Mảng khoá tra (chữ thường, NFC) của các từ / cụm từ cùng nghĩa với ký hiệu.';

-- ----- platform_sign_language_tracks ----------------------------------------------------------

CREATE TABLE platform_sign_language_tracks (
    id                         uuid PRIMARY KEY,
    source_asset_id            uuid NOT NULL REFERENCES platform_assets(id),
    language                   varchar(10) NOT NULL DEFAULT 'vi',           -- ngôn ngữ của phụ đề đọc vào
    sign_language              varchar(10) NOT NULL DEFAULT 'VSL',
    region                     varchar(13) NOT NULL DEFAULT 'VN',           -- vùng ưu tiên khi một từ có nhiều ký hiệu
    variant                    varchar(50),
    caption_source             varchar(20) NOT NULL,                        -- PUBLISHED / DRAFT
    caption_fingerprint        varchar(64) NOT NULL,                        -- SHA-256 các câu đã phân tích
    render_mode                varchar(20) NOT NULL,                        -- OVERLAY / FULLSCREEN / TRACK_ONLY
    renderer                   varchar(20) NOT NULL,                        -- CLIP / AVATAR
    status                     varchar(30) NOT NULL,
    settings                   jsonb NOT NULL DEFAULT '{}'::jsonb,
    progress                   smallint NOT NULL DEFAULT 0,
    progress_stage             varchar(30),                                 -- bước đang dựng; giữ khi lỗi, NULL khi xong
    progress_detail            varchar(200),                                -- đang làm gì (tiếng Việt), hiện cho người dùng
    render_attempts            integer NOT NULL DEFAULT 0,
    error_code                 varchar(50),
    error_message              varchar(500),                                -- tiếng Việt, không có đường dẫn / khoá
    output_asset_id            uuid REFERENCES platform_assets(id),         -- video dựng gần nhất của bản nháp
    rendered_fingerprint       varchar(64),                                 -- SHA-256 những gì đã dựng
    output_duration_ms         integer,
    output_width               integer,
    output_height              integer,
    render_started_at          timestamptz,
    rendered_at                timestamptz,
    published_output_asset_id  uuid REFERENCES platform_assets(id),         -- người học xem
    published_render_mode      varchar(20),
    published_snapshot         jsonb,                                       -- cài đặt + các câu lúc xuất bản
    published_at               timestamptz,
    published_by_user_id       uuid REFERENCES users(id),
    created_by_user_id         uuid REFERENCES users(id),
    requested_by_user_id       uuid REFERENCES users(id),
    created_at                 timestamptz NOT NULL,
    updated_at                 timestamptz NOT NULL,
    CONSTRAINT ck_platform_sign_language_tracks_language CHECK (language IN ('vi')),
    CONSTRAINT ck_platform_sign_language_tracks_sign_language CHECK (sign_language ~ '^[A-Z]{2,10}$'),
    CONSTRAINT ck_platform_sign_language_tracks_region CHECK (region ~ '^[A-Z]{2}(-[A-Z]{2,10})?$'),
    CONSTRAINT ck_platform_sign_language_tracks_caption_source CHECK (caption_source IN ('PUBLISHED','DRAFT')),
    CONSTRAINT ck_platform_sign_language_tracks_render_mode CHECK (render_mode IN ('OVERLAY','FULLSCREEN','TRACK_ONLY')),
    CONSTRAINT ck_platform_sign_language_tracks_renderer CHECK (renderer IN ('CLIP','AVATAR')),
    CONSTRAINT ck_platform_sign_language_tracks_status CHECK (
        status IN ('ANALYZING','MISSING_GLOSSES','READY_TO_RENDER','RENDERING','READY','FAILED','PUBLISHED')),
    CONSTRAINT ck_platform_sign_language_tracks_progress CHECK (progress BETWEEN 0 AND 100),
    CONSTRAINT ck_platform_sign_language_tracks_progress_stage CHECK (
        progress_stage IS NULL OR progress_stage IN ('QUEUED','DOWNLOADING','PREPARING_CLIPS','JOINING','COMPOSING','CHECKING','SAVING')),
    CONSTRAINT ck_platform_sign_language_tracks_error CHECK (status = 'FAILED' OR error_code IS NULL),
    CONSTRAINT ck_platform_sign_language_tracks_ready CHECK (status NOT IN ('READY','PUBLISHED') OR output_asset_id IS NOT NULL),
    CONSTRAINT ck_platform_sign_language_tracks_published CHECK (
        (published_output_asset_id IS NULL) = (published_at IS NULL)
        AND (published_output_asset_id IS NULL) = (published_render_mode IS NULL)),
    CONSTRAINT ck_platform_sign_language_tracks_published_mode CHECK (
        published_render_mode IS NULL OR published_render_mode IN ('OVERLAY','FULLSCREEN','TRACK_ONLY')),
    CONSTRAINT ck_platform_sign_language_tracks_output_meta CHECK (
        (output_duration_ms IS NULL OR output_duration_ms > 0)
        AND (output_width IS NULL OR output_width > 0)
        AND (output_height IS NULL OR output_height > 0)),
    CONSTRAINT ck_platform_sign_language_tracks_settings CHECK (jsonb_typeof(settings) = 'object')
);

CREATE UNIQUE INDEX uq_platform_sign_language_tracks_asset_sign_language ON platform_sign_language_tracks (source_asset_id, sign_language);
CREATE INDEX ix_platform_sign_language_tracks_rendering ON platform_sign_language_tracks (updated_at) WHERE status = 'RENDERING';
CREATE INDEX ix_platform_sign_language_tracks_output_asset_id ON platform_sign_language_tracks (output_asset_id);
CREATE INDEX ix_platform_sign_language_tracks_published_output_asset_id ON platform_sign_language_tracks (published_output_asset_id);
CREATE INDEX ix_platform_sign_language_tracks_created_by_user_id ON platform_sign_language_tracks (created_by_user_id);
CREATE INDEX ix_platform_sign_language_tracks_requested_by_user_id ON platform_sign_language_tracks (requested_by_user_id);
CREATE INDEX ix_platform_sign_language_tracks_published_by_user_id ON platform_sign_language_tracks (published_by_user_id);

COMMENT ON TABLE platform_sign_language_tracks IS
    'Video ngôn ngữ ký hiệu của một video bài học: bản đồ ký hiệu (bản nháp), video dựng ra và video người học xem.';

-- ----- platform_sign_language_segments --------------------------------------------------------

CREATE TABLE platform_sign_language_segments (
    id                    uuid PRIMARY KEY,
    track_id              uuid NOT NULL REFERENCES platform_sign_language_tracks(id),
    segment_index         integer NOT NULL,
    caption_text          varchar(200) NOT NULL,
    start_ms              integer NOT NULL,
    end_ms                integer NOT NULL,
    sequence              jsonb NOT NULL DEFAULT '[]'::jsonb,
    missing               jsonb NOT NULL DEFAULT '[]'::jsonb,
    confidence            numeric(4,3) NOT NULL,
    review_status         varchar(20) NOT NULL DEFAULT 'PENDING',
    review_note           varchar(500),
    reviewed_by_user_id   uuid REFERENCES users(id),
    reviewed_at           timestamptz,
    created_at            timestamptz NOT NULL,
    updated_at            timestamptz NOT NULL,
    CONSTRAINT ck_platform_sign_language_segments_index CHECK (segment_index >= 0),
    CONSTRAINT ck_platform_sign_language_segments_time CHECK (start_ms >= 0 AND end_ms > start_ms),
    CONSTRAINT ck_platform_sign_language_segments_review CHECK (review_status IN ('PENDING','APPROVED','SKIPPED')),
    CONSTRAINT ck_platform_sign_language_segments_reviewed CHECK (review_status = 'PENDING' OR reviewed_at IS NOT NULL),
    CONSTRAINT ck_platform_sign_language_segments_confidence CHECK (confidence BETWEEN 0 AND 1),
    CONSTRAINT ck_platform_sign_language_segments_sequence CHECK (jsonb_typeof(sequence) = 'array' AND jsonb_typeof(missing) = 'array')
);

CREATE UNIQUE INDEX uq_platform_sign_language_segments_track_index ON platform_sign_language_segments (track_id, segment_index);
CREATE INDEX ix_platform_sign_language_segments_reviewed_by_user_id ON platform_sign_language_segments (reviewed_by_user_id);

COMMENT ON TABLE platform_sign_language_segments IS
    'Mỗi câu phụ đề của video ký hiệu: chuỗi ký hiệu (jsonb), từ còn thiếu, độ tin cậy và kết quả kiểm duyệt.';

COMMIT;
