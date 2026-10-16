-- ============================================================================
-- DigiTalent AI — Canonical Database Schema v3.3
-- Target: PostgreSQL 16+
-- Source: DigiTalent_AI_Canonical_v3_2.sql + Pulse: đánh giá trước khi học và bài làm có giám sát
--
-- This file is the SINGLE SOURCE OF TRUTH for the data model in v3.3.
-- EF Core entities, configurations and migrations are written to match it.
--
-- Changes v3.2 -> v3.3 (docs/specs/2026-10-16-pulse-employee-roadmap-proctoring.md):
--   * Section 20: PULSE PRE-ASSESSMENT & PROCTORING
--       1. proctoring_sessions: một lần làm bài có giám sát (đánh giá trước khi học hoặc bài cuối khóa) của
--          nhân viên cho một khóa. Bài làm bắt buộc chia sẻ toàn bộ màn hình, bật camera và micro.
--       2. proctoring_recordings: các đoạn ghi của một phiên. Mỗi lần trình duyệt bắt đầu ghi một nguồn
--          (SCREEN = toàn bộ màn hình, CAMERA = camera kèm âm thanh micro) là một đoạn, lưu thành một tệp;
--          dừng chia sẻ rồi chia sẻ lại tạo đoạn mới. Tệp được ghép dần theo từng mẩu tải lên.
--       3. proctoring_events: nhật ký giám sát (rời tab, rời cửa sổ, ngừng chia sẻ, mất camera / micro…),
--          tính theo mili giây kể từ lúc bắt đầu phiên, để người chấm tua tới.
--       4. course_pre_assessments: bài đánh giá trước khi học — một bài cho mỗi nhân viên × khóa, đề và tiêu chí
--          như bài cuối khóa, quản lý phòng ban chấm. PASSED: khóa được công nhận (lượt học COMPLETED,
--          enrollment_id trỏ tới lượt đó), không cần học. NOT_YET: nhân viên học khóa rồi làm bài cuối khóa.
--   * course_final_submissions.proctoring_session_id: phiên có giám sát của lần nộp (null với bài nộp cũ).
--   * Phần trắc nghiệm của bài làm (20.6, 20.7): bài đánh giá trước khi học và bài cuối khóa gồm 10 câu trắc nghiệm
--     rút từ câu ôn tập các mô-đun của khóa + phần tự luận. Trắc nghiệm tự chấm lúc nộp (choice_score / choice_total,
--     exam_choice_answers); nhân viên chỉ thấy kết quả sau khi người chấm quyết định; "Đạt" cần đúng ít nhất 70% số câu.
--   Bài kiểm tra đầu vào (capability_baselines, capability_baseline_answers) không còn được dùng ở cổng
--   nhân viên; bảng được giữ nguyên để không mất dữ liệu cũ.
-- ============================================================================

\i DigiTalent_AI_Canonical_v3_2.sql

BEGIN;

-- ============================================================================
-- 20. PULSE PRE-ASSESSMENT & PROCTORING
-- ============================================================================

-- 20.1. Phiên làm bài có giám sát.
--   kind:   PRE_ASSESSMENT (đánh giá trước khi học) | FINAL (bài cuối khóa)
--   status: RECORDING (đang làm) | SUBMITTED (đã nộp kèm bài) | ABANDONED (bỏ dở / được thay bằng phiên mới)
CREATE TABLE proctoring_sessions (
    id              uuid PRIMARY KEY,
    employee_id     uuid NOT NULL REFERENCES employees(id),
    course_id       uuid NOT NULL REFERENCES courses(id),
    kind            varchar(20) NOT NULL,
    status          varchar(20) NOT NULL,
    started_at      timestamptz NOT NULL,
    ended_at        timestamptz,
    duration_ms     bigint,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ck_proctoring_sessions_kind
        CHECK (kind IN ('PRE_ASSESSMENT', 'FINAL')),
    CONSTRAINT ck_proctoring_sessions_status
        CHECK (status IN ('RECORDING', 'SUBMITTED', 'ABANDONED')),
    CONSTRAINT ck_proctoring_sessions_ended
        CHECK ((status = 'RECORDING' AND ended_at IS NULL)
            OR (status <> 'RECORDING' AND ended_at IS NOT NULL AND ended_at >= started_at)),
    CONSTRAINT ck_proctoring_sessions_duration
        CHECK (duration_ms IS NULL OR duration_ms >= 0)
);

CREATE INDEX ix_proctoring_sessions_employee_course
    ON proctoring_sessions(employee_id, course_id);
CREATE INDEX ix_proctoring_sessions_course_id
    ON proctoring_sessions(course_id);

