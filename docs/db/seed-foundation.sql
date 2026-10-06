-- Seed dữ liệu nền cho Production DB (chạy trước seed-curriculum.sql)
-- Chạy trong DBeaver: Alt+X

-- 1. Organization (chỉ thêm nếu chưa có)
INSERT INTO organizations (id, code, name, status, created_at, updated_at)
SELECT gen_random_uuid(), 'DIGITALENT', 'DigiTalent Demo Company', 'ACTIVE', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE code = 'DIGITALENT');

-- 2. Roles (chỉ thêm nếu chưa có)
INSERT INTO roles (id, code, name, scope_type, status, created_at, updated_at)
SELECT gen_random_uuid(), v.code, v.name, v.scope_type, 'ACTIVE', now(), now()
FROM (VALUES
  ('SYSTEM_ADMIN',      'System Administrator',  'GLOBAL'),
  ('HR_MANAGER',         'HR / Training Manager', 'ORGANIZATION'),
  ('DEPARTMENT_MANAGER', 'Department Manager',    'DEPARTMENT'),
  ('TRAINER',            'Internal Trainer',      'SELF'),
  ('EMPLOYEE',           'Employee',              'SELF')
) AS v(code, name, scope_type)
WHERE NOT EXISTS (SELECT 1 FROM roles r WHERE r.code = v.code);

-- 3. Admin user (password: Admin@1234, chỉ thêm nếu chưa có)
INSERT INTO users (id, organization_id, email, display_name, password_hash, status, failed_login_count, created_at, updated_at)
SELECT gen_random_uuid(),
       (SELECT id FROM organizations WHERE code = 'DIGITALENT'),
       'admin@digitalent.ai',
       'System Admin',
       '$2b$12$rlgaReb0FmfvQFr68KPqJ.uBRT6.J59EYSsPw33c3xNajlF0y3HzO',
       'ACTIVE', 0, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@digitalent.ai');

-- 4. Gán SYSTEM_ADMIN role cho admin user
INSERT INTO user_roles (user_id, role_id, assigned_at)
SELECT
  (SELECT id FROM users WHERE email = 'admin@digitalent.ai'),
  (SELECT id FROM roles WHERE code = 'SYSTEM_ADMIN'),
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_id = (SELECT id FROM users WHERE email = 'admin@digitalent.ai')
    AND role_id = (SELECT id FROM roles WHERE code = 'SYSTEM_ADMIN')
);

-- Done: 1 org, 5 roles, 1 admin user
