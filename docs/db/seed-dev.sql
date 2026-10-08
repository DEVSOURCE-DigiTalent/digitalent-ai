-- ============================================================================
-- DigiTalent AI — Seed dữ liệu để chạy thử (development)
--
-- Tạo: 1 tổ chức, 4 role persisted, các quyền tối thiểu của script,
--      4 tài khoản theo role, 3 tài khoản cá nhân và 2 phòng ban mẫu.
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
    (gen_random_uuid(), 'PLATFORM_ADMIN', 'Platform Administrator', 'Quản trị nền tảng DigiTalent',          'GLOBAL',       'ACTIVE'),
    (gen_random_uuid(), 'OWNER',          'Enterprise Owner',       'Quản trị toàn tổ chức và nội dung nội bộ', 'ORGANIZATION', 'ACTIVE'),
    (gen_random_uuid(), 'MANAGER',        'Department Manager',      'Quản lý nhân viên trong phòng ban',    'DEPARTMENT',   'ACTIVE'),
    (gen_random_uuid(), 'EMPLOYEE',       'Employee',                'Nhân viên học và làm bài tập',         'SELF',         'ACTIVE')
ON CONFLICT (code) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 3. Mã quyền — thêm module nào thì bổ sung ở đây (mã lấy từ doc 09 mục 6)
-- ----------------------------------------------------------------------------
INSERT INTO permissions (id, code, module, action, description)
VALUES
    (gen_random_uuid(), 'account.view_own',           'account',    'view_own',      'Xem tài khoản của chính mình'),
    (gen_random_uuid(), 'department.read',            'department', 'read',          'Xem danh sách / chi tiết phòng ban'),
    (gen_random_uuid(), 'department.create_update',   'department', 'create_update', 'Tạo, sửa, xóa phòng ban'),
    (gen_random_uuid(), 'audit_log.read_system',       'audit_log',     'read_system', 'Xem nhật ký toàn hệ thống'),
    (gen_random_uuid(), 'system_config.manage',        'system_config', 'manage', 'Quản lý cấu hình nền tảng')
ON CONFLICT (code) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 4. Role nào có quyền nào (mọi role đều cần quyền tường minh)
-- ----------------------------------------------------------------------------
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON TRUE
WHERE (r.code, p.code) IN (
    ('PLATFORM_ADMIN', 'account.view_own'),
    ('PLATFORM_ADMIN', 'audit_log.read_system'),
    ('PLATFORM_ADMIN', 'system_config.manage'),
    ('OWNER',          'account.view_own'),
    ('OWNER',          'department.read'),
    ('OWNER',          'department.create_update'),
    ('MANAGER',        'account.view_own'),
    ('MANAGER',        'department.read'),
    ('EMPLOYEE',       'account.view_own'),
    ('EMPLOYEE',       'department.read')
)
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- 5. Tài khoản demo — mật khẩu đều là Admin@1234
-- ----------------------------------------------------------------------------
INSERT INTO users (id, organization_id, email, password_hash, display_name, status, failed_login_count, created_at, updated_at)
VALUES
    (gen_random_uuid(), NULL,                                           'platform@digitalent.ai', crypt('Admin@1234', gen_salt('bf', 11)), 'Platform Administrator', 'ACTIVE', 0, now(), now()),
    (gen_random_uuid(), 'a0000000-0000-0000-0000-000000000001',       'owner@digitalent.ai',    crypt('Admin@1234', gen_salt('bf', 11)), 'Enterprise Owner',       'ACTIVE', 0, now(), now()),
    (gen_random_uuid(), 'a0000000-0000-0000-0000-000000000001',       'manager@digitalent.ai',  crypt('Admin@1234', gen_salt('bf', 11)), 'Department Manager',      'ACTIVE', 0, now(), now()),
    (gen_random_uuid(), 'a0000000-0000-0000-0000-000000000001',       'employee@digitalent.ai', crypt('Admin@1234', gen_salt('bf', 11)), 'Employee',                'ACTIVE', 0, now(), now()),
    (gen_random_uuid(), NULL,                                           'personal@digitalent.ai', crypt('Admin@1234', gen_salt('bf', 11)), 'Bùi Thị Cá Nhân',         'ACTIVE', 0, now(), now()),
    (gen_random_uuid(), NULL,                                           'trial@digitalent.ai',    crypt('Admin@1234', gen_salt('bf', 11)), 'Lý Văn Dùng Thử',         'ACTIVE', 0, now(), now()),
    (gen_random_uuid(), NULL,                                           'free@digitalent.ai',     crypt('Admin@1234', gen_salt('bf', 11)), 'Mai Thị Miễn Phí',        'ACTIVE', 0, now(), now())
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- 6. Gán role cho từng tài khoản
-- ----------------------------------------------------------------------------
INSERT INTO user_roles (user_id, role_id, assigned_at)
SELECT u.id, r.id, now()
FROM users u
JOIN roles r ON TRUE
WHERE (lower(u.email), r.code) IN (
    ('platform@digitalent.ai', 'PLATFORM_ADMIN'),
    ('owner@digitalent.ai',    'OWNER'),
    ('manager@digitalent.ai',  'MANAGER'),
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
