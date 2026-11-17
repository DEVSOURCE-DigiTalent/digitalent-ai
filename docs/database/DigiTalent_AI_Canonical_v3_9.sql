-- ============================================================================
-- DigiTalent AI — Canonical Database Schema v3.9
-- Target: PostgreSQL 16+
-- Source: DigiTalent_AI_Canonical_v3_8.sql + mốc năng lực doanh nghiệp theo lĩnh vực
--
-- This file is the SINGLE SOURCE OF TRUTH for the data model in v3.9.
-- EF Core configurations and migrations are written to match it (migration AddCompetencyMilestones).
--
-- Changes v3.8 -> v3.9:
--   * competency_milestones: mốc năng lực (0–3) mà doanh nghiệp đặt cho từng lĩnh vực (competency_categories), áp dụng
--     cho cả doanh nghiệp. Đặt được trước khi mua khóa học: mốc không phụ thuộc suất học, khác với trần doanh nghiệp
--     (capability_ceilings, chỉ tới cấp đã mở bản quyền và quyết định lộ trình học).
--     Báo cáo khảo sát dùng thử so mức của từng nhân viên với mốc này để doanh nghiệp quyết định mua khóa nào.
--     0 = chưa đặt mốc: báo cáo dùng mức tham chiếu theo vị trí (bộ yêu cầu vị trí, hoặc mức Digital AI theo Thông tư).
--     Một dòng cho mỗi (doanh nghiệp, lĩnh vực); đổi mốc thì cập nhật dòng, không xóa.
-- ============================================================================

BEGIN;

CREATE TABLE competency_milestones (
    id                      uuid PRIMARY KEY,
    organization_id         uuid NOT NULL REFERENCES organizations(id),
    competency_category_id  uuid NOT NULL REFERENCES competency_categories(id),
    milestone_level         smallint NOT NULL,
    updated_by_user_id      uuid REFERENCES users(id),
    created_at              timestamptz NOT NULL DEFAULT now(),
    updated_at              timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ck_competency_milestones_level
        CHECK (milestone_level BETWEEN 0 AND 3)
);

CREATE UNIQUE INDEX uq_competency_milestones_organization_category
    ON competency_milestones(organization_id, competency_category_id);
CREATE INDEX ix_competency_milestones_competency_category_id
    ON competency_milestones(competency_category_id);
CREATE INDEX ix_competency_milestones_updated_by_user_id
    ON competency_milestones(updated_by_user_id);

COMMENT ON TABLE competency_milestones IS
    'Mốc năng lực doanh nghiệp theo lĩnh vực, đặt được trước khi mua khóa; báo cáo dùng thử so kết quả với mốc này.';
COMMENT ON COLUMN competency_milestones.milestone_level IS
    '0 = chưa đặt (dùng mức tham chiếu theo vị trí), 1–3 = Cơ bản / Trung cấp / Nâng cao.';

COMMIT;
