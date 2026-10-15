-- ============================================================================
-- DigiTalent AI — Canonical Database Schema v3.2
-- Target: PostgreSQL 16+
-- Source: DigiTalent_AI_Canonical_v3_1.sql + trần năng lực doanh nghiệp / phòng ban v3.2
--
-- This file is the SINGLE SOURCE OF TRUTH for the data model in v3.2.
-- EF Core entities, configurations and migrations are written to match it.
--
-- Changes v3.1 -> v3.2 (Lý thuyết trần nhà — QuyTD13/Luồng vận hành Digital AI.html §III):
--   * Section 18: CAPABILITY CEILINGS
--       1. capability_ceilings: cấp cao nhất (0–3) doanh nghiệp, hoặc một phòng ban, mở cho từng lĩnh vực
--          năng lực (competency_categories). Ma trận 6 lĩnh vực × 3 cấp = 18 khóa là trần Digital AI;
--          các ô nằm dưới trần chính là lộ trình.
--          Quy tắc (kiểm tra ở tầng ứng dụng vì là ràng buộc giữa nhiều dòng):
--          trần phòng ban ≤ trần doanh nghiệp ≤ trần Digital AI (3), xét riêng từng lĩnh vực.
--          Phòng ban không có dòng nào ở một lĩnh vực thì kế thừa trần doanh nghiệp.
-- ============================================================================

\i DigiTalent_AI_Canonical_v3_1.sql

BEGIN;

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

COMMIT;
