-- ============================================================================
-- DigiTalent AI — Canonical Database Schema v3.1
-- Target: PostgreSQL 16+
-- Source: DigiTalent_AI_Canonical_v3_0.sql + Pulse employee learning v3.1
--
-- This file is the SINGLE SOURCE OF TRUTH for the data model in v3.1.
-- EF Core entities, configurations and migrations are written to match it.
--
-- Changes v3.0 -> v3.1 (Pulse — docs/ui-redesign/16-pulse-product-flow-detailed.md):
--   * assessments.module_id: câu hỏi ôn tập của một mô đun (QUIZ, không phải bài cuối).
--   * Section 17: PULSE EMPLOYEE LEARNING
--       1. capability_baselines: mức đầu vào theo lĩnh vực (competency_categories), cố định sau bài đầu vào.
--       2. capability_baseline_answers: câu trả lời của bài đầu vào (chấm theo chuỗi mức liên tiếp).
--       3. course_final_submissions: bài cuối khóa do quản lý phòng ban chấm, tối đa 2 lần nộp.
-- ============================================================================

\i DigiTalent_AI_Canonical_v3_0.sql

BEGIN;

-- ============================================================================
-- CẬP NHẬT ASSESSMENTS — câu hỏi ôn tập theo mô đun
-- ============================================================================

ALTER TABLE assessments
    ADD COLUMN module_id uuid REFERENCES course_modules(id);

ALTER TABLE assessments
    ADD CONSTRAINT ck_assessments_module_quiz
        CHECK (module_id IS NULL OR (assessment_type = 'QUIZ' AND NOT is_final));

CREATE INDEX ix_assessments_module_id ON assessments(module_id);

-- ============================================================================
-- 17. PULSE EMPLOYEE LEARNING
-- ============================================================================

-- 17.1. Mức đầu vào theo lĩnh vực năng lực.
-- Chỉ có dòng cho lĩnh vực nằm trong mục tiêu vị trí (target_level >= 1).
-- baseline_level = 0 nghĩa là đã làm bài nhưng chưa đạt mức Cơ bản.
CREATE TABLE capability_baselines (
    id                      uuid PRIMARY KEY,
    employee_id             uuid NOT NULL REFERENCES employees(id),
    competency_category_id  uuid NOT NULL REFERENCES competency_categories(id),
    target_level            smallint NOT NULL,
    baseline_level          smallint NOT NULL,
    assessed_at             timestamptz NOT NULL,
    created_at              timestamptz NOT NULL DEFAULT now(),
    updated_at              timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_capability_baselines_employee_category
        UNIQUE (employee_id, competency_category_id),
    CONSTRAINT ck_capability_baselines_target_level
        CHECK (target_level BETWEEN 1 AND 3),
    CONSTRAINT ck_capability_baselines_baseline_level
        CHECK (baseline_level BETWEEN 0 AND target_level)
);

CREATE INDEX ix_capability_baselines_competency_category_id
    ON capability_baselines(competency_category_id);

-- 17.2. Câu trả lời của bài đầu vào (một lần làm bài cho mỗi nhân viên).
CREATE TABLE capability_baseline_answers (
    id                  uuid PRIMARY KEY,
    employee_id         uuid NOT NULL REFERENCES employees(id),
    question_id         uuid NOT NULL REFERENCES questions(id),
    selected_option_id  uuid NOT NULL REFERENCES question_options(id),
    is_correct          boolean NOT NULL,
    answered_at         timestamptz NOT NULL,
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_capability_baseline_answers_employee_question
        UNIQUE (employee_id, question_id)
);

CREATE INDEX ix_capability_baseline_answers_question_id
    ON capability_baseline_answers(question_id);
CREATE INDEX ix_capability_baseline_answers_selected_option_id
    ON capability_baseline_answers(selected_option_id);

-- 17.3. Bài cuối khóa (ghi chú minh chứng) do quản lý phòng ban của nhân viên chấm.
--   Lần 1 chưa đạt → retry_opens_at / retry_due_at (chụp chính sách tại lúc chấm) mở lần nộp 2 (lần cuối).
--   Lần 2 chưa đạt → cờ cần hỗ trợ; quản lý ghi nhận hướng hỗ trợ (support_*).
CREATE TABLE course_final_submissions (
    id                           uuid PRIMARY KEY,
    enrollment_id                uuid NOT NULL REFERENCES enrollments(id),
    attempt_no                   smallint NOT NULL,
    evidence_text                text NOT NULL,
    submitted_at                 timestamptz NOT NULL,
    decision                     varchar(20),
    decision_reason              text,
    reviewed_by_user_id          uuid REFERENCES users(id),
    reviewed_at                  timestamptz,
    retry_opens_at               timestamptz,
    retry_due_at                 timestamptz,
    support_action               varchar(30),
    support_note                 text,
    support_recorded_by_user_id  uuid REFERENCES users(id),
    support_recorded_at          timestamptz,
    created_at                   timestamptz NOT NULL DEFAULT now(),
    updated_at                   timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_course_final_submissions_enrollment_attempt
        UNIQUE (enrollment_id, attempt_no),
    CONSTRAINT ck_course_final_submissions_attempt_no
        CHECK (attempt_no BETWEEN 1 AND 2),
    CONSTRAINT ck_course_final_submissions_evidence
        CHECK (char_length(evidence_text) BETWEEN 30 AND 8000),
    CONSTRAINT ck_course_final_submissions_decision
        CHECK (decision IS NULL OR decision IN ('PASSED','NOT_YET')),
    CONSTRAINT ck_course_final_submissions_review_complete
        CHECK (
            (decision IS NULL AND decision_reason IS NULL AND reviewed_by_user_id IS NULL AND reviewed_at IS NULL)
            OR (decision IS NOT NULL AND char_length(decision_reason) >= 10
                AND reviewed_by_user_id IS NOT NULL AND reviewed_at IS NOT NULL)
        ),
    CONSTRAINT ck_course_final_submissions_reviewed_after_submit
        CHECK (reviewed_at IS NULL OR reviewed_at >= submitted_at),
    CONSTRAINT ck_course_final_submissions_retry_window
        CHECK (
            (retry_opens_at IS NULL AND retry_due_at IS NULL)
            OR (attempt_no = 1 AND decision = 'NOT_YET' AND retry_due_at > retry_opens_at)
        ),
    CONSTRAINT ck_course_final_submissions_support_action
        CHECK (support_action IS NULL OR support_action IN ('COACHING','FRESH_CYCLE','PAUSE')),
    CONSTRAINT ck_course_final_submissions_support_complete
        CHECK (
            (support_action IS NULL AND support_note IS NULL
                AND support_recorded_by_user_id IS NULL AND support_recorded_at IS NULL)
            OR (support_action IS NOT NULL AND decision = 'NOT_YET'
                AND support_recorded_by_user_id IS NOT NULL AND support_recorded_at IS NOT NULL)
        )
);

CREATE INDEX ix_course_final_submissions_reviewed_by_user_id
    ON course_final_submissions(reviewed_by_user_id);
CREATE INDEX ix_course_final_submissions_support_recorded_by_user_id
    ON course_final_submissions(support_recorded_by_user_id);
-- Hàng chờ chấm của quản lý: bài chưa có quyết định.
CREATE INDEX ix_course_final_submissions_pending
    ON course_final_submissions(submitted_at)
    WHERE decision IS NULL;

COMMIT;
