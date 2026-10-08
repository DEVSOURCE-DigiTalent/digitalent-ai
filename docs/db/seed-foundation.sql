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
  ('PLATFORM_ADMIN', 'Platform Administrator', 'GLOBAL'),
  ('OWNER',          'Enterprise Owner',       'ORGANIZATION'),
  ('MANAGER',        'Department Manager',      'DEPARTMENT'),
  ('EMPLOYEE',       'Employee',                'SELF')
) AS v(code, name, scope_type)
WHERE NOT EXISTS (SELECT 1 FROM roles r WHERE r.code = v.code);

-- 3. Platform admin (password: Admin@1234, chỉ dùng cho môi trường demo)
INSERT INTO users (id, organization_id, email, display_name, password_hash, status, failed_login_count, created_at, updated_at)
SELECT gen_random_uuid(),
       NULL,
       'platform@digitalent.ai',
       'Platform Administrator',
       '$2b$12$rlgaReb0FmfvQFr68KPqJ.uBRT6.J59EYSsPw33c3xNajlF0y3HzO',
       'ACTIVE', 0, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'platform@digitalent.ai');

-- 4. Gán PLATFORM_ADMIN role cho platform user
INSERT INTO user_roles (user_id, role_id, assigned_at)
SELECT
  (SELECT id FROM users WHERE email = 'platform@digitalent.ai'),
  (SELECT id FROM roles WHERE code = 'PLATFORM_ADMIN'),
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_id = (SELECT id FROM users WHERE email = 'platform@digitalent.ai')
    AND role_id = (SELECT id FROM roles WHERE code = 'PLATFORM_ADMIN')
);

-- Done: 1 org, 4 roles, 1 platform admin
