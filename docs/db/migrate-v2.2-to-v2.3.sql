-- ============================================================================
-- DigiTalent AI — Nâng database từ schema v2.2 lên v2.3
--
-- Chạy 1 lần trên Neon (DBeaver: mở file → Alt+X, hoặc psql -f).
-- Chạy lại nhiều lần cũng không sao: đã có rồi thì bỏ qua.
--
-- Nội dung:
--   1. Thêm created_at / updated_at cho 42 bảng còn thiếu
--   2. employees.job_position_id cho phép NULL
--   3. assessments thêm cột code, đổi khóa phiên bản
--   4. question_banks: owner_trainer_employee_id -> owner_user_id (trỏ sang users)
--   5. Thêm CHECK cho các cột status
--   6. Thêm index cho khóa ngoại hay dùng
--   7. Bỏ role CERTIFICATE_VERIFIER (v2.3 chỉ còn 5 role)
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. Thêm created_at / updated_at
-- ----------------------------------------------------------------------------
ALTER TABLE assessment_answers            ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(), ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE assessment_attempts           ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(), ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE assessments                   ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE assigned_task_targets         ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(), ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE audit_logs                    ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE certificate_verification_logs ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(), ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE certificates                  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(), ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE competency_categories         ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(), ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE competency_evaluation_results ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(), ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE competency_evidences          ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE competency_framework_mappings ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(), ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE competency_frameworks         ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(), ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE competency_level_criteria     ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(), ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE course_assignments            ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(), ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE course_learning_outcomes      ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(), ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE course_modules                ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(), ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE employee_competency_profiles  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE enrollments                   ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE file_objects                  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE job_families                  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(), ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE learning_materials            ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE lesson_progress               ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(), ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE lessons                       ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(), ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE notifications                 ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE permissions                   ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(), ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE position_requirement_items    ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(), ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE practical_task_targets        ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(), ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE question_banks                ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE question_options              ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(), ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE questions                     ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE readiness_scores              ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(), ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE refresh_tokens                ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE roles                         ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(), ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE scoring_config_items          ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(), ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE scoring_configs               ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE skill_gap_items               ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(), ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE skill_gap_runs                ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(), ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE system_settings               ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE task_assignments              ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(), ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE task_evaluations              ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(), ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE task_submissions              ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(), ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE training_risk_scores          ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(), ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- ----------------------------------------------------------------------------
-- 2. employees.job_position_id cho phép NULL
--    (nhân viên mới chưa gắn chức danh -> skill gap trả NOT_ASSIGNED)
-- ----------------------------------------------------------------------------
ALTER TABLE employees ALTER COLUMN job_position_id DROP NOT NULL;

-- ----------------------------------------------------------------------------
-- 3. assessments: thêm cột code, khóa phiên bản đổi sang (course_id, code, version_no)
-- ----------------------------------------------------------------------------
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS code varchar(50) NOT NULL DEFAULT '';
ALTER TABLE assessments ALTER COLUMN code DROP DEFAULT;

ALTER TABLE assessments DROP CONSTRAINT IF EXISTS uq_assessments_course_title_version;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_assessments_course_code_version') THEN
        ALTER TABLE assessments ADD CONSTRAINT uq_assessments_course_code_version
            UNIQUE (course_id, code, version_no);
    END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 4. question_banks: chủ sở hữu là user, không phải employee
-- ----------------------------------------------------------------------------
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'question_banks' AND column_name = 'owner_trainer_employee_id') THEN
        ALTER TABLE question_banks
            DROP CONSTRAINT IF EXISTS question_banks_owner_trainer_employee_id_fkey;
        ALTER TABLE question_banks
            RENAME COLUMN owner_trainer_employee_id TO owner_user_id;
        ALTER TABLE question_banks
            ADD CONSTRAINT question_banks_owner_user_id_fkey
            FOREIGN KEY (owner_user_id) REFERENCES users(id);
    END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 5. CHECK cho các cột status
-- ----------------------------------------------------------------------------
DO $$
DECLARE
    r record;
