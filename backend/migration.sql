START TRANSACTION;

CREATE TABLE course_modules (
    id uuid NOT NULL,
    course_id uuid NOT NULL,
    code character varying(80),
    title character varying(250) NOT NULL,
    description text,
    purpose text,
    estimated_minutes integer,
    sort_order integer NOT NULL,
    is_required boolean NOT NULL DEFAULT FALSE,
    status character varying(30) NOT NULL DEFAULT 'ACTIVE',
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    CONSTRAINT pk_course_modules PRIMARY KEY (id),
    CONSTRAINT ck_course_modules_estimated_minutes CHECK (estimated_minutes IS NULL OR estimated_minutes >= 0),
    CONSTRAINT ck_course_modules_status CHECK (status IN ('ACTIVE','ARCHIVED')),
    CONSTRAINT fk_course_modules_courses_course_id FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE RESTRICT
);

CREATE INDEX ix_course_modules_course_sort_order ON course_modules (course_id, sort_order);

CREATE TABLE lessons (
    id uuid NOT NULL,
    module_id uuid NOT NULL,
    code character varying(80),
    title character varying(250) NOT NULL,
    lesson_type character varying(30) NOT NULL DEFAULT 'TEXT',
    content_body text,
    estimated_minutes integer,
    sort_order integer NOT NULL,
    is_required boolean NOT NULL DEFAULT FALSE,
    completion_rule character varying(50) NOT NULL DEFAULT 'VIEW',
    status character varying(30) NOT NULL DEFAULT 'ACTIVE',
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    CONSTRAINT pk_lessons PRIMARY KEY (id),
    CONSTRAINT ck_lessons_type CHECK (lesson_type IN ('TEXT','VIDEO','CASE_STUDY','GUIDED_PRACTICE','WORKPLACE_SCENARIO','QUIZ','REFLECTION','ASSIGNMENT')),
    CONSTRAINT ck_lessons_completion_rule CHECK (completion_rule IN ('VIEW','MANUAL_COMPLETE','PASS_CHECK','SUBMIT_ACTIVITY')),
    CONSTRAINT ck_lessons_estimated_minutes CHECK (estimated_minutes IS NULL OR estimated_minutes >= 0),
    CONSTRAINT ck_lessons_status CHECK (status IN ('ACTIVE','ARCHIVED')),
    CONSTRAINT fk_lessons_course_modules_module_id FOREIGN KEY (module_id) REFERENCES course_modules (id) ON DELETE RESTRICT
);

CREATE INDEX ix_lessons_module_sort_order ON lessons (module_id, sort_order);

INSERT INTO "__EFMigrationsHistory" (migration_id, product_version)
VALUES ('20261005065801_AddCourseModulesAndLessons', '8.0.31');

COMMIT;
