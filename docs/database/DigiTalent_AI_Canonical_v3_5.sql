-- ============================================================================
-- DigiTalent AI — Canonical Database Schema v3.5
-- Target: PostgreSQL 16+
-- Source: DigiTalent_AI_Canonical_v3_4.sql + Dùng thử doanh nghiệp: bài đánh giá tổng hợp và mentor chấm bài
--
-- This file is the SINGLE SOURCE OF TRUTH for the data model in v3.5.
-- EF Core entities, configurations and migrations are written to match it (migrations AddTrialAssessmentFlow,
-- AddTrialEssayScores).
--
-- Changes v3.4 -> v3.5 (docs/specs/2026-10-27-enterprise-trial-assessment.md):
--   * Role MENTOR (dữ liệu, bảng roles): nhân sự nền tảng không thuộc tổ chức, chấm bài dùng thử được phân công.
--   * trial_workspaces (tạo bởi migration 20261006083637_AddEnterpriseGuidedTrial) thêm yêu cầu chấm: hạn làm bài, giờ mong
--     muốn chấm, ghi chú, lúc gửi, mentor được phân công và lúc công bố bảng năng lực.
--   * proctoring_sessions: kind TRIAL_ASSESSMENT, course_id NULL cho bài dùng thử (không thuộc khóa nào).
--   * trial_assessments: bài đánh giá tổng hợp ba cấp của một nhân viên (trắc nghiệm + ba bài tự luận, có giám sát),
--     điểm mentor cho từng bài tự luận (0–10, đạt từ 5) và gợi ý chấm của AI (jsonb, chỉ để tham khảo).
--   * trial_assessment_domains: số câu đúng theo cấp, mức gợi ý và mức mentor chấm cho từng lĩnh vực.
--   * exam_choice_answers: thêm chủ sở hữu trial_assessment_id (đúng một trong ba chủ sở hữu).
-- ============================================================================

\i DigiTalent_AI_Canonical_v3_4.sql

BEGIN;

-- 22.1. Yêu cầu chấm bài của doanh nghiệp dùng thử. Bước = SETUP (chưa gửi) → REQUESTED → ASSIGNED (có mentor)
--       → REPORTED (đã công bố), suy ra từ các cột, không lưu riêng.
ALTER TABLE trial_workspaces
    ADD COLUMN test_deadline        timestamptz,
    ADD COLUMN preferred_review_at  timestamptz,
    ADD COLUMN request_note         varchar(500),
    ADD COLUMN requested_at         timestamptz,
    ADD COLUMN mentor_user_id       uuid REFERENCES users(id),
    ADD COLUMN mentor_assigned_at   timestamptz,
    ADD COLUMN report_published_at  timestamptz,
    ADD CONSTRAINT ck_trial_workspaces_request
        CHECK (requested_at IS NULL OR test_deadline IS NOT NULL),
    ADD CONSTRAINT ck_trial_workspaces_mentor
        CHECK ((mentor_user_id IS NULL) = (mentor_assigned_at IS NULL)),
    ADD CONSTRAINT ck_trial_workspaces_report
        CHECK (report_published_at IS NULL OR mentor_user_id IS NOT NULL);

CREATE INDEX ix_trial_workspaces_mentor_user_id ON trial_workspaces(mentor_user_id);

-- 22.2. Phiên giám sát của bài dùng thử không gắn khóa.
ALTER TABLE proctoring_sessions ALTER COLUMN course_id DROP NOT NULL;
ALTER TABLE proctoring_sessions DROP CONSTRAINT ck_proctoring_sessions_kind;
ALTER TABLE proctoring_sessions ADD CONSTRAINT ck_proctoring_sessions_kind
    CHECK (kind IN ('PRE_ASSESSMENT', 'FINAL', 'TRIAL_ASSESSMENT'));
ALTER TABLE proctoring_sessions ADD CONSTRAINT ck_proctoring_sessions_course
    CHECK ((kind = 'TRIAL_ASSESSMENT') = (course_id IS NULL));

