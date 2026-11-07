-- ============================================================================
-- DigiTalent AI — Canonical Database Schema v3.7
-- Target: PostgreSQL 16+
-- Source: DigiTalent_AI_Canonical_v3_6.sql + Dùng thử doanh nghiệp: báo cáo tự động từ trắc nghiệm và gợi ý AI
--
-- This file is the SINGLE SOURCE OF TRUTH for the data model in v3.7.
-- EF Core entities, configurations and migrations are written to match it (migration AddTrialReports).
--
-- Changes v3.6 -> v3.7 (docs/specs/2026-10-31-trial-ai-report-roadmap.md):
--   * Bài đánh giá dùng thử chỉ còn trắc nghiệm, máy chấm khi nộp; không còn mentor chấm bài đánh giá. Bước = SETUP (chưa đặt
--     hạn) → OPEN (đã đặt hạn) → REPORTED (bài đã đóng), suy ra từ trial_workspaces. Bài đóng khi hết hạn, khi mọi người đã
--     nộp, hoặc khi chủ doanh nghiệp đóng sớm.
--   * trial_workspaces: bỏ ck_trial_workspaces_report (báo cáo không cần mentor). preferred_review_at, request_note không
--     còn ghi; mentor_user_id / mentor_assigned_at chỉ còn cho mentor chấm bài cuối khóa học thử.
--   * trial_assessments: các cột tự luận / điểm mentor / gợi ý AI chấm tự luận giữ dữ liệu cũ, bài mới không ghi
--     (essay_* = ''). trial_assessment_domains.mentor_level không còn ghi; mức = suggested_level.
--   * trial_reports: báo cáo của doanh nghiệp (một dòng). Số liệu luôn tính lại từ bài làm; bảng chỉ giữ gợi ý (3 ưu tiên +
--     lý do mức tối đa từng lĩnh vực) do AI viết rồi qua rào chắn, hoặc câu mẫu, và trạng thái AI.
-- ============================================================================

\i DigiTalent_AI_Canonical_v3_6.sql

BEGIN;

-- 23.1. Báo cáo không còn chờ mentor công bố.
ALTER TABLE trial_workspaces DROP CONSTRAINT ck_trial_workspaces_report;

-- 23.2. Báo cáo dùng thử tự tạo khi bài đóng. ai_status: PENDING (AI đang viết, báo cáo tạm hiện câu mẫu) → DONE (đã có
--       câu AI; câu bị rào chắn loại vẫn là câu mẫu, đếm ở ai_replaced) | FALLBACK (không có khóa AI hoặc AI lỗi: câu mẫu).
--       assessed_count = số bài khi viết gợi ý; bài nộp muộn làm số này đổi → viết lại. Khóa lạc quan bằng cột hệ thống xmin.
CREATE TABLE trial_reports (
    id               uuid PRIMARY KEY,
    organization_id  uuid NOT NULL REFERENCES organizations(id),
    assessed_count   smallint NOT NULL,
    insights         jsonb NOT NULL,              -- {priorities:[{domainNumber,text,source}], ceilingReasons:[...]}
    ai_status        varchar(20) NOT NULL,
    ai_model         varchar(100),
    ai_replaced      smallint NOT NULL,
    generated_at     timestamptz NOT NULL,        -- lúc bài đóng
    ai_completed_at  timestamptz,
    created_at       timestamptz NOT NULL DEFAULT now(),
    updated_at       timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ck_trial_reports_ai_status    CHECK (ai_status IN ('PENDING', 'DONE', 'FALLBACK')),
    CONSTRAINT ck_trial_reports_ai_model     CHECK ((ai_status = 'DONE') = (ai_model IS NOT NULL)),
    CONSTRAINT ck_trial_reports_ai_completed CHECK ((ai_status = 'PENDING') = (ai_completed_at IS NULL)),
    CONSTRAINT ck_trial_reports_counts       CHECK (assessed_count >= 0 AND ai_replaced >= 0)
);
CREATE UNIQUE INDEX uq_trial_reports_organization ON trial_reports(organization_id);
CREATE INDEX ix_trial_reports_ai_status ON trial_reports(ai_status);

COMMIT;
