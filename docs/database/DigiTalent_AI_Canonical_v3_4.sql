-- ============================================================================
-- DigiTalent AI — Canonical Database Schema v3.4
-- Target: PostgreSQL 16+
-- Source: DigiTalent_AI_Canonical_v3_3.sql + Pulse: phân tích rủi ro gian lận trong thi
--
-- This file is the SINGLE SOURCE OF TRUTH for the data model in v3.4.
-- EF Core entities, configurations and migrations are written to match it.
--
-- Changes v3.3 -> v3.4 (docs/specs/2026-10-23-pulse-proctoring-risk-analysis.md):
--   * proctoring_events.kind thêm các sự kiện do trình duyệt người làm bài tự nhận diện khuôn mặt từ camera
--     (MediaPipe Face Landmarker chạy trên máy, video không được gửi đi để phân tích):
--       FACE_MISSING    không thấy khuôn mặt trước camera (duration_ms = thời gian vắng mặt)
--       MULTIPLE_FACES  có từ hai khuôn mặt trở lên (detail = số khuôn mặt nhiều nhất)
--       LOOKING_AWAY    quay đầu / nhìn ra ngoài màn hình kéo dài (detail = hướng)
--       FACE_CHECK_ON   nhận diện khuôn mặt đã chạy trong phiên
--       FACE_CHECK_OFF  trình duyệt không chạy được nhận diện khuôn mặt (detail = lý do)
--   * Điểm rủi ro (0–100) và các điểm đáng ngờ được máy chủ tính khi đọc nhật ký, không lưu thành bảng.
-- ============================================================================

\i DigiTalent_AI_Canonical_v3_3.sql

BEGIN;

ALTER TABLE proctoring_events DROP CONSTRAINT ck_proctoring_events_kind;
ALTER TABLE proctoring_events ADD CONSTRAINT ck_proctoring_events_kind
    CHECK (kind IN ('STARTED', 'TAB_HIDDEN', 'FOCUS_LOST', 'SHARE_STOPPED', 'SHARE_RESUMED',
                    'CAMERA_STOPPED', 'CAMERA_RESUMED', 'MIC_STOPPED', 'MIC_RESUMED', 'SUBMITTED',
                    'FACE_MISSING', 'MULTIPLE_FACES', 'LOOKING_AWAY', 'FACE_CHECK_ON', 'FACE_CHECK_OFF'));

COMMIT;