-- 20.2. Đoạn ghi của một phiên (một tệp mỗi đoạn).
--   track: SCREEN (toàn bộ màn hình, không tiếng) | CAMERA (camera + âm thanh micro)
--   display_surface: giá trị trình duyệt báo cho nguồn SCREEN ('monitor' = toàn bộ màn hình).
--   start_offset_ms / end_offset_ms: vị trí của đoạn trên dòng thời gian của phiên.
--   chunk_count / size_bytes: số mẩu và dung lượng đã ghép vào tệp; storage_path có sau mẩu đầu tiên.
CREATE TABLE proctoring_recordings (
    id               uuid PRIMARY KEY,
    session_id       uuid NOT NULL REFERENCES proctoring_sessions(id),
    track            varchar(10) NOT NULL,
    segment_no       smallint NOT NULL,
    content_type     varchar(100) NOT NULL,
    display_surface  varchar(20),
    storage_path     varchar(500),
    start_offset_ms  bigint NOT NULL,
    end_offset_ms    bigint,
    chunk_count      integer NOT NULL DEFAULT 0,
    size_bytes       bigint NOT NULL DEFAULT 0,
    created_at       timestamptz NOT NULL DEFAULT now(),
    updated_at       timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ck_proctoring_recordings_track
        CHECK (track IN ('SCREEN', 'CAMERA')),
    CONSTRAINT ck_proctoring_recordings_segment_no
        CHECK (segment_no BETWEEN 1 AND 50),
    CONSTRAINT ck_proctoring_recordings_offsets
        CHECK (start_offset_ms >= 0 AND (end_offset_ms IS NULL OR end_offset_ms >= start_offset_ms)),
    CONSTRAINT ck_proctoring_recordings_size
        CHECK (chunk_count >= 0 AND size_bytes >= 0)
);

CREATE UNIQUE INDEX uq_proctoring_recordings_session_track_segment
    ON proctoring_recordings(session_id, track, segment_no);

-- 20.3. Nhật ký giám sát của một phiên.
--   offset_ms: mili giây kể từ started_at của phiên; duration_ms: thời lượng (ví dụ rời tab 5 giây).
CREATE TABLE proctoring_events (
    id           uuid PRIMARY KEY,
    session_id   uuid NOT NULL REFERENCES proctoring_sessions(id),
    kind         varchar(30) NOT NULL,
    offset_ms    bigint NOT NULL,
    duration_ms  bigint,
    detail       varchar(300),
    occurred_at  timestamptz NOT NULL,
    created_at   timestamptz NOT NULL DEFAULT now(),
    updated_at   timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ck_proctoring_events_kind
        CHECK (kind IN ('STARTED', 'TAB_HIDDEN', 'FOCUS_LOST', 'SHARE_STOPPED', 'SHARE_RESUMED',
                        'CAMERA_STOPPED', 'CAMERA_RESUMED', 'MIC_STOPPED', 'MIC_RESUMED', 'SUBMITTED')),
    CONSTRAINT ck_proctoring_events_offsets
        CHECK (offset_ms >= 0 AND (duration_ms IS NULL OR duration_ms >= 0))
);

CREATE INDEX ix_proctoring_events_session_offset
    ON proctoring_events(session_id, offset_ms);

-- 20.4. Bài đánh giá trước khi học (một bài cho mỗi nhân viên × khóa).
CREATE TABLE course_pre_assessments (
    id                     uuid PRIMARY KEY,
    employee_id            uuid NOT NULL REFERENCES employees(id),
    course_id              uuid NOT NULL REFERENCES courses(id),
    proctoring_session_id  uuid REFERENCES proctoring_sessions(id),
    evidence_text          text NOT NULL,
    submitted_at           timestamptz NOT NULL,
    decision               varchar(20),
    decision_reason        text,
    reviewed_by_user_id    uuid REFERENCES users(id),
    reviewed_at            timestamptz,
    enrollment_id          uuid REFERENCES enrollments(id),
    created_at             timestamptz NOT NULL DEFAULT now(),
    updated_at             timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ck_course_pre_assessments_evidence
        CHECK (char_length(evidence_text) BETWEEN 30 AND 8000),
    CONSTRAINT ck_course_pre_assessments_decision
        CHECK (decision IS NULL OR decision IN ('PASSED', 'NOT_YET')),
    CONSTRAINT ck_course_pre_assessments_review_complete
        CHECK ((decision IS NULL AND decision_reason IS NULL AND reviewed_by_user_id IS NULL AND reviewed_at IS NULL)
            OR (decision IS NOT NULL AND char_length(decision_reason) >= 10
                AND reviewed_by_user_id IS NOT NULL AND reviewed_at IS NOT NULL)),
    CONSTRAINT ck_course_pre_assessments_reviewed_after_submit
        CHECK (reviewed_at IS NULL OR reviewed_at >= submitted_at),
    CONSTRAINT ck_course_pre_assessments_enrollment
        CHECK (enrollment_id IS NULL OR decision = 'PASSED')
);