-- 22.3. Bài đánh giá tổng hợp: một bài mỗi nhân viên; trắc nghiệm của mọi lĩnh vực ở cả ba cấp (rút từ câu ôn tập của
--       khóa chuẩn ở mỗi ô lĩnh vực × cấp) và ba bài tự luận (Cơ bản, Trung cấp, Nâng cao). Mentor cho điểm từng bài tự
--       luận 0–10 (đạt từ 5; NULL khi chưa chấm); ai_essay_review = gợi ý điểm + nhận xét của AI cho mentor tham khảo.
CREATE TABLE trial_assessments (
    id                     uuid PRIMARY KEY,
    organization_id        uuid NOT NULL REFERENCES organizations(id),
    employee_id            uuid NOT NULL REFERENCES employees(id),
    proctoring_session_id  uuid NOT NULL REFERENCES proctoring_sessions(id),
    essay_basic            text NOT NULL,
    essay_intermediate     text NOT NULL,
    essay_advanced         text NOT NULL,
    choice_score           smallint NOT NULL,
    choice_total           smallint NOT NULL,
    submitted_at           timestamptz NOT NULL,
    reviewed_by_user_id    uuid REFERENCES users(id),
    reviewed_at            timestamptz,
    review_note            varchar(2000),
    essay_basic_score         smallint,
    essay_intermediate_score  smallint,
    essay_advanced_score      smallint,
    ai_essay_review           jsonb,
    ai_essay_reviewed_at      timestamptz,
    created_at             timestamptz NOT NULL DEFAULT now(),
    updated_at             timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ck_trial_assessments_choice
        CHECK (choice_total >= 0 AND choice_score BETWEEN 0 AND choice_total),
    CONSTRAINT ck_trial_assessments_review
        CHECK ((reviewed_at IS NULL) = (reviewed_by_user_id IS NULL)),
    CONSTRAINT ck_trial_assessments_essay_scores
        CHECK ((essay_basic_score IS NULL OR essay_basic_score BETWEEN 0 AND 10)
           AND (essay_intermediate_score IS NULL OR essay_intermediate_score BETWEEN 0 AND 10)
           AND (essay_advanced_score IS NULL OR essay_advanced_score BETWEEN 0 AND 10)),
    CONSTRAINT ck_trial_assessments_ai_review
        CHECK ((ai_essay_review IS NULL) = (ai_essay_reviewed_at IS NULL))
);

CREATE UNIQUE INDEX uq_trial_assessments_employee ON trial_assessments(employee_id);
CREATE UNIQUE INDEX uq_trial_assessments_session ON trial_assessments(proctoring_session_id);
CREATE INDEX ix_trial_assessments_organization_id ON trial_assessments(organization_id);
CREATE INDEX ix_trial_assessments_reviewed_by_user_id ON trial_assessments(reviewed_by_user_id);

-- 22.4. Kết quả từng lĩnh vực. suggested_level = cấp cao nhất đạt liên tiếp từ Cơ bản (≥ 70% số câu của cấp);
--       mentor_level = mức mentor quyết định (0 = chưa đạt Cơ bản), NULL khi chưa chấm.
CREATE TABLE trial_assessment_domains (
    id                    uuid PRIMARY KEY,
    trial_assessment_id   uuid NOT NULL REFERENCES trial_assessments(id),
    category_id           uuid NOT NULL REFERENCES competency_categories(id),
    basic_correct         smallint NOT NULL,
    basic_total           smallint NOT NULL,
    intermediate_correct  smallint NOT NULL,
    intermediate_total    smallint NOT NULL,
    advanced_correct      smallint NOT NULL,
    advanced_total        smallint NOT NULL,
    suggested_level       smallint NOT NULL,
    mentor_level          smallint,
    created_at            timestamptz NOT NULL DEFAULT now(),
    updated_at            timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ck_trial_assessment_domains_counts
        CHECK (basic_correct BETWEEN 0 AND basic_total AND intermediate_correct BETWEEN 0 AND intermediate_total
               AND advanced_correct BETWEEN 0 AND advanced_total),
    CONSTRAINT ck_trial_assessment_domains_levels
        CHECK (suggested_level BETWEEN 0 AND 3 AND (mentor_level IS NULL OR mentor_level BETWEEN 0 AND 3))
);

CREATE UNIQUE INDEX uq_trial_assessment_domains_category ON trial_assessment_domains(trial_assessment_id, category_id);
CREATE INDEX ix_trial_assessment_domains_category_id ON trial_assessment_domains(category_id);

-- 22.5. Câu trả lời trắc nghiệm của bài dùng thử.
ALTER TABLE exam_choice_answers ADD COLUMN trial_assessment_id uuid REFERENCES trial_assessments(id);
ALTER TABLE exam_choice_answers DROP CONSTRAINT ck_exam_choice_answers_owner;
ALTER TABLE exam_choice_answers ADD CONSTRAINT ck_exam_choice_answers_owner
    CHECK (num_nonnulls(final_submission_id, pre_assessment_id, trial_assessment_id) = 1);
CREATE UNIQUE INDEX uq_exam_choice_answers_trial_question
    ON exam_choice_answers(trial_assessment_id, question_id)
    WHERE trial_assessment_id IS NOT NULL;

COMMIT;