BEGIN
    FOR r IN
        SELECT * FROM (VALUES
            ('organizations',         'ck_organizations_status',          $c$status IN ('ACTIVE','INACTIVE')$c$),
            ('roles',                 'ck_roles_status',                  $c$status IN ('ACTIVE','INACTIVE')$c$),
            ('job_families',          'ck_job_families_status',           $c$status IN ('ACTIVE','INACTIVE','ARCHIVED')$c$),
            ('job_positions',         'ck_job_positions_status',          $c$status IN ('ACTIVE','INACTIVE','ARCHIVED')$c$),
            ('departments',           'ck_departments_status',            $c$status IN ('ACTIVE','INACTIVE','ARCHIVED')$c$),
            ('departments',           'ck_departments_not_own_parent',    $c$parent_department_id IS NULL OR parent_department_id <> id$c$),
            ('competencies',          'ck_competencies_status',           $c$status IN ('DRAFT','ACTIVE','ARCHIVED')$c$),
            ('competency_categories', 'ck_competency_categories_status',  $c$status IN ('ACTIVE','INACTIVE','ARCHIVED')$c$),
            ('course_modules',        'ck_course_modules_status',         $c$status IN ('ACTIVE','ARCHIVED')$c$),
            ('lessons',               'ck_lessons_status',                $c$status IN ('ACTIVE','ARCHIVED')$c$),
            ('question_banks',        'ck_question_banks_status',         $c$status IN ('ACTIVE','ARCHIVED')$c$)
        ) AS t(tbl, cons, expr)
    LOOP
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = r.cons) THEN
            EXECUTE format('ALTER TABLE %I ADD CONSTRAINT %I CHECK (%s)', r.tbl, r.cons, r.expr);
        END IF;
    END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- 6. Index cho khóa ngoại hay dùng (PostgreSQL không tự tạo index cho FK)
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS ix_employees_job_position            ON employees (job_position_id);
CREATE INDEX IF NOT EXISTS ix_employees_direct_manager          ON employees (direct_manager_id);
CREATE INDEX IF NOT EXISTS ix_departments_parent                ON departments (parent_department_id);
CREATE INDEX IF NOT EXISTS ix_user_roles_role                   ON user_roles (role_id);
CREATE INDEX IF NOT EXISTS ix_refresh_tokens_user               ON refresh_tokens (user_id);
CREATE INDEX IF NOT EXISTS ix_position_requirement_items_competency ON position_requirement_items (competency_id);
CREATE INDEX IF NOT EXISTS ix_task_assignments_employee_status  ON task_assignments (employee_id, status);
CREATE INDEX IF NOT EXISTS ix_task_submissions_assignment       ON task_submissions (task_assignment_id, version_no DESC);
CREATE INDEX IF NOT EXISTS ix_course_assignments_employee       ON course_assignments (employee_id, status);
CREATE INDEX IF NOT EXISTS ix_enrollments_employee_status       ON enrollments (employee_id, status);

-- ----------------------------------------------------------------------------
-- 7. v2.3 chỉ còn 5 role: bỏ CERTIFICATE_VERIFIER
--    (xác thực chứng chỉ công khai không cần đăng nhập nên không cần role)
-- ----------------------------------------------------------------------------
DELETE FROM role_permissions WHERE role_id IN (SELECT id FROM roles WHERE code = 'CERTIFICATE_VERIFIER');
DELETE FROM user_roles       WHERE role_id IN (SELECT id FROM roles WHERE code = 'CERTIFICATE_VERIFIER');
DELETE FROM users            WHERE lower(email) = 'verifier@digitalent.ai';
DELETE FROM roles            WHERE code = 'CERTIFICATE_VERIFIER';

COMMIT;

-- ----------------------------------------------------------------------------
-- Kiểm tra sau khi chạy — cả 5 dòng phải ra "OK"
-- ----------------------------------------------------------------------------
SELECT 'employees.job_position_id nullable' AS muc,
       CASE WHEN is_nullable = 'YES' THEN 'OK' ELSE 'CHUA' END AS ket_qua
FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'job_position_id'
UNION ALL
SELECT 'assessments.code', CASE WHEN count(*) = 1 THEN 'OK' ELSE 'CHUA' END
FROM information_schema.columns WHERE table_name = 'assessments' AND column_name = 'code'
UNION ALL
SELECT 'question_banks.owner_user_id', CASE WHEN count(*) = 1 THEN 'OK' ELSE 'CHUA' END
FROM information_schema.columns WHERE table_name = 'question_banks' AND column_name = 'owner_user_id'
UNION ALL
SELECT 'so bang con thieu updated_at', CASE WHEN count(*) = 0 THEN 'OK' ELSE 'CHUA: ' || count(*) END
FROM (
    SELECT c.table_name FROM information_schema.columns c
    WHERE c.table_schema = 'public' AND c.column_name = 'id'
    AND NOT EXISTS (SELECT 1 FROM information_schema.columns x
                    WHERE x.table_schema = 'public' AND x.table_name = c.table_name AND x.column_name = 'updated_at')
) t
UNION ALL
SELECT 'so role (phai la 5)', CASE WHEN count(*) = 5 THEN 'OK' ELSE 'CHUA: ' || count(*) END FROM roles;