CREATE UNIQUE INDEX uq_course_pre_assessments_employee_course
    ON course_pre_assessments(employee_id, course_id);
CREATE UNIQUE INDEX uq_course_pre_assessments_session
    ON course_pre_assessments(proctoring_session_id)
    WHERE proctoring_session_id IS NOT NULL;
CREATE INDEX ix_course_pre_assessments_course_id
    ON course_pre_assessments(course_id);
CREATE INDEX ix_course_pre_assessments_pending
    ON course_pre_assessments(submitted_at)
    WHERE decision IS NULL;
CREATE INDEX ix_course_pre_assessments_reviewed_by_user_id
    ON course_pre_assessments(reviewed_by_user_id);
CREATE INDEX ix_course_pre_assessments_enrollment_id
    ON course_pre_assessments(enrollment_id);

-- 20.5. Lần nộp bài cuối khóa gắn với phiên có giám sát.
ALTER TABLE course_final_submissions
    ADD COLUMN proctoring_session_id uuid REFERENCES proctoring_sessions(id);

CREATE UNIQUE INDEX uq_course_final_submissions_session
    ON course_final_submissions(proctoring_session_id)
    WHERE proctoring_session_id IS NOT NULL;

-- 20.6. Điểm phần trắc nghiệm của bài làm.
--   Đề = tối đa 10 câu rút từ câu ôn tập các mô-đun của khóa (assessments QUIZ có module_id), rải đều các mô-đun;
--   bài đánh giá trước khi học và từng lần nộp bài cuối rút nhóm câu khác nhau. Chấm tự động lúc nộp.
--   choice_score / choice_total: số câu đúng / số câu của đề; null với bài nộp trước khi có trắc nghiệm hoặc khóa
--   chưa có câu ôn tập. Quyết định PASSED cần choice_score >= ceil(choice_total * 0.7) (10 câu → 7).
ALTER TABLE course_final_submissions
    ADD COLUMN choice_score smallint,
    ADD COLUMN choice_total smallint,
    ADD CONSTRAINT ck_course_final_submissions_choice
        CHECK ((choice_score IS NULL AND choice_total IS NULL)
            OR (choice_total BETWEEN 1 AND 50 AND choice_score BETWEEN 0 AND choice_total));

ALTER TABLE course_pre_assessments
    ADD COLUMN choice_score smallint,
    ADD COLUMN choice_total smallint,
    ADD CONSTRAINT ck_course_pre_assessments_choice
        CHECK ((choice_score IS NULL AND choice_total IS NULL)
            OR (choice_total BETWEEN 1 AND 50 AND choice_score BETWEEN 0 AND choice_total));

-- 20.7. Câu trả lời trắc nghiệm của một bài làm: thuộc đúng một lần nộp bài cuối khóa hoặc một bài đánh giá
--   trước khi học. sort_order = số thứ tự câu trong đề (1-based).
CREATE TABLE exam_choice_answers (
    id                   uuid PRIMARY KEY,
    final_submission_id  uuid REFERENCES course_final_submissions(id),
    pre_assessment_id    uuid REFERENCES course_pre_assessments(id),
    question_id          uuid NOT NULL REFERENCES questions(id),
    selected_option_id   uuid NOT NULL REFERENCES question_options(id),
    is_correct           boolean NOT NULL,
    sort_order           smallint NOT NULL,
    created_at           timestamptz NOT NULL DEFAULT now(),
    updated_at           timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ck_exam_choice_answers_owner
        CHECK ((final_submission_id IS NULL) <> (pre_assessment_id IS NULL)),
    CONSTRAINT ck_exam_choice_answers_sort_order
        CHECK (sort_order >= 1)
);

CREATE UNIQUE INDEX uq_exam_choice_answers_final_question
    ON exam_choice_answers(final_submission_id, question_id)
    WHERE final_submission_id IS NOT NULL;
CREATE UNIQUE INDEX uq_exam_choice_answers_pre_question
    ON exam_choice_answers(pre_assessment_id, question_id)
    WHERE pre_assessment_id IS NOT NULL;
CREATE INDEX ix_exam_choice_answers_question_id
    ON exam_choice_answers(question_id);
CREATE INDEX ix_exam_choice_answers_selected_option_id
    ON exam_choice_answers(selected_option_id);

COMMIT;
