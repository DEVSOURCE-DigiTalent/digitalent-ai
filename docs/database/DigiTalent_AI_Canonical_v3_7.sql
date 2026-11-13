-- ============================================================================
-- DigiTalent AI — Canonical Database Schema v3.7
-- Target: PostgreSQL 16+
-- Source: DigiTalent_AI_Canonical_v3_6.sql + ràng buộc công bố báo cáo dùng thử theo code hiện tại
--
-- This file is the SINGLE SOURCE OF TRUTH for the data model in v3.7.
-- EF Core configurations and migrations are written to match it (migration AlignTrialWorkspaceReportCheck).
--
-- Changes v3.6 -> v3.7:
--   * trial_workspaces.ck_trial_workspaces_report: báo cáo dùng thử được công bố khi đã có mentor HOẶC owner
--     (TrialConfiguration đã đổi từ 06/11 nhưng thiếu migration, cơ sở dữ liệu vẫn giữ luật cũ chỉ cho mentor).
-- ============================================================================

BEGIN;

ALTER TABLE trial_workspaces DROP CONSTRAINT ck_trial_workspaces_report;
ALTER TABLE trial_workspaces
    ADD CONSTRAINT ck_trial_workspaces_report
    CHECK (report_published_at IS NULL OR mentor_user_id IS NOT NULL OR owner_user_id IS NOT NULL);

COMMIT;
