-- Tạo bảng course_modules và lessons (chạy trong DBeaver trước seed-curriculum.sql)

-- 1. course_modules
CREATE TABLE IF NOT EXISTS course_modules (
    id uuid NOT NULL,
    course_id uuid NOT NULL,
    code character varying(80),
    title character varying(250) NOT NULL,
    description text,
    purpose text,
    estimated_minutes integer,
    sort_order integer NOT NULL,
    is_required boolean NOT NULL DEFAULT false,
    status character varying(30) NOT NULL DEFAULT 'ACTIVE',
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    CONSTRAINT pk_course_modules PRIMARY KEY (id),
    CONSTRAINT fk_course_modules_courses_course_id FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE RESTRICT,
    CONSTRAINT ck_course_modules_estimated_minutes CHECK (estimated_minutes IS NULL OR estimated_minutes >= 0),
    CONSTRAINT ck_course_modules_status CHECK (status IN ('ACTIVE','ARCHIVED'))
);

CREATE INDEX IF NOT EXISTS ix_course_modules_course_sort_order ON course_modules (course_id, sort_order);

-- 2. lessons
CREATE TABLE IF NOT EXISTS lessons (
    id uuid NOT NULL,
    module_id uuid NOT NULL,
    code character varying(80),
    title character varying(250) NOT NULL,
    lesson_type character varying(30) NOT NULL DEFAULT 'TEXT',
    content_body text,
    estimated_minutes integer,
    sort_order integer NOT NULL,
    is_required boolean NOT NULL DEFAULT false,
    completion_rule character varying(50) NOT NULL DEFAULT 'VIEW',
    status character varying(30) NOT NULL DEFAULT 'ACTIVE',
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    CONSTRAINT pk_lessons PRIMARY KEY (id),
    CONSTRAINT fk_lessons_course_modules_module_id FOREIGN KEY (module_id) REFERENCES course_modules(id) ON DELETE RESTRICT,
    CONSTRAINT ck_lessons_type CHECK (lesson_type IN ('TEXT','VIDEO','CASE_STUDY','GUIDED_PRACTICE','WORKPLACE_SCENARIO','QUIZ','REFLECTION','ASSIGNMENT')),
    CONSTRAINT ck_lessons_completion_rule CHECK (completion_rule IN ('VIEW','MANUAL_COMPLETE','PASS_CHECK','SUBMIT_ACTIVITY')),
    CONSTRAINT ck_lessons_estimated_minutes CHECK (estimated_minutes IS NULL OR estimated_minutes >= 0),
    CONSTRAINT ck_lessons_status CHECK (status IN ('ACTIVE','ARCHIVED'))
);

CREATE INDEX IF NOT EXISTS ix_lessons_module_sort_order ON lessons (module_id, sort_order);
