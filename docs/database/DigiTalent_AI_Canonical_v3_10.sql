-- ============================================================================
-- DigiTalent AI — Canonical Database Schema v3.10
-- Target: PostgreSQL 16+
-- Source: DigiTalent_AI_Canonical_v3_9.sql + báo cáo hành vi khi làm bài cuối khóa
--
-- This file is the SINGLE SOURCE OF TRUTH for the data model in v3.10.
-- EF Core configurations and migrations are written to match it (migration AddProctoringBehaviorReports).
--
-- Changes v3.9 -> v3.10:
--   * proctoring_events.kind thêm bốn loại sự kiện trình duyệt ghi khi làm bài có giám sát:
--       COPY          sao chép (hoặc cắt) chữ trên trang bài làm
--       PASTE         dán chữ vào trang bài làm
--         detail của COPY / PASTE = '{nơi}:{số ký tự}', nơi = ESSAY (ô tự luận) | QUESTION (đề, câu hỏi) | PAGE (chỗ khác);
--         chỉ ghi số ký tự, không ghi nội dung đã sao chép / dán.
--       IDLE          không gõ phím, không di chuột trên trang bài làm đang mở trong một khoảng dài (duration_ms)
--       SECOND_SCREEN máy nối thêm màn hình phụ (chỉ một màn hình được chia sẻ và ghi)
--   * Bảng mới proctoring_behavior_reports: báo cáo hành vi của một phiên làm bài cuối khóa có giám sát, lập cùng lần
--     nộp bài (status PENDING) với phần tổng hợp từ nhật ký theo luật cố định (risk_score / risk_level). AI phân tích
--     nhật ký ở nền sau khi nộp: READY kèm ai_level, summary và các phát hiện trong details; không phân tích được thì
--     FAILED kèm error_code (AI_NOT_CONFIGURED | AI_UNAVAILABLE | AI_INVALID_ANSWER), phần tổng hợp từ nhật ký vẫn còn.
--     Video không được gửi cho AI, chỉ nhật ký sự kiện. Một phiên một báo cáo; phân tích lại ghi đè.
--     Bài cuối khóa nộp trước v3.10 được lập báo cáo bù khi chủ doanh nghiệp mở danh sách (không có bước dữ liệu ở đây).
--   * Hai quyền mới cho OWNER: behavior_report.read, behavior_report.analyze (seed bởi DbSeeder, không đổi bảng).
-- ============================================================================

BEGIN;

ALTER TABLE proctoring_events DROP CONSTRAINT ck_proctoring_events_kind;
ALTER TABLE proctoring_events ADD CONSTRAINT ck_proctoring_events_kind CHECK (kind IN (
    'STARTED', 'TAB_HIDDEN', 'FOCUS_LOST', 'SHARE_STOPPED', 'SHARE_RESUMED',
    'CAMERA_STOPPED', 'CAMERA_RESUMED', 'MIC_STOPPED', 'MIC_RESUMED', 'SUBMITTED',
    'FACE_MISSING', 'MULTIPLE_FACES', 'LOOKING_AWAY', 'FACE_CHECK_ON', 'FACE_CHECK_OFF',
    'COPY', 'PASTE', 'IDLE', 'SECOND_SCREEN'));

CREATE TABLE proctoring_behavior_reports (
    id                  uuid                     NOT NULL,
    organization_id     uuid                     NOT NULL,
    session_id          uuid                     NOT NULL,
    employee_id         uuid                     NOT NULL,
    course_id           uuid                     NULL,
    final_submission_id uuid                     NULL,
    status              varchar(20)              NOT NULL,
    risk_score          smallint                 NOT NULL,
    risk_level          varchar(10)              NOT NULL,
    ai_level            varchar(10)              NULL,
    summary             text                     NULL,
    details             jsonb                    NOT NULL,
    error_code          varchar(40)              NULL,
    model               varchar(100)             NULL,
    input_hash          varchar(64)              NULL,
    attempt_count       smallint                 NOT NULL DEFAULT 0,
    analyzed_at         timestamp with time zone NULL,
    created_at          timestamp with time zone NOT NULL,
    updated_at          timestamp with time zone NOT NULL,
    CONSTRAINT pk_proctoring_behavior_reports PRIMARY KEY (id),
    CONSTRAINT ck_proctoring_behavior_reports_status CHECK (status IN ('PENDING', 'READY', 'FAILED')),
    CONSTRAINT ck_proctoring_behavior_reports_risk_score CHECK (risk_score BETWEEN 0 AND 100),
    CONSTRAINT ck_proctoring_behavior_reports_risk_level CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
    CONSTRAINT ck_proctoring_behavior_reports_ai_level CHECK (ai_level IS NULL OR ai_level IN ('LOW', 'MEDIUM', 'HIGH')),
    CONSTRAINT ck_proctoring_behavior_reports_ready CHECK (status <> 'READY' OR (ai_level IS NOT NULL AND analyzed_at IS NOT NULL)),
    CONSTRAINT ck_proctoring_behavior_reports_failed CHECK (status <> 'FAILED' OR error_code IS NOT NULL),
    CONSTRAINT ck_proctoring_behavior_reports_input_hash CHECK (input_hash IS NULL OR char_length(input_hash) = 64),
    CONSTRAINT ck_proctoring_behavior_reports_attempt_count CHECK (attempt_count >= 0),
    CONSTRAINT fk_proctoring_behavior_reports_organizations_organization_id
        FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE RESTRICT,
    CONSTRAINT fk_proctoring_behavior_reports_proctoring_sessions_session_id
        FOREIGN KEY (session_id) REFERENCES proctoring_sessions (id) ON DELETE RESTRICT,
    CONSTRAINT fk_proctoring_behavior_reports_employees_employee_id
        FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE RESTRICT,
    CONSTRAINT fk_proctoring_behavior_reports_courses_course_id
        FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE RESTRICT,
    CONSTRAINT fk_proctoring_behavior_reports_course_final_submissions_final_
        FOREIGN KEY (final_submission_id) REFERENCES course_final_submissions (id) ON DELETE RESTRICT
);

CREATE UNIQUE INDEX uq_proctoring_behavior_reports_session ON proctoring_behavior_reports (session_id);
CREATE INDEX ix_proctoring_behavior_reports_org_created ON proctoring_behavior_reports (organization_id, created_at);
CREATE INDEX ix_proctoring_behavior_reports_employee_id ON proctoring_behavior_reports (employee_id);
CREATE INDEX ix_proctoring_behavior_reports_course_id ON proctoring_behavior_reports (course_id);
CREATE INDEX ix_proctoring_behavior_reports_final_submission_id ON proctoring_behavior_reports (final_submission_id);
CREATE INDEX ix_proctoring_behavior_reports_pending ON proctoring_behavior_reports (updated_at) WHERE status = 'PENDING';

COMMIT;
