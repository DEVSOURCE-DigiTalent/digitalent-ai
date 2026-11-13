-- ============================================================================
-- DigiTalent AI — Canonical Database Schema v3.7
-- Target: PostgreSQL 16+
-- Source: DigiTalent_AI_Canonical_v3_6.sql + ràng buộc công bố báo cáo dùng thử theo code hiện tại
--         + kết quả AI gợi ý chấm bài được lưu lại
--
-- This file is the SINGLE SOURCE OF TRUTH for the data model in v3.7.
-- EF Core configurations and migrations are written to match it (migrations AlignTrialWorkspaceReportCheck,
-- AddPulseAiReviews).
--
-- Changes v3.6 -> v3.7:
--   * trial_workspaces.ck_trial_workspaces_report: báo cáo dùng thử được công bố khi đã có mentor HOẶC owner
--     (TrialConfiguration đã đổi từ 06/11 nhưng thiếu migration, cơ sở dữ liệu vẫn giữ luật cũ chỉ cho mentor).
--   * Bảng mới pulse_ai_reviews: gợi ý chấm của AI cho bài cuối khóa (course_final_submissions) và bài đánh giá
--     trước khi học (course_pre_assessments), một dòng cho mỗi bài nộp. Trang "Chấm bài" dùng lại kết quả đã lưu
--     thay vì gọi AI mỗi lần mở; input_hash đổi (đề, tiêu chí, nội dung khóa, nhật ký giám sát) thì AI chấm lại.
--     Gợi ý dò từ khóa khi AI không khả dụng không được lưu.
-- ============================================================================

BEGIN;

ALTER TABLE trial_workspaces DROP CONSTRAINT ck_trial_workspaces_report;
ALTER TABLE trial_workspaces
    ADD CONSTRAINT ck_trial_workspaces_report
    CHECK (report_published_at IS NULL OR mentor_user_id IS NOT NULL OR owner_user_id IS NOT NULL);

CREATE TABLE pulse_ai_reviews (
    id               uuid PRIMARY KEY,
    organization_id  uuid NOT NULL REFERENCES organizations(id),
    submission_kind  varchar(20) NOT NULL,
    submission_id    uuid NOT NULL,           -- course_final_submissions.id (FINAL) hoặc course_pre_assessments.id (PRE_ASSESSMENT)
    input_hash       varchar(64) NOT NULL,    -- SHA-256 (hex) của dữ liệu đã gửi cho AI
    result           jsonb NOT NULL,          -- checks, summary, criterionNotes, detail, fraud
    model            varchar(100),
    created_at       timestamptz NOT NULL,
    updated_at       timestamptz NOT NULL,
    CONSTRAINT ck_pulse_ai_reviews_kind CHECK (submission_kind IN ('FINAL', 'PRE_ASSESSMENT')),
    CONSTRAINT ck_pulse_ai_reviews_input_hash CHECK (char_length(input_hash) = 64)
);

CREATE UNIQUE INDEX uq_pulse_ai_reviews_submission ON pulse_ai_reviews (submission_kind, submission_id);
CREATE INDEX ix_pulse_ai_reviews_organization_id ON pulse_ai_reviews (organization_id);

COMMIT;
