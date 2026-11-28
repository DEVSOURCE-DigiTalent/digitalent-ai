-- ============================================================================
-- DigiTalent AI — Canonical Database Schema v3.12
-- Target: PostgreSQL 16+
-- Source: DigiTalent_AI_Canonical_v3_11.sql + từ điển ngôn ngữ ký hiệu cho nhân vật 3D ra dấu
--
-- This file is the SINGLE SOURCE OF TRUTH for the data model in v3.12.
-- EF Core configurations and migrations are written to match it (migration AddSignGlosses).
--
-- Changes v3.11 -> v3.12:
--   * Bảng mới sign_glosses: từ điển ký hiệu (spec docs/specs/2026-11-24-sign-language-avatar.md). Mỗi dòng là một
--     ký hiệu: một từ / cụm từ (WORD), một chữ cái ngón tay (LETTER), một chữ số (DIGIT) hoặc một dấu thanh (TONE),
--     kèm video người thật ra dấu (platform_assets kind VIDEO) và chuyển động lấy từ video đó để nhân vật 3D ra dấu.
--   * Chuyển động lưu dạng nhị phân (motion_data bytea), không phải góc khớp: toạ độ các điểm mốc MediaPipe Holistic
--     mỗi khung hình, nén số nguyên 16 bit. Bố cục 1 (motion_layout = 1), mỗi khung 325 số int16 little-endian:
--       [0]        cờ: bit 0 có thân, bit 1 có tay trái, bit 2 có tay phải
--       [1..99]    33 điểm thân chuẩn hoá theo ảnh (x, y, z)
--       [100..198] 33 điểm thân theo mét (x, y, z)
--       [199..261] 21 điểm tay trái theo mét (x, y, z)
--       [262..324] 21 điểm tay phải theo mét (x, y, z)
--     giá trị = round(số thực × 10000), giới hạn ±32767. Đổi nhân vật hay cách tính góc khớp không cần quét lại video.
--   * Nguồn và giấy phép của từng ký hiệu (source_name, source_url, license_note): video lấy từ từ điển có sẵn chỉ được
--     dùng khi bên sở hữu cho phép.
--   * Chỉ ký hiệu PUBLISHED được dùng để dịch phụ đề và phát cho người học. "Xóa" = ARCHIVED.
--   * mirrored = đổi tay trái / tay phải khi phát (video mẫu quay kiểu soi gương).
-- ============================================================================

BEGIN;

CREATE TABLE sign_glosses (
    id                    uuid PRIMARY KEY,
    gloss                 varchar(100) NOT NULL,                -- chữ hiển thị: "Xin chào", "A", "Dấu sắc"
    normalized            varchar(100) NOT NULL,                -- NFC, chữ thường, một khoảng trắng: dùng để tra
    kind                  varchar(20) NOT NULL,                 -- WORD / LETTER / DIGIT / TONE
    status                varchar(20) NOT NULL,                 -- DRAFT / PUBLISHED / ARCHIVED
    video_asset_id        uuid REFERENCES platform_assets(id),
    source_name           varchar(200),
    source_url            varchar(500),
    license_note          varchar(500),
    motion_data           bytea,
    motion_layout         smallint,
    motion_fps            smallint,
    motion_frames         integer,
    motion_start_ms       integer,                              -- đoạn của video đã lấy chuyển động
    motion_end_ms         integer,
    mirrored              boolean NOT NULL DEFAULT false,
    created_by_user_id    uuid REFERENCES users(id),
    published_at          timestamptz,
    published_by_user_id  uuid REFERENCES users(id),
    created_at            timestamptz NOT NULL,
    updated_at            timestamptz NOT NULL,
    CONSTRAINT ck_sign_glosses_kind CHECK (kind IN ('WORD','LETTER','DIGIT','TONE')),
    CONSTRAINT ck_sign_glosses_status CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED')),
    CONSTRAINT ck_sign_glosses_motion CHECK (
        (motion_data IS NULL) = (motion_layout IS NULL)
        AND (motion_data IS NULL) = (motion_fps IS NULL)
        AND (motion_data IS NULL) = (motion_frames IS NULL)),
    CONSTRAINT ck_sign_glosses_fps CHECK (motion_fps IS NULL OR motion_fps BETWEEN 5 AND 60),
    CONSTRAINT ck_sign_glosses_frames CHECK (motion_frames IS NULL OR motion_frames BETWEEN 1 AND 1800),
    CONSTRAINT ck_sign_glosses_trim CHECK (motion_start_ms IS NULL OR motion_end_ms IS NULL OR motion_end_ms > motion_start_ms),
    CONSTRAINT ck_sign_glosses_published CHECK (status <> 'PUBLISHED' OR (motion_data IS NOT NULL AND published_at IS NOT NULL))
);

-- Một ký hiệu đang dùng cho mỗi chữ × loại.
CREATE UNIQUE INDEX ux_sign_glosses_normalized_kind ON sign_glosses (normalized, kind) WHERE status <> 'ARCHIVED';
CREATE INDEX ix_sign_glosses_status ON sign_glosses (status);
CREATE INDEX ix_sign_glosses_video_asset_id ON sign_glosses (video_asset_id);
CREATE INDEX ix_sign_glosses_created_by_user_id ON sign_glosses (created_by_user_id);
CREATE INDEX ix_sign_glosses_published_by_user_id ON sign_glosses (published_by_user_id);

COMMENT ON TABLE sign_glosses IS
    'Từ điển ký hiệu: video người thật ra dấu + chuyển động (điểm mốc MediaPipe, int16) cho nhân vật 3D ra dấu.';
COMMENT ON COLUMN sign_glosses.motion_data IS 'Bố cục motion_layout: mỗi khung 325 số int16 little-endian (xem đầu tệp).';

COMMIT;
