-- ============================================================================
-- DigiTalent AI — Seed dữ liệu để chạy thử (development)
--
-- Tạo: 1 tổ chức, 5 role, 3 mã quyền đang dùng, mapping role-quyền,
--      5 tài khoản demo (mỗi role 1 cái) và 2 phòng ban mẫu.
--
-- Mật khẩu chung: Admin@1234
-- Mật khẩu được PostgreSQL mã hóa BCrypt (extension pgcrypto), khớp với
-- BCrypt.Net mà backend dùng để kiểm tra khi đăng nhập.
--
-- Chạy lại nhiều lần cũng không sao: dòng nào đã có thì bỏ qua.
-- Cách chạy: mở file này trong DBeaver (đang nối tới Neon) rồi Execute script (Alt+X).
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. Tổ chức
-- ----------------------------------------------------------------------------
INSERT INTO organizations (id, code, name, domain, status, created_at, updated_at)
VALUES ('a0000000-0000-0000-0000-000000000001', 'DIGITALENT', 'DigiTalent AI', 'digitalent.ai', 'ACTIVE', now(), now())
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2. Role (doc 09 mục 3) — mã phải khớp với Domain/Constants/Authorization/Roles.cs
-- ----------------------------------------------------------------------------
INSERT INTO roles (id, code, name, description, scope_type, status)
VALUES
    (gen_random_uuid(), 'SYSTEM_ADMIN',         'System Admin',         'Quản trị hệ thống, có mọi quyền',      'GLOBAL',       'ACTIVE'),
    (gen_random_uuid(), 'HR_MANAGER',           'HR / Training Manager', 'Quản lý đào tạo toàn tổ chức',        'ORGANIZATION', 'ACTIVE'),
    (gen_random_uuid(), 'DEPARTMENT_MANAGER',   'Department Manager',   'Quản lý nhân viên trong phòng ban',    'DEPARTMENT',   'ACTIVE'),
    (gen_random_uuid(), 'TRAINER',              'Internal Trainer',     'Biên soạn khóa học và đề kiểm tra',    'ORGANIZATION', 'ACTIVE'),
    (gen_random_uuid(), 'EMPLOYEE',             'Employee',             'Nhân viên học và làm bài tập',         'SELF',         'ACTIVE')
ON CONFLICT (code) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 3. Mã quyền — thêm module nào thì bổ sung ở đây (mã lấy từ doc 09 mục 6)
-- ----------------------------------------------------------------------------
INSERT INTO permissions (id, code, module, action, description)
VALUES
    (gen_random_uuid(), 'account.view_own',           'account',    'view_own',      'Xem tài khoản của chính mình'),
    (gen_random_uuid(), 'department.read',            'department', 'read',          'Xem danh sách / chi tiết phòng ban'),
    (gen_random_uuid(), 'department.create_update',   'department', 'create_update', 'Tạo, sửa, xóa phòng ban')
ON CONFLICT (code) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 4. Role nào có quyền nào (SYSTEM_ADMIN không cần, backend cho đi qua hết)
-- ----------------------------------------------------------------------------
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON TRUE
WHERE (r.code, p.code) IN (
    ('HR_MANAGER',           'account.view_own'),
    ('HR_MANAGER',           'department.read'),
    ('HR_MANAGER',           'department.create_update'),
    ('DEPARTMENT_MANAGER',   'account.view_own'),
    ('DEPARTMENT_MANAGER',   'department.read'),
    ('TRAINER',              'account.view_own'),
    ('TRAINER',              'department.read'),
    ('EMPLOYEE',             'account.view_own'),
    ('EMPLOYEE',             'department.read')
)
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- 5. Tài khoản demo — mật khẩu đều là Admin@1234
-- ----------------------------------------------------------------------------
INSERT INTO users (id, organization_id, email, password_hash, display_name, status, failed_login_count, created_at, updated_at)
VALUES
    (gen_random_uuid(), 'a0000000-0000-0000-0000-000000000001', 'admin@digitalent.ai',    crypt('Admin@1234', gen_salt('bf', 11)), 'System Admin',         'ACTIVE', 0, now(), now()),
    (gen_random_uuid(), 'a0000000-0000-0000-0000-000000000001', 'hr@digitalent.ai',       crypt('Admin@1234', gen_salt('bf', 11)), 'HR Manager',           'ACTIVE', 0, now(), now()),
    (gen_random_uuid(), 'a0000000-0000-0000-0000-000000000001', 'manager@digitalent.ai',  crypt('Admin@1234', gen_salt('bf', 11)), 'Department Manager',   'ACTIVE', 0, now(), now()),
    (gen_random_uuid(), 'a0000000-0000-0000-0000-000000000001', 'trainer@digitalent.ai',  crypt('Admin@1234', gen_salt('bf', 11)), 'Trainer',              'ACTIVE', 0, now(), now()),
    (gen_random_uuid(), 'a0000000-0000-0000-0000-000000000001', 'employee@digitalent.ai', crypt('Admin@1234', gen_salt('bf', 11)), 'Employee',             'ACTIVE', 0, now(), now())
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- 6. Gán role cho từng tài khoản
-- ----------------------------------------------------------------------------
INSERT INTO user_roles (user_id, role_id, assigned_at)
SELECT u.id, r.id, now()
FROM users u
JOIN roles r ON TRUE
WHERE (lower(u.email), r.code) IN (
    ('admin@digitalent.ai',    'SYSTEM_ADMIN'),
    ('hr@digitalent.ai',       'HR_MANAGER'),
    ('manager@digitalent.ai',  'DEPARTMENT_MANAGER'),
    ('trainer@digitalent.ai',  'TRAINER'),
    ('employee@digitalent.ai', 'EMPLOYEE')
)
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- 7. Vài phòng ban mẫu để test API danh sách
-- ----------------------------------------------------------------------------
INSERT INTO departments (id, organization_id, code, name, description, status, created_at, updated_at)
VALUES
    (gen_random_uuid(), 'a0000000-0000-0000-0000-000000000001', 'IT', 'Phòng Công nghệ thông tin', 'Phát triển và vận hành hệ thống', 'ACTIVE', now(), now()),
    (gen_random_uuid(), 'a0000000-0000-0000-0000-000000000001', 'HR', 'Phòng Nhân sự',             'Tuyển dụng và đào tạo',          'ACTIVE', now(), now())
ON CONFLICT DO NOTHING;

COMMIT;

-- ----------------------------------------------------------------------------
-- Kiểm tra sau khi chạy
-- ----------------------------------------------------------------------------
SELECT u.email, r.code AS role, count(rp.permission_id) AS so_quyen
FROM users u
JOIN user_roles ur ON ur.user_id = u.id
JOIN roles r       ON r.id = ur.role_id
LEFT JOIN role_permissions rp ON rp.role_id = r.id
GROUP BY u.email, r.code
ORDER BY u.email;
